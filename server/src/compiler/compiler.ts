import { FileUploadModel } from "../module/model/fileInterface";
import { CancelRunningTask } from "./modules/cancelTask";
import { GetCodeChanges } from "./modules/codeChange";
import { GetComplexityGenerator } from "./modules/complexityGenerator";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode";

export default class Compiler {
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


  private async fetchPartOfCode(allFilesToAnalyze: FileUploadModel[]) {
    const fetchedPart = await this.getUnitPartOfCode.extract({
      targets: ["functions", "classes", "variables", "arrows", "methods", "variables"] // Example targets
    }, allFilesToAnalyze);
    return fetchedPart;
  }

  private async complexityGenerator(fetchPartOfCodeResult: any) {
    const result = await this.getComplexityGenerator.execute(fetchPartOfCodeResult);
    return result;
  }

  private async _codeChange() {
    return this.getIfCodeChange.hasCodeChanged("", "");
  }

  private async _cancelFileTask() {
    return this.cancelRunningTask.pause();
  }


  public async execute(allFilesToAnalyze: FileUploadModel[]) {
    const { success, data } = await this.fetchPartOfCode(allFilesToAnalyze);
    if (!success)
      return { success: false, message: "parse tree generator failed" };

    const complexityReport = await this.complexityGenerator(data);


    return { success: true, data: complexityReport }
  }


}

