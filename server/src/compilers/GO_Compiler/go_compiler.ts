import CompilerInstanceManager from "../compilerInstanceManager.js";
import { GoUploadModel } from "../shared/model/payloadUploadModel.js";


export default class Go_Compiler {

  constructor(
    private readonly compilerInstances: CompilerInstanceManager
  ) { }


  public async execute(goUploadModel: GoUploadModel): Promise<{ success: boolean; data?: any; message?: string }> {
    try {

      const goCompiler =
        this.compilerInstances.getGoCompiler();

      const goResult = await goCompiler.compiler.execute(goUploadModel.base.fileContent, goUploadModel.base.name);


      return {
        success: true,
        data: goResult,
        message: "Go code analysis completed successfully.",
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "An error occurred during Go code analysis.",
      };
    }
  }
}