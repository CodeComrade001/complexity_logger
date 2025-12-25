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
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ normalized:", normalized);

      if (!Object.keys(normalized).length) {
        return { success: false, message: "No analyzable code found" };
      }

      const freeReport = await this.tierRunner.runFree(normalized);
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ freeReport:", freeReport);
      const paidReport = await this.tierRunner.runPaid(normalized);
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ paidReport:", paidReport);

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
