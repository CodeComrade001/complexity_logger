import { SourceFile } from "ts-morph";
import { extractors } from "../utils/extractor.js";
import { DEFAULT_EXTRACTION_TARGETS } from "../interfaces/fetchUnitPartOfCodeProps.js";

export class GetUnitPartOfCode {
  public async extract(
    input: SourceFile | SourceFile[]
  ) {
    const targets = DEFAULT_EXTRACTION_TARGETS;

    // ✅ normalize input
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