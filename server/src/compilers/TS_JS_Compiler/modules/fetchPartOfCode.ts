import { Project, SourceFile } from "ts-morph";
import {
  BATCHSIZEVALUES,
  FetchUnitPartOfCodeProps,
} from "../interfaces/fetchUnitPartOfCodeProps.js";
import { extractors } from "../utils/extractor.js";
import { FileUploadModel } from "../../../module/file_Interface/fileInterface.js";

export class GetUnitPartOfCode {
  private project: Project;

  // ✅ INJECT PROJECT (no internal creation)
  constructor(project: Project) {
    this.project = project;
  }

  public async extract(
    props: FetchUnitPartOfCodeProps,
    files: FileUploadModel[],
    batchSize = BATCHSIZEVALUES
  ): Promise<{ success: boolean; data: Record<string, any> | null }> {
    const results: Record<string, any> = {};

    const batches = chunk(files, batchSize);

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (file) => {
          // ✅ REUSE OR CREATE (same as worker)
          let sourceFile: SourceFile;
          const existing = this.project.getSourceFile(file.name);

          if (existing) {
            existing.replaceWithText(file.fileContent!);
            sourceFile = existing;
          } else {
            sourceFile = this.project.createSourceFile(
              file.name,
              file.fileContent!,
              { overwrite: true }
            );
          }

          results[file.name] = {};

          for (const target of props.targets) {
            const extractor = extractors[target];

            if (!extractor) {
              results[file.name][target] = null;
              continue;
            }

            results[file.name][target] = extractor(sourceFile);
          }
        })
      );

      // ✅ MEMORY CONTROL (IMPORTANT)
      this.project.forgetNodesCreatedInBlock((remember) => {
        // Nodes created in this batch are forgotten after block exits
      });
    }

    return { success: true, data: results };
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}