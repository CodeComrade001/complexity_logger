import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fileRoute from "../../module/routes/fileRoute.js";
import { WorkerClient } from "../../module/worker/workerClient.js";
import { CreateCompiler } from "../../compilers/TS_JS_Compiler/ts_js_bootstrap.js";

export async function createApp() {
  const app = fastify({ logger: true });

  // ---------- CROSS ORIGIN ----------
  await app.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  });

  // ---------- FILE UPLOAD ----------
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 200 * 1024,
      files: 300,
    },
  });

  // ---------- GLOBAL SERVICES ----------
  app.decorate("workerClient", new WorkerClient());


  // ---------- COMPILER SERVICES ----------
  app.decorate("ts_js_compiler", new CreateCompiler());

  // ---------- ROUTES ----------
  await app.register(fileRoute, { prefix: "/api/file" });

  // ---------- ERROR HANDLING ----------
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: "Not found" });
  });

  app.setErrorHandler((error: any, _req, reply) => {
    reply.code(500).send({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message,
    });
  });

  return app;
}