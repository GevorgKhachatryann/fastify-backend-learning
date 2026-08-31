import { prisma } from "../plugins/prisma.js";

export function createRefreshToken(data: { token: string; userId: number; expiresAt: Date }) {
  return prisma.refreshToken.create({ data });
}

export function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({ where: { token } });
}

export function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({ where: { token } });
}