import { WorkerClient } from "../../../worker/workerClient.js";
import CompilerInstanceManager from "../../compilerInstanceManager.js";
import { AnalysisSummary } from "../interfaces/complexityGeneratorInterface.js";
import { ComplexityOrchestrator_v1 } from "./complexityGenerator_v1/complexity_orchestrator.js";
import { FilePayload } from "./complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { TierRunner } from "./complexityOrchestratorHelpers/tierRunner.js";

export class GetComplexityGenerator {
  private tierRunner: TierRunner;
  private workerClient: WorkerClient;
  private readonly compilerInstances: CompilerInstanceManager

  constructor(
    engine: ComplexityOrchestrator_v1,
    CompilerInstances: CompilerInstanceManager,
    workerClient: WorkerClient
  ) {
    this.tierRunner = new TierRunner(engine);
    this.compilerInstances = CompilerInstances;
    this.workerClient = workerClient
  }

  public async execute(
    payload: FilePayload
  ): Promise<{ success: boolean; message: string; data: AnalysisSummary | null }> {
    try {
      const { success: isPayloadNormalized, data: normalizedData } = await this.workerClient.execute(
        "payloadNormalizer",
        payload
      );

      if (!isPayloadNormalized || !normalizedData) {
        return {
          success: false,
          message: "Failed to normalize payload",
          data: null,
        };
      }

      const reportGenerated = await this.tierRunner.runPaid(normalizedData);

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