import { FastifyRequest, FastifyReply } from 'fastify';

export async function getHealth(req: FastifyRequest, reply: FastifyReply) {
  await req.server.prisma.$queryRaw`SELECT 1`;
  return reply.code(200).send({ status: 'ok', db: 'connected' });
}