
import Compiler from "../../compiler/compiler";
// import { Serializer } from "../../../compiler/utils/seralize";
import { FileUploadModel } from "../model/fileInterface";
import { IFileRepository } from "../ports/IFileRepository";

export class GetFileAnalyzer {
  private compiler: Compiler
  constructor(private repo: IFileRepository, compiler: Compiler) {
    this.compiler = compiler;
    this.repo = repo;
  }

  public async execute(filesToAnalyze: FileUploadModel[]): Promise<{ success: boolean; data: any }> {
    {
      const rawAnalysis = await this.compiler.execute(filesToAnalyze);
      // const reposResult = await this.repo.getFileAnalyzer()

      return {
        success: true,
        data: { rawAnalysis }
      };
    }
  }
}
