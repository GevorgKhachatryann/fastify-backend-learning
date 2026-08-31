import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/plugins/prisma.js';

export async function createTestApp() {
  const app = buildApp();
  await app.ready();
  return app;
}

export async function cleanDb() {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

// Creates a real admin user in the DB and returns a valid JWT for them,
// so tests can hit admin-only routes without going through /login.
export async function createAdminAndToken() {
  const passwordHash = await bcrypt.hash('adminpassword123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
    },
  });

  const token = jwt.sign(
    { userId: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  return { admin, token };
}

// Creates a regular (non-admin) user and returns their token —
// useful for testing that non-admins get 403 on admin routes.
export async function createUserAndToken() {
  const passwordHash = await bcrypt.hash('userpassword123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash,
      role: 'user',
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  return { user, token };
}