import CompilerInstanceManager from "../compilerInstanceManager.js";
import { CsharpUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Csharp_Compiler {

  constructor(
    private readonly compilerInstances: CompilerInstanceManager
  ) { }


  public async execute(goUploadModel: CsharpUploadModel): Promise<{ success: boolean; data?: any; message?: string }> {
    try {

      const csharpCompiler =
        this.compilerInstances.getCsharpCompiler();

      const goResult = await csharpCompiler.compiler.execute(goUploadModel.base.fileContent, goUploadModel.base.name);


      return {
        success: true,
        data: goResult,
        message: "C# code analysis completed successfully.",
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "An error occurred during C# code analysis.",
      };
    }
  }
}