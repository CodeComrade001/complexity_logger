import { EnhancedComplexityGenerator_v1 } from "./complexityGenerator_v1/enhanced_analyzer";
import { FilePayload } from "./complexityOrchestrator/complexityOrchestratorInterface";
import { ErrorBoundary } from "./complexityOrchestrator/ErrorBoundary";
import { PayloadNormalizer } from "./complexityOrchestrator/payloadNormalizer";
import { TierRunner } from "./complexityOrchestrator/tierRunner";

export class GetComplexityGenerator {
  private normalizer = new PayloadNormalizer();
  private tierRunner: TierRunner;

  constructor(engine: EnhancedComplexityGenerator_v1) {
    this.tierRunner = new TierRunner(engine);
  }

  public async execute(payload: FilePayload) {
    try {
      const normalized = this.normalizer.normalize(payload);

      if (!normalized) {
        return { success: false, message: "No analyzable code found" };
      }

      if (!Object.keys(normalized).length) {
        return { success: false, message: "No analyzable code found" };
      }

      const freeReport = await this.tierRunner.runFree(normalized);
      const paidReport = await this.tierRunner.runPaid(normalized);

      return {
        success: true,
        message: "Complexity analysis complete",
        data: {
          freeComplexityReport: freeReport,
          paidComplexityReport: paidReport,
        },
      };
    } catch (error) {
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ error:", error);
      return ErrorBoundary.handle("GetComplexityGenerator.execute", error);
    }
  }
}
