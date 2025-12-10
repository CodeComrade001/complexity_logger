import Compiler from "./compiler";
import { CancelRunningTask } from './modules/cancelTask';
import { GetCodeChanges } from "./modules/codeChange";
import { GetComplexityGenerator } from "./modules/complexityGenerator";
import { EnhancedComplexityGenerator_v1 } from "./modules/complexityGenerator_v1/enhanced_analyzer";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode";

export function createCompiler() {
  const complexityEngineGenerator = new EnhancedComplexityGenerator_v1()



  return new Compiler(
    new GetUnitPartOfCode(),
    new GetCodeChanges(),
    new CancelRunningTask(),
    new GetComplexityGenerator(complexityEngineGenerator)
  );
}