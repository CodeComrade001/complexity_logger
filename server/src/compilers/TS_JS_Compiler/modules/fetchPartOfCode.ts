import { SourceFile } from "ts-morph";
import { CodeUnitType, extractors } from "../utils/extractor.js";

export class GetUnitPartOfCode {
  public async extract(
    targets: CodeUnitType[],
    sourceFile: SourceFile,
    // ): Promise<{ success: boolean; data: Record<string, any> }> {
  ) {

    const fileName = sourceFile.getFilePath();

    const result: Record<string, any> = {};

    for (const target of targets) {
      const extractor = extractors[target];
      result[target] = extractor ? extractor(sourceFile) : null;
    }


    return { name: fileName, data: result }
  }
}