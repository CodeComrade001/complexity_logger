import { compilerProps_v1 } from "./inteerface/compilerProps_v1"
import { CancelRunningTask } from "./modules/cancelTask";
import { GetCodeChanges } from "./modules/codeChange";
import { GetComplexityGenerator } from "./modules/complexityGenerator";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode";

export default class Compiler implements compilerProps_v1 {
  private getUnitPartOfCode: GetUnitPartOfCode;
  private getIfCodeChange: GetCodeChanges;
  private cancelRunningTask: CancelRunningTask;
  private getComplexityGenerator: GetComplexityGenerator;

  constructor(
    getUnitPartOfCode: GetUnitPartOfCode,
    getIfCodeChange: GetCodeChanges,
    cancelRunningTask: CancelRunningTask,
    getComplexityGenerator: GetComplexityGenerator
  ) {
    this.getUnitPartOfCode = getUnitPartOfCode;
    this.getIfCodeChange = getIfCodeChange;
    this.cancelRunningTask = cancelRunningTask;
    this.getComplexityGenerator = getComplexityGenerator;
  }


  async fetchPartOfCode(partOfCodeTOfetch: string) {
    const fetchedPart = await this.getUnitPartOfCode.extract({
      filePath: partOfCodeTOfetch,
      targets: ["functions", "classes", "variables"] // Example targets
    });
    return fetchedPart;
  }

  async complexityGenerator() {
    const result = await this.getComplexityGenerator.execute();
    return result;
  }

  async codeChange() {
    return this.getIfCodeChange.hasCodeChanged("", "");
  }

  async cancelFileTask() {
    return this.cancelRunningTask.pause();
  }

  public async run() {

  }

}

