import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export default fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = payload as any;
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  app.decorate('authorize', (...allowedRoles: string[]) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return reply.code(403).send({ error: 'Forbidden: insufficient permissions' });
      }
    };
  });
});