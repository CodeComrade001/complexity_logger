import { SourceFile } from "ts-morph";
import { extractors } from "../utils/extractor.js";
import { FetchUnitPartOfCodeProps } from "../interfaces/fetchUnitPartOfCodeProps.js";

export class GetUnitPartOfCode {
  public async extract(
    targets: FetchUnitPartOfCodeProps,
    input: SourceFile | SourceFile[] // ✅ accept both
  ) {
    if (!Array.isArray(targets)) {
      throw new Error("Invalid targets: expected array");
    }

    // ✅ normalize to array
    const sourceFiles = Array.isArray(input) ? input : [input];

    const results: any[] = [];

    for (const sourceFile of sourceFiles) {
      const fileName = sourceFile.getFilePath();
      const result: Record<string, any> = {};

      for (const target of targets) {
        const extractor = extractors[target];
        result[target] = extractor ? extractor(sourceFile) : null;
      }

      results.push({
        name: fileName,
        data: result,
      });
    }

    return results;
  }
}