import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { FileController } from "../adapters/controllers/FileController.js";
import { PostgresFileRepository } from "../adapters/repositories/PostgresFileRepository.js";
import { MongoFileRepository } from "../adapters/repositories/MongoFileRepository.js";

/**
 * This plugin uses the DI-provided resources on fastify (postgres pool / mongoose model).
 * The composition root could also create repos and pass them in via options instead.
 */
export default async function fileRoute(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // gather infra from fastify decorators (set at bootstrap)
  const pgPool = (fastify as any).pgPool;       // typed in composition root
  const compiler = (fastify as any).compiler;   // typed in composition root
  const mongoose = (fastify as any).mongoose;  // typed in composition root

  // choose repository implementation depending on your infra
  const postgresRepo = new PostgresFileRepository(pgPool);
  const mongoRepo = new MongoFileRepository(mongoose);


  const controller = new FileController(postgresRepo, mongoRepo, compiler);


  fastify.post("/repos/js/analyze", controller.get_js_ts_Analyzer.bind(controller));
  fastify.post("/repos/go/analyze", controller.getGoFileAnalyzer.bind(controller));
  fastify.post("/repos/java/analyze", controller.getJavaFileAnalyzer.bind(controller));
  fastify.post("/repos/python/analyze", controller.getPythonFileAnalyzer.bind(controller));
  fastify.post("/repos/zig/analyze", controller.getZigFileAnalyzer.bind(controller));
  fastify.post("/repos/rust/analyze", controller.getRustFileAnalyzer.bind(controller));
  fastify.post("/repos/kotlin/analyze", controller.getKotlinFileAnalyzer.bind(controller));
}
