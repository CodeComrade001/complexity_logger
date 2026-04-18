import { getPythonCompiler } from "../allCompilerInstance.js";
import { PythonUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Python_Compiler {
  constructor() { }

  public async execute(
    pythonUploadModel: PythonUploadModel
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const pythonCompiler = getPythonCompiler();

      const pythonResult = await pythonCompiler.compiler.execute(
        pythonUploadModel.base.fileContent,
        pythonUploadModel.base.name
      );

      return {
        success: true,
        data: pythonResult,
        message: "Python code analysis completed successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error as Error).message ||
          "An error occurred during Python code analysis.",
      };
    }
  }
}