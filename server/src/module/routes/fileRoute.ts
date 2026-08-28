import { FileController } from "../adapters/controllers/FileController.js";
import { PostgresFileRepository } from "../adapters/repositories/PostgresFileRepository.js";
import { MongoFileRepository } from "../adapters/repositories/MongoFileRepository.js";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * This plugin uses the DI-provided resources on fastify (postgres pool / mongoose model).
 * The composition root could also create repos and pass them in via options instead.
 */
export default async function fileRoute(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // gather infra from fastify decorators (set at bootstrap)
  const pgPool = (fastify as any).pgPool; // typed in composition root
  const workerClient = (fastify as any).workerClient; // typed in composition root
  const mongoose = (fastify as any).mongoose; // typed in composition root

  // choose repository implementation depending on your infra
  const postgresRepo = new PostgresFileRepository(pgPool);
  const mongoRepo = new MongoFileRepository(mongoose);

  const controller = new FileController(postgresRepo, mongoRepo, workerClient);


  fastify.post("/repos/csharp/analyze", controller.getCsharpAnalyzer.bind(controller));
  fastify.post("/repos/go/analyze", controller.getGoFileAnalyzer.bind(controller));
  fastify.post("/repos/java/analyze", controller.getJavaFileAnalyzer.bind(controller));
  fastify.post("/repos/python/analyze", controller.getPythonFileAnalyzer.bind(controller));
  fastify.post("/repos/rust/analyze", controller.getRustFileAnalyzer.bind(controller));
  fastify.post("/repos/js/analyze", controller.get_js_ts_Analyzer.bind(controller));
}
