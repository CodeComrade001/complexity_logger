import { FileUploadModel } from "../module/model/fileInterface";
import { CancelRunningTask } from "./modules/cancelTask";
import { GetCodeChanges } from "./modules/codeChange";
import { GetComplexityGenerator } from "./modules/complexityGenerator";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode";

interface ComplexityUnit {
  functions: any[];
  arrows: any[];
  methods: any[];
  classes: any[];
}

type ComplexityGeneratorPayload = Record<string, ComplexityUnit>;


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
      targets: ["functions", "arrows", "methods", "classes"] // Example targets
    }, allFilesToAnalyze);
    console.log("Turbo Log  ~ Compiler ~ fetchPartOfCode ~ fetchedPart:", fetchedPart);
    return fetchedPart;
  }

  private async complexityGenerator(
    payload: ComplexityGeneratorPayload,
    batchSize = 10
  ) {
    const batches = chunkRecord(payload, batchSize);
    const results = [];

    for (const batch of batches) {
      const result = await this.getComplexityGenerator.execute(batch);
      results.push(result);
    }

    return results;
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


function chunkRecord<T>(
  record: Record<string, T>,
  size: number
): Record<string, T>[] {
  const entries = Object.entries(record);
  const chunks: Record<string, T>[] = [];

  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)));
  }

  return chunks;
}

