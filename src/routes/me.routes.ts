import { FastifyInstance } from 'fastify';

export default async function meRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: app.authenticate }, async (req, reply) => {
    return reply.code(200).send({ user: req.user });
  });
}