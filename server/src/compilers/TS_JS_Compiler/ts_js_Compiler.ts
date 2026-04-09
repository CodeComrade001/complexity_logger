import { FileUploadModel } from "../../module/file_Interface/fileInterface.js";
import { CreateCompiler } from "./bootstrap.js";
import { AnalysisSummary } from "./interfaces/complexityGeneratorInterface.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { CodeParts } from "./modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
export type ComplexityGeneratorPayload = Record<string, CodeParts>;


const compiler = new CreateCompiler().init();

export default class Ts_JS_Compiler {
  private getComplexityGenerator: GetComplexityGenerator;

  constructor(
    getComplexityGenerator: GetComplexityGenerator
  ) {
    this.getComplexityGenerator = getComplexityGenerator;
  }


  private async fetchPartOfCode(allFilesToAnalyze: FileUploadModel[]) {



    const { success, data: fetchedPart } = await compiler.utils.extract({
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
    }, allFilesToAnalyze, 20);

    if (!success) {
      return { success: false, data: null };
    }

    return fetchedPart;
  }

  private async complexityGenerator(
    payload: ComplexityGeneratorPayload,
    concurrency = 2 // ✅ SAFE default for your system
  ): Promise<AnalysisSummary[]> {

    const entries = Object.entries(payload);
    const results: AnalysisSummary[] = [];

    // 🧠 Clamp concurrency to avoid overload
    const safeConcurrency = Math.max(1, Math.min(concurrency, 4));

    for (let i = 0; i < entries.length; i += safeConcurrency) {
      const batch = entries.slice(i, i + safeConcurrency);

      const promises = batch.map(([fileName, data]) =>
        this.getComplexityGenerator.execute({
          [fileName]: data,
        })
      );

      // ✅ Use allSettled to prevent total failure
      const settledResults = await Promise.allSettled(promises);

      for (const result of settledResults) {
        if (result.status === "fulfilled") {
          const { success, data } = result.value;

          if (success && data) {
            results.push(data);
          }
        } else {
          // Optional: log rejected promise
          console.error("Batch task failed:", result.reason);
          return []
        }
      }
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


