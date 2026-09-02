import Fastify from "fastify";

import { compilerRoutes } from "./routes/compiler.routes.js";
import cors from '@fastify/cors';
import { startCompilerConsumer } from "./infra/messaging/consumer.js";
import { createMongooseConnection } from "./infra/db/mongo/index.js";

export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  await createMongooseConnection()

  app.get("/health", async (_request, reply) => {
    return reply.send({
      success: true,
      service: "python-compiler",
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