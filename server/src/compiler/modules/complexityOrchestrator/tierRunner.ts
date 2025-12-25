import { EnhancedComplexityGenerator_v1 } from "../complexityGenerator_v1/enhanced_analyzer";

export class TierRunner {
  constructor(
    private engine: EnhancedComplexityGenerator_v1
  ) { }

  async runFree(data: any) {
    return this.engine.executeFreeTier(data);
  }

  async runPaid(data: any) {
    // placeholder – different logic later
    return this.engine.executeFreeTier(data);
  }
}
