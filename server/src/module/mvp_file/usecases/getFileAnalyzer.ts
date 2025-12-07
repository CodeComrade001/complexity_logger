
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
    // console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ rawAnalysis:", rawAnalysis);

    const serialized = Serializer.serializeAnalysis(rawAnalysis.data);
    // console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ serialized:", serialized);

    return {
      success: true,
      data: serialized
    };
  }
}
