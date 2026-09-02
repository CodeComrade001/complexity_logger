import type { FastifyInstance } from "fastify";

import { CSharpCompilerService } from "../compiler/compiler.service.js";
import { ResultStore } from "../storage/result.store.js";
import { MongoFileRepository } from "../repositories/MongoFileRepository.js";

import { JobModel } from "../models/job.model.js";

import type {
  CompilerPayload,
} from "../compiler/compiler.interface.js";

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

  const mongoRepo =
    new MongoFileRepository(JobModel);

  const compilerService =
    new CSharpCompilerService(
      resultStore,
      mongoRepo
    );

  // app.post<{
  //   Body: AnalyzeBody;
  // }>("/compiler/analyze", async (request, reply) => {

  //   const { payload } = request.body;

  //   if (!payload) {
  //     return reply.code(400).send({
  //       success: false,
  //       message: "payload is required",
  //     });
  //   }

  //   try {
  //     const jobId = await compilerService.submit(payload);

  //     return reply.code(202).send({
  //       success: true,
  //       message: "C# compiler job accepted",
  //       jobId,
  //     });

  //   } catch (error) {
  //     return reply.code(400).send({
  //       success: false,
  //       message:
  //         error instanceof Error
  //           ? error.message
  //           : "Failed to submit compiler job",
  //     });
  //   }
  // });

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