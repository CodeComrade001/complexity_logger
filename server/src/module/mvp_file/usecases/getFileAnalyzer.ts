
import Compiler from "../../../compiler/compiler";
import { Serializer } from "../../../compiler/utils/seralize";
import { IFileRepository } from "../ports/IFileRepository";

export class GetFileAnalyzer {
  private compiler: Compiler
  constructor(private repo: IFileRepository, compiler: Compiler) {
    this.compiler = compiler;
    this.repo = repo;
  }

  public async execute() {
    const rawAnalysis = await this.compiler.execute();
    const reposResult = await this.repo.getFileAnalyzer()
    const serialized = await Serializer.serializeAnalysis(rawAnalysis.data);

    return {
      success: true,
      data: { serialized, rawAnalysis }
    };
  }
}
