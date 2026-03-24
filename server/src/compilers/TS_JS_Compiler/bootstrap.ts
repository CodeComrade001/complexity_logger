import Compiler from "./compiler.js";
import { CancelRunningTask } from "./modules/cancelTask.js";
import { GetCodeChanges } from "./modules/codeChange.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { ComplexityOrchestrator_v1 } from "./modules/complexityGenerator_v1/complexity_orchestrator.js";
import { AIComplexityExplainer } from "./modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { EnhancedAnalyzer_v2 } from "./modules/complexityGenerator_v1/paidTierResources/enhancedAnalyzer_v2.js";
import { BuildKeywordSet } from "./modules/complexityGenerator_v1/utils/buildkeyword.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";

export function createCompiler() {
  const aiComplexityExplainer = new AIComplexityExplainer();
  const enhancedAnalyzer = new EnhancedAnalyzer_v2()
  const complexityEngineGenerator = new ComplexityOrchestrator_v1(BuildKeywordSet, aiComplexityExplainer, enhancedAnalyzer)



  return new Compiler(
    new GetUnitPartOfCode(),
    new GetCodeChanges(),
    new CancelRunningTask(),
    new GetComplexityGenerator(complexityEngineGenerator)
  );
}