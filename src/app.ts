import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dbPlugin from './plugins/db.plugin.js';
import authPlugin from './plugins/auth.plugin.js';
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import meRoutes from './routes/me.routes.js';
import errorHandlerPlugin from './plugins/error-handler.plugin.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(errorHandlerPlugin);

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Backend Learning Project API',
        description: 'Auth API built with Fastify, TypeScript, Prisma, and JWT',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  app.register(dbPlugin);
  app.register(authPlugin);
  app.register(healthRoutes);
  app.register(userRoutes);
  app.register(meRoutes);
  return app;
}