import { Project } from "ts-morph";
import { FetchUnitPartOfCodeProps } from "../inteerface/fetchUnitPartOfCodeProps";
import { extractors } from "../utils/extractor";

export class GetUnitPartOfCode {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  public extract(props: FetchUnitPartOfCodeProps) {
    const source = this.project.addSourceFileAtPath(props.filePath);
    const result: any = {};

    for (const target of props.targets) {
      const extractor = extractors[target];

      if (!extractor) {
        return { success: false, message: `Unknown target: ${target}` };
      }

      result[target] = extractor(source);
    }

    return { success: true, data: result };
  }


}
