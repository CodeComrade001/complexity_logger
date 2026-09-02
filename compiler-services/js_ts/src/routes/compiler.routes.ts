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