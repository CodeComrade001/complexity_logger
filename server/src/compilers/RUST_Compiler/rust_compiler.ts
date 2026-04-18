import { getRustCompiler } from "../allCompilerInstance.js";
import { RustUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Rust_Compiler {
  constructor() { }

  public async execute(
    rustUploadModel: RustUploadModel
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const rustCompiler = getRustCompiler();

      const rustResult = await rustCompiler.compiler.execute(
        rustUploadModel.base.fileContent,
        rustUploadModel.base.name
      );

      return {
        success: true,
        data: rustResult,
        message: "Rust code analysis completed successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error as Error).message ||
          "An error occurred during Rust code analysis.",
      };
    }
  }
}