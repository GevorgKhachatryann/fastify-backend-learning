import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

async function errorHandlerPlugin(app: FastifyInstance) {
  console.log(">>> error handler plugin loaded"); // TEMP

  app.setErrorHandler((err: unknown, req, reply) => {
    console.log(">>> error handler triggered:", (err as any).code || (err as any).name); // TEMP

    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: "Validation failed",
        details: err.issues,
      });
    }

    if (err instanceof AppError) {
      return reply.code(err.statusCode).send({
        error: err.message,
        code: err.code,
      });
    }

    if ((err as any).code === "P2002") {
      return reply.code(409).send({ error: "Email already in use" });
    }

    if ((err as any).code === "P2025") {
      return reply.code(404).send({ error: "User not found" });
    }

    req.log.error(err);
    return reply.code(500).send({ error: "Internal server error" });
  });
}

export default fp(errorHandlerPlugin);