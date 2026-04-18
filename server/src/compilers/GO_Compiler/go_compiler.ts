import { getGoCompiler } from "../allCompilerInstance.js";
import { GoUploadModel } from "../shared/model/payloadUploadModel.js";
import { GoAnalyzer } from "./go_modules/GO_analyzer.js";


export default class Go_Compiler {

  constructor() { }

  public async execute(goUploadModel: GoUploadModel): Promise<{ success: boolean; data?: any; message?: string }> {
    try {

      const goCOmpiler = getGoCompiler();

      const goResult = await goCOmpiler.compiler.execute(goUploadModel.base.fileContent, goUploadModel.base.name);


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