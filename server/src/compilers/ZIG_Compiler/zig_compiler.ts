import { getZigCompiler } from "../allCompilerInstance.js";
import { ZigUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Zig_Compiler {
  constructor() { }

  public async execute(
    zigUploadModel: ZigUploadModel
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const zigCompiler = getZigCompiler();

      const zigResult = await zigCompiler.compiler.execute(
        zigUploadModel.base.fileContent,
        zigUploadModel.base.name
      );

      return {
        success: true,
        data: zigResult,
        message: "Zig code analysis completed successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error as Error).message ||
          "An error occurred during Zig code analysis.",
      };
    }
  }
}