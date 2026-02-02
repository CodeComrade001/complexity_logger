import { ComplexityOrchestrator_v1 } from "./complexityGenerator_v1/complexity_orchestrator";
import { FilePayload } from "./complexityOrchestratorHelpers/complexityOrchestratorInterface";
import { ErrorBoundary } from "./complexityOrchestratorHelpers/ErrorBoundary";
import { PayloadNormalizer } from "./complexityOrchestratorHelpers/payloadNormalizer";
import { TierRunner } from "./complexityOrchestratorHelpers/tierRunner";

export class GetComplexityGenerator {
  private normalizer = new PayloadNormalizer();
  private tierRunner: TierRunner;

  constructor(engine: ComplexityOrchestrator_v1) {
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

      const reportGenerated = await this.tierRunner.runFree(normalized);
      // const reportGenerated = await this.tierRunner.runPaid(normalized);

      return {
        success: true,
        message: "Complexity analysis complete",
        data: {
          freeComplexityReport: reportGenerated
          // paidComplexityReport: paidReport,
        },
      };
    } catch (error) {
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ error:", error);
      return ErrorBoundary.handle("GetComplexityGenerator.execute", error);
    }
  }
}
