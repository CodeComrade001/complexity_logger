import Fastify from "fastify";
import cors from "@fastify/cors";

import { CompilerRoutes } from "./routes/compiler.routes.js";

import { ResultStore } from "./storage/result.store.js";
import { WorkerClient } from "./worker/workerClient.js";
import { Js_Ts_CompilerService } from "./compiler/compiler.service.js";

export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  /*
   * Composition root
   */

  const resultStore = new ResultStore();

  const workerClient = new WorkerClient();

  const compilerService =
    new Js_Ts_CompilerService(
      resultStore,
      workerClient
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