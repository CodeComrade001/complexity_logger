import type { FastifyInstance } from "fastify";

import { CSharpCompilerService } from "../compiler/compiler.service.js";
import { ResultStore } from "../storage/result.store.js";
import { MongoFileRepository } from "../repositories/MongoFileRepository.js";

import { JobModel } from "../models/job.model.js";

import type {
  CompilerPayload,
} from "../compiler/compiler.interface.js";
import { startCompilerConsumer } from "../infra/messaging/consumer.js";

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
    new CSharpCompilerService(
      resultStore,
      mongoRepo
    );


  await startCompilerConsumer(compilerService, mongoRepo);

  app.get<{
    Params: ResultParams;
  }>("/compiler/result/:jobId", async (request, reply) => {

    const { jobId } = request.params;

    const result = compilerService.getResult(jobId);

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