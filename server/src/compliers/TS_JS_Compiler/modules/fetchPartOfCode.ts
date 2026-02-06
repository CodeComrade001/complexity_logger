import { Project } from "ts-morph";
import { BATCHSIZEVALUES, FetchUnitPartOfCodeProps } from "../interfaces/fetchUnitPartOfCodeProps.js";
import { extractors } from "../utils/extractor.js";
import { FileUploadModel } from "../../../module/file_Interface/fileInterface.js";


export class GetUnitPartOfCode {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  public async extract(
    props: FetchUnitPartOfCodeProps,
    files: FileUploadModel[],
    batchSize = BATCHSIZEVALUES
  ) {
    const results: Record<string, any> = {};

    const batches = chunk(files, batchSize);

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (file) => {
          const source = this.project.createSourceFile(
            file.name,
            file.fileContent!,
            { overwrite: true }
          );

          results[file.name] = {};

          for (const target of props.targets) {
            const extractor = extractors[target];
            if (!extractor) {
              throw new Error(`Unknown target: ${target}`);
            }
            results[file.name][target] = extractor(source);
          }
        })
      );

      // 🔑 optional but smart
      // this.project.forgetNodesCreatedInBlock?.();
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


