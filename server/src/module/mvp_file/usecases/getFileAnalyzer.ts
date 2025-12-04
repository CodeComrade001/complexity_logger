
import Compiler from "../../../compiler/compiler";
import { IFileRepository } from "../ports/IFileRepository";

export class GetFileAnalyzer {
  private compiler: Compiler
  constructor(private repo: IFileRepository, compiler: Compiler) {
    this.compiler = compiler;
    this.repo = repo;
  }

  public async execute() {

    const passFile = await this.compiler.fetchPartOfCode("server/src/module/download/download.ts");
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ passFile:", passFile);
    if (!passFile) return { status: 404, message: "Compiler Result Not found" };
    const result = await this.repo.getFileAnalyzer();
    if (!result) return { status: 404, message: "getFileAnalyzer() Not found" };
    // business-level mapping if needed
    return { success: true, data: result };
  }
}
