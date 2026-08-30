import Fastify from "fastify";
import cors from "@fastify/cors";

import { CompilerRoutes } from "./routes/compiler.routes.js";

import { ResultStore } from "./storage/result.store.js";
import { WorkerClient } from "./worker/workerClient.js";
import { Js_Ts_CompilerService } from "./compiler/compiler.service.js";
import { startCompilerConsumer } from "./infra/messaging/consumer.js";
import { createMongooseConnection } from "./infra/db/mongo/index.js";

export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  const mongoose = (app as any).mongoose; // typed in composition root

  /*
   * Composition root
   */

  await createMongooseConnection()

  await startCompilerConsumer();

  const resultStore = new ResultStore();

  const workerClient = new WorkerClient();

  const compilerService =
    new Js_Ts_CompilerService(
      resultStore,
      workerClient,
      mongoose
    );

  const compilerRoutes =
    new CompilerRoutes(compilerService);

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  });

  app.get("/health", async (_request, reply) => {
    return reply.send({
      success: true,
      service: "csharp-compiler",
      status: "healthy",
    });
  });

  await compilerRoutes.register(app);

  return app;
}