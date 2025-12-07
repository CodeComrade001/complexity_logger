import { Project } from "ts-morph";
import { FetchUnitPartOfCodeProps } from "../interfaces/fetchUnitPartOfCodeProps";
import { extractors } from "../utils/extractor";
import path from "path";


export class GetUnitPartOfCode {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  public extract(props: FetchUnitPartOfCodeProps) {

    const filePath = path.join(__dirname, "../../module/download/download.ts");

    const source = this.project.addSourceFileAtPath(filePath);

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
