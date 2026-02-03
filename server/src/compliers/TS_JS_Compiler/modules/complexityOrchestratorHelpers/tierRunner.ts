import { ComplexityOrchestrator_v1 } from "../complexityGenerator_v1/complexity_orchestrator";
import { normalizedPayloadData } from "./complexityOrchestratorInterface";

export class TierRunner {
  constructor(
    private engine: ComplexityOrchestrator_v1
  ) { }

  async runFree(data: normalizedPayloadData) {
    return this.engine.executeFreeTier(data);
  }

  async runPaid(data: normalizedPayloadData) {
    // placeholder – different logic later
    return this.engine.executePaidTier(data);
  }
}
