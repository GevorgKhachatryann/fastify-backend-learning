import { FastifyInstance } from 'fastify';
import { getHealth } from '../controllers/health.controller.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', getHealth);
}