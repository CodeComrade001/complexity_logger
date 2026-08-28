import CompilerInstanceManager from "../compilerInstanceManager.js";
import { PythonUploadModel } from "../shared/model/payloadUploadModel.js";

export default class Python_Compiler {
  constructor(
    private readonly compilerInstances: CompilerInstanceManager
  ) { }

  public async execute(
    pythonUploadModel: PythonUploadModel
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log(
        "Turbo Log ~ Python_Compiler ~ execute ~ reached"
      );

      const pythonCompiler =
        this.compilerInstances.getPythonCompiler();

      console.log(
        "Turbo Log ~ Python_Compiler ~ execute ~ pythonCompiler:",
        pythonCompiler
      );

      const pythonResult =
        await pythonCompiler.compiler.execute(
          pythonUploadModel.base.fileContent,
          pythonUploadModel.base.name
        );

      console.log(
        "Turbo Log ~ Python_Compiler ~ execute ~ pythonResult:",
        pythonResult
      );

      return {
        success: true,
        data: pythonResult,
        message:
          "Python code analysis completed successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during Python code analysis.",
      };
    }
  }
}