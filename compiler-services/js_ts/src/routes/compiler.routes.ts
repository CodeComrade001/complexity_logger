import type { FastifyInstance } from "fastify";

import type {
  CompilerPayload,
} from "../compiler/compiler.interface.js";

import type {
  Js_Ts_CompilerService,
} from "../compiler/compiler.service.js";

interface AnalyzeBody {
  payload: CompilerPayload | CompilerPayload[];
}

interface ResultParams {
  jobId: string;
}

export class CompilerRoutes {
  private readonly compilerService: Js_Ts_CompilerService;

  constructor(
    compilerService: Js_Ts_CompilerService,
  ) {
    this.compilerService = compilerService;
  }

  public async register(
    app: FastifyInstance
  ): Promise<void> {

    /**
     * POST /compiler/analyze
     */
    app.post<{
      Body: AnalyzeBody;
    }>("/compiler/analyze", async (request, reply) => {
      const { payload } = request.body;

      if (!payload) {
        console.error(
          "Turbo Log ~ CompilerRoutes ~ payload is missing"
        );

        return reply.code(400).send({
          success: false,
          message: "payload is required",
        });
      }

      try {
        const jobId =
          await this.compilerService.submit(payload);

        console.log(
          "Turbo Log ~ CompilerRoutes ~ jobId:",
          jobId
        );

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
     */
    app.get<{
      Params: ResultParams;
    }>("/compiler/result/:jobId", async (request, reply) => {
      const { jobId } = request.params;

      const result =
        this.compilerService.getResult(jobId);

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
     */
    app.get(
      "/compiler/status",
      async (_request, reply) => {
        return reply.send({
          success: true,
          data: this.compilerService.getStatus(),
        });
      }
    );
  }
}