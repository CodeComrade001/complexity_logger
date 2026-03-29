import { FileUploadModel } from "../../module/file_Interface/fileInterface.js";
import { AnalysisSummary } from "./interfaces/complexityGeneratorInterface.js";
import { COMPLEXITYGENERATORMAXFILES } from "./interfaces/fetchUnitPartOfCodeProps.js";
import { CancelRunningTask } from "./modules/cancelTask.js";
import { GetCodeChanges } from "./modules/codeChange.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { CodeParts } from "./modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";
export type ComplexityGeneratorPayload = Record<string, CodeParts>;


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
      targets: [
        "functions",
        "arrows",
        "methods",
        "constructors",
        "getters",
        "setters",
        "callbacks",
        "handlers",
        "staticBlocks",
        "topLevelStatements"
      ]
    }, allFilesToAnalyze);
    return fetchedPart;
  }

  private async complexityGenerator(
    payload: ComplexityGeneratorPayload,
    concurrency = COMPLEXITYGENERATORMAXFILES
  ): Promise<AnalysisSummary[]> {
    const entries = Object.entries(payload);

    const results: any[] = [];

    for (let i = 0; i < entries.length; i += concurrency) {
      const slice = entries.slice(i, i + concurrency);

      const promises = slice.map(([fileName, data]) => {
        return this.getComplexityGenerator.execute({
          [fileName]: data,
        });
      });

      // execute result in batch
      const batchResults = await Promise.all(promises);

      //store only successful result
      batchResults.map((item) => {
        const { success, data } = item
        if (success && data) {
          results.push(data);
        }
      })
    }

    return results;
  }



  // private async _codeChange() {
  //   return this.getIfCodeChange.hasCodeChanged("", "");
  // }

  // private async _cancelFileTask() {
  //   return this.cancelRunningTask.pause();
  // }




  public async execute(allFilesToAnalyze: FileUploadModel[]): Promise<{ data: AnalysisSummary[] | null, success: boolean, message?: string }> {
    const { success, data } = await this.fetchPartOfCode(allFilesToAnalyze);
    if (!success)
      return { success: false, message: "parse tree generator failed", data: null };

    const complexityReport = await this.complexityGenerator(data);

    return { success: true, data: complexityReport }
  }


}


