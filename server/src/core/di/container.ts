import fastify from "fastify";
import { createPostgresPool } from "../../infra/db/postgres";
import { createMongooseConnection } from "../../infra/db/mongo";
import compiler_plugin from "../../compiler/plugins/compiler_plugin";
import fileRoute from "../../module";
import cors from '@fastify/cors';

export async function createApp() {
  const app = fastify({ logger: true });

  // ---------- CROSS ORIGIN ----------
  await app.register(cors, {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true, // Allow cookies, authorization headers, etc.
  })

  // ---------- INFRA ----------
  // const pgPool = await createPostgresPool();
  // const mongoose = await createMongooseConnection();

  // app.decorate("pgPool", pgPool);
  // app.decorate("mongoose", mongoose);

  // Mongo models
  // const fileSchema = new mongoose.Schema({ data: {} }, { strict: false });
  // const FileModel = mongoose.model("File", fileSchema);
  // app.decorate("FileModel", FileModel);

  // ---------- PLUGINS ----------
  await app.register(compiler_plugin);

  // ---------- ROUTES ----------
  await app.register(fileRoute, { prefix: "/api/file" });

  // ---------- ERROR HANDLING ----------
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: "Not found" });
  });

  app.setErrorHandler((error: any, _req, reply) => {
    reply.code(500).send({
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "production" ? undefined : error?.message
    });
  });

  return app;
}