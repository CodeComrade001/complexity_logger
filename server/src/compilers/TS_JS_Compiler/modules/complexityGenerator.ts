// GetComplexityGenerator.ts

import { get_Js_Ts_Compiler } from "../../allCompilerInstance.js";
import { AnalysisSummary } from "../interfaces/complexityGeneratorInterface.js";
import { ComplexityOrchestrator_v1 } from "./complexityGenerator_v1/complexity_orchestrator.js";
import { FilePayload, normalizedPayloadData } from "./complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { TierRunner } from "./complexityOrchestratorHelpers/tierRunner.js";

export class GetComplexityGenerator {
  private tierRunner: TierRunner;

  constructor(
    engine: ComplexityOrchestrator_v1,
  ) {
    this.tierRunner = new TierRunner(engine);
  }

  public async execute(
    payload: FilePayload
  ): Promise<{ success: boolean; message: string; data: AnalysisSummary | null }> {
    try {
      //Get singleton create compiler instance
      const compiler = get_Js_Ts_Compiler()

      const normalized = compiler.utils.normalize(payload); // ✅ no compiler creation

      if (!normalized || !Object.keys(normalized).length || normalized === null) {
        return {
          success: false,
          message: "No analyzable code found",
          data: null,
        };
      }

      const reportGenerated = await this.tierRunner.runPaid(normalized);

      return {
        success: true,
        message: "Complexity analysis complete",
        data: reportGenerated,
      };
    } catch (error) {
      return {
        success: false,
        message: "Compiler Execute error",
        data: null,
      };
    }
  }
}