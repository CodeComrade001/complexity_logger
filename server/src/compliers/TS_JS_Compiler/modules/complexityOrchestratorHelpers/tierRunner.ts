import { ComplexityOrchestrator_v1 } from "../complexityGenerator_v1/complexity_orchestrator.js";
import { normalizedPayloadData } from "./complexityOrchestratorInterface.js";

export class TierRunner {
  private engine: ComplexityOrchestrator_v1;

  constructor(
    engine: ComplexityOrchestrator_v1
  ) {
    this.engine = engine
  }

  async runFree(data: normalizedPayloadData) {
    return this.engine.executeFreeTier(data);
  }

  async runPaid(data: normalizedPayloadData) {
    return this.engine.executePaidTier(data);
  }
}
