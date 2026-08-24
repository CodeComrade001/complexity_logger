import type { FastifyInstance } from "fastify";
import { ResultStore } from "../storage/result.store.js";

import type {
  CompilerPayload,
} from "../compiler/compiler.interface.js";
import { RustCompilerService } from "../compiler/compiler.service.js";

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

  const compilerService =
    new RustCompilerService(resultStore);

  /**
   * POST /compiler/analyze
   *
   * Accepts either:
   * - one compiler payload
   * - multiple compiler payloads
   */
  app.post<{
    Body: AnalyzeBody;
  }>("/compiler/analyze", async (request, reply) => {
    const { payload } = request.body;

    if (!payload) {
      console.error("Turbo Log  ~ compilerRoutes ~ payload is missing");
      return reply.code(400).send({
        success: false,
        message: "payload is required",
      });
    }

    try {
      const jobId = await compilerService.submit(payload);
      console.log("Turbo Log  ~ compilerRoutes ~ jobId:", jobId);

      return reply.code(202).send({
        success: true,
        message: "C# compiler job accepted",
        jobId,
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit compiler job",
      });
    }
  });

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