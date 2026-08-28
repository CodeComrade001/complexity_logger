import Fastify from "fastify";

import { compilerRoutes } from "./routes/compiler.routes.js";
import cors from '@fastify/cors';

export async function createApp() {
  const app = Fastify({
    logger: true,
  });



  app.get("/health", async (_request, reply) => {
    return reply.send({
      success: true,
      service: "java-compiler",
      status: "healthy",
    });
  });

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  });

  app.register(compilerRoutes);

  return app;
}