import Compiler from "./compiler.js";
import { CancelRunningTask } from "./modules/cancelTask.js";
import { GetCodeChanges } from "./modules/codeChange.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { ComplexityOrchestrator_v1 } from "./modules/complexityGenerator_v1/complexity_orchestrator.js";
import { ComplexityReasonGenerator } from "./modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { EnhancedAnalyzer_v2 } from "./modules/complexityGenerator_v1/paidTierResources/enhancedAnalyzer_v2.js";
import { BuildKeywordSet } from "./modules/complexityGenerator_v1/utils/buildkeyword.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";

export function createCompiler() {
  const aiComplexityExplainer = new ComplexityReasonGenerator();
  const enhancedAnalyzer = new EnhancedAnalyzer_v2(aiComplexityExplainer)
  const complexityEngineGenerator = new ComplexityOrchestrator_v1(BuildKeywordSet, enhancedAnalyzer)



  return new Compiler(
    new GetUnitPartOfCode(),
    new GetCodeChanges(),
    new CancelRunningTask(),
    new GetComplexityGenerator(complexityEngineGenerator)
  );
}