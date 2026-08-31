import { prisma } from "../plugins/prisma.js";
import { UserSchema } from "../schemas/user.schema.js";

export function createUser(data: { email: string; passwordHash: string }) {
  return prisma.user.create({ data });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export function deleteUserById(id: number) {
  return prisma.user.delete({ where: { id } });
}