import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { prisma } from './prisma.js';

export default fp(async (app: FastifyInstance) => {
  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});