import fastify from "fastify";
import { createPostgresPool } from "../../infra/db/postgres";
import { createMongooseConnection } from "../../infra/db/mongo";
import mongoose from "mongoose";
import compiler_plugin from "../../compiler/plugins/compiler_plugin";
import fileRoute from "../../module/mvp_file";

export async function createApp() {
  // create fastify instance
  const app = fastify({ logger: true });


  // create infra (do this once at startup)
  const pgPool = await createPostgresPool();
  const mongooseConn = await createMongooseConnection();

  // Decorate fastify instance with infra resources (typed via declaration merging in real project)
  ; (app as any).pgPool = pgPool;
  ; (app as any).mongoose = mongooseConn;

  // Example: create + register model and attach to fastify for modules to reuse
  const fileSchema = new mongoose.Schema({ data: {} }, { strict: false });
  const FileModel = mongooseConn.model("File", fileSchema);
  ; (app as any).FileModel = FileModel;

  // register plugins first
  app.register(compiler_plugin);

  // register your module routes
  app.register(fileRoute, { prefix: "/api/file" });

  // app-wide error handlers or hooks can be added here
  app.setNotFoundHandler((_req, reply) => reply.status(404).send({ error: "Not found" }));
  app.setErrorHandler((error: any, _req, reply) => {
    // centralized mapping
    reply.status(500).send({ error: "Internal Server Error", details: process.env.NODE_ENV !== "production" ? error?.message : undefined });
  });

  return app;
}
