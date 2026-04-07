import { ComplexityOrchestrator_v1 } from "./modules/complexityGenerator_v1/complexity_orchestrator.js";
import { ComplexityReasonGenerator } from "./modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { EnhancedAnalyzer_v2 } from "./modules/complexityGenerator_v1/paidTierResources/enhancedAnalyzer_v2.js";
import { BuildKeywordSet } from "./modules/complexityGenerator_v1/utils/buildkeyword.js";
import { PayloadNormalizer } from "./modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";
import { DeepFileSanitization } from "./utils/deepFileScan.js";

export class CreateCompiler {

  public init() {
    const aiComplexityExplainer = new ComplexityReasonGenerator();
    const enhancedAnalyzer = new EnhancedAnalyzer_v2(aiComplexityExplainer);
    const ts_js_deepFileScan = new DeepFileSanitization()

    const complexityOrchestrator_v1 = new ComplexityOrchestrator_v1(BuildKeywordSet, enhancedAnalyzer);
    const extractor = new GetUnitPartOfCode();
    const ts_js_payloadNormalizer = new PayloadNormalizer();

    // Wrap both analyzers in an object with a unified interface
    const compilerInterface = {
      freeTier: (data: any) => complexityOrchestrator_v1.executeFreeTier(data),
      paidTier: (data: any) => complexityOrchestrator_v1.executePaidTier(data),
      normalize: (data: any) => ts_js_payloadNormalizer.normalize(data),
      extract: (props: any, files: any, unitIndex: number) => extractor.extract(props, files, unitIndex),
      ts_js_deepScan: (data: any) => ts_js_deepFileScan.ts_js_deepFileScan(data)
    };

    return compilerInterface;
  }
}

