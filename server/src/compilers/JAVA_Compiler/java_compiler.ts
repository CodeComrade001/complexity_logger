import CompilerInstanceManager from "../compilerInstanceManager.js";
import { GoUploadModel, JavaUploadModel } from "../shared/model/payloadUploadModel.js";


export default class JAVA_Compiler {

  constructor(
    private readonly compilerInstances: CompilerInstanceManager
  ) { }

  public async execute(javaUploadModel: JavaUploadModel): Promise<{ success: boolean; data?: any; message?: string }> {
    try {

      const javaCompiler = this.compilerInstances.getJavaCompiler();

      const javaResult = await javaCompiler.compiler.execute(javaUploadModel.base.fileContent, javaUploadModel.base.name);


      return {
        success: true,
        data: javaResult,
        message: "Java code analysis completed successfully.",
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "An error occurred during Java code analysis.",
      };
    }
  }
}