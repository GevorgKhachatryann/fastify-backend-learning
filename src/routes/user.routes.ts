import { FastifyInstance } from "fastify";
import { register, login, refresh, removeUser } from "../controllers/user.controller.js";

export default async function userRoutes(app: FastifyInstance) {
  app.post("/users", register);
  app.post("/login", login);
  app.post("/refresh", refresh);

  app.delete(
    "/users/:id",
    { preHandler: [app.authenticate, app.authorize('admin')] },
    removeUser
  );
}