import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { FileController } from "../adapters/controllers/FileController";
import { PostgresFileRepository } from "../adapters/repositories/PostgresFileRepository";
// import { MongoFileRepository } from "../adapters/repositories/MongoFileRepository";

/**
 * This plugin uses the DI-provided resources on fastify (postgres pool / mongoose model).
 * The composition root could also create repos and pass them in via options instead.
 */
export default async function fileRoute(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: () => void
) {
  // gather infra from fastify decorators (set at bootstrap)
  const pgPool = (fastify as any).pgPool;       // typed in composition root
  const compiler = (fastify as any).compiler;   // typed in composition root
  // const mongooseModel = (fastify as any).FileModel;

  // choose repository implementation depending on your infra
  const repo = new PostgresFileRepository(pgPool);
  // const repo = new MongoFileRepository(mongooseModel);


  const controller = new FileController(repo, compiler);

  fastify.get("/health", controller.getHealth.bind(controller));
  fastify.get("/file/:id", controller.getFile.bind(controller));


  fastify.post("/repos/analyze", controller.getFileAnalyzer.bind(controller));
  fastify.get("/repos/{id}/report", controller.getSingleFileReport.bind(controller));
  fastify.post("/patches/apply", controller.getFilePatchApply.bind(controller));
  fastify.get("/user/me", controller.getUser.bind(controller));

  done();
}
