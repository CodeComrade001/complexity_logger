import { AnalysisSummary } from "../interfaces/complexityGeneratorInterface.js";
import { ComplexityOrchestrator_v1 } from "./complexityGenerator_v1/complexity_orchestrator.js";
import { FilePayload } from "./complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { PayloadNormalizer } from "./complexityOrchestratorHelpers/payloadNormalizer.js";
import { TierRunner } from "./complexityOrchestratorHelpers/tierRunner.js";

export class GetComplexityGenerator {
  private normalizer = new PayloadNormalizer();
  private tierRunner: TierRunner;

  constructor(engine: ComplexityOrchestrator_v1) {
    this.tierRunner = new TierRunner(engine);
  }

  public async execute(payload: FilePayload): Promise<{ success: boolean, message: string, data: AnalysisSummary | null }> {
    try {
      const normalized = this.normalizer.normalize(payload);

      if (!normalized) {
        return { success: false, message: "No analyzable code found", data: null };
      }

      if (!Object.keys(normalized).length) {
        return { success: false, message: "No analyzable code found", data: null };
      }

      const reportGenerated = await this.tierRunner.runFree(normalized);
      // const reportGenerated = await this.tierRunner.runPaid(normalized);

      return {
        success: true,
        message: "Complexity analysis complete",
        data: reportGenerated
      };
    } catch (error) {
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ error:", error);
      return { success: false, message: "Compiler Execute error", data: null };
    }
  }
}
