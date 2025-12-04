import Compiler from "./compiler";
import { CancelRunningTask } from './modules/cancelTask';
import { GetCodeChanges } from "./modules/codeChange";
import { GetComplexityGenerator } from "./modules/complexityGenerator";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode";

export function createCompiler() {

  return new Compiler(
    new GetUnitPartOfCode(),
    new GetCodeChanges(),
    new CancelRunningTask(),
    new GetComplexityGenerator()
  );
}