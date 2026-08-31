import bcrypt from "bcrypt";
import { createUser, deleteUserById, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import { UserSchema, LoginSchema } from "../schemas/user.schema.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createRefreshToken, findRefreshToken, deleteRefreshToken } from '../repositories/refreshToken.repository.js';
import { AuthError } from "../errors/app-error.js";

export async function registerUser(data: UserSchema) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await createUser({ email: data.email, passwordHash: hashedPassword });

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function loginUser(data: LoginSchema) {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password");
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await createRefreshToken({
    token: refreshTokenValue,
    userId: user.id,
    expiresAt,
  });

  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken: refreshTokenValue };
}

export async function refreshAccessToken(token: string) {
  const stored = await findRefreshToken(token);

  if (!stored || stored.expiresAt < new Date()) {
    throw new AuthError("Invalid or expired refresh token");
  }

  const user = await findUserById(stored.userId);

  if (!user) {
    throw new AuthError("Invalid or expired refresh token");
  }

  // Rotate: invalidate the old refresh token immediately
  await deleteRefreshToken(token);

  // Issue a brand new refresh token
  const newRefreshTokenValue = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await createRefreshToken({
    token: newRefreshTokenValue,
    userId: user.id,
    expiresAt,
  });

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  return { accessToken, refreshToken: newRefreshTokenValue };
}

export async function deleteUser(id: number) {
  return deleteUserById(id);
}