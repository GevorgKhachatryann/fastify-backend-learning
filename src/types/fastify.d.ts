import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (...roles: string[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      userId: number;
      email: string;
      role: string;
    };
  }
}