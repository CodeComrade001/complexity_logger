import type { FastifyInstance } from "fastify";

import { GoCompilerService } from "../compiler/compiler.service.js";
import { ResultStore } from "../storage/result.store.js";

import type {
  CompilerPayload,
} from "../compiler/compiler.interface.js";
import { startCompilerConsumer } from "../infra/messaging/consumer.js";
import { MongoFileRepository } from "../repositories/MongoFileRepository.js";
import { JobModel } from "../models/job.model.js";

interface AnalyzeBody {
  payload: CompilerPayload | CompilerPayload[];
}

interface ResultParams {
  jobId: string;
}

export async function compilerRoutes(
  app: FastifyInstance
): Promise<void> {
  const resultStore = new ResultStore();

  const mongoRepo = new MongoFileRepository(JobModel);

  const compilerService =
    new GoCompilerService(resultStore, mongoRepo);

  await startCompilerConsumer(compilerService, mongoRepo);



  /**
   * GET /compiler/result/:jobId
   *
   * Fetch the result of a compiler job.
   */
  app.get<{
    Params: ResultParams;
  }>("/compiler/result/:jobId", async (request, reply) => {
    const { jobId } = request.params;

    const result =
      compilerService.getResult(jobId);

    if (!result) {
      return reply.code(404).send({
        success: false,
        message: "Compiler result not found",
        jobId,
      });
    }

    return reply.send({
      success: true,
      data: result,
    });
  });

  /**
   * GET /compiler/status
   *
   * Returns the current state of the compiler service.
   */
  app.get(
    "/compiler/status",
    async (_request, reply) => {
      return reply.send({
        success: true,
        data: compilerService.getStatus(),
      });
    }
  );
}