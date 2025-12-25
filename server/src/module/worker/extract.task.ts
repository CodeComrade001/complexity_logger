import { Project } from "ts-morph";
import { extractors } from "../../compiler/utils/extractor";
import { checkMemory, withTimeout } from "./limit";

export async function runExtraction(job: any) {
  try {
    const project = new Project();
    const output: any = {};

    for (const file of job.files) {
      checkMemory();

      const source = project.createSourceFile(
        file.name,
        file.fileContent!,
        { overwrite: true }
      );

      output[file.name] = {};

      for (const target of job.targets) {
        if (target in extractors) {
          output[file.name][target] = await withTimeout(
            () => extractors[target as keyof typeof extractors](source),
            3000
          );
        }
      }
    }

    return output;
  } catch (error) {
    console.error("Error during worker running extraction:", error);
    throw error;
  }
}
