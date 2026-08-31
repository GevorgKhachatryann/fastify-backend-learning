import { FastifyRequest, FastifyReply } from "fastify";
import { userSchema, loginSchema, refreshTokenSchema } from "../schemas/user.schema.js";
import { registerUser, loginUser, refreshAccessToken, deleteUser } from "../services/user.service.js";

export async function register(req: FastifyRequest, reply: FastifyReply) {
  const data = userSchema.parse(req.body); // throws ZodError -> caught globally
  const user = await registerUser(data);   // Prisma P2002 -> caught globally
  return reply.code(201).send(user);
}

export async function login(req: FastifyRequest, reply: FastifyReply) {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data); // throws AuthError -> caught globally
  return reply.code(200).send(result);
}

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  const data = refreshTokenSchema.parse(req.body);
  const result = await refreshAccessToken(data.refreshToken); // throws AuthError -> caught globally
  return reply.code(200).send(result);
}

export async function removeUser(req: FastifyRequest, reply: FastifyReply) {
  const id = Number((req.params as { id: string }).id);

  if (isNaN(id)) {
    return reply.code(400).send({ error: "Invalid user id" });
  }

  await deleteUser(id); // Prisma P2025 -> caught globally as 404
  return reply.code(204).send();
}