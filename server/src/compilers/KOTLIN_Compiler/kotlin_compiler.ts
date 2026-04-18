import { getKotlinCompiler } from "../allCompilerInstance.js";
import { KotlinUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Kotlin_Compiler {
  constructor() { }

  public async execute(
    kotlinUploadModel: KotlinUploadModel
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const kotlinCompiler = getKotlinCompiler();

      const kotlinResult = await kotlinCompiler.compiler.execute(
        kotlinUploadModel.base.fileContent,
        kotlinUploadModel.base.name
      );

      return {
        success: true,
        data: kotlinResult,
        message: "Kotlin code analysis completed successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error as Error).message ||
          "An error occurred during Kotlin code analysis.",
      };
    }
  }
}