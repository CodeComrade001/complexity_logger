import { JAVA_CompilerInterface, JAVA_CreateCompiler } from "./JAVA_Compiler/java_bootstrap.js";

export default class CompilerInstanceManager {
  private javaCompiler: JAVA_CompilerInterface | null = null;
  // ============================================================
  // JAVA
  // ============================================================

  public getJavaCompiler(): JAVA_CompilerInterface {
    if (!this.javaCompiler) {
      console.log(
        "🚀 Initializing JAVA compiler ONCE per CompilerInstanceManager"
      );

      this.javaCompiler =
        new JAVA_CreateCompiler().init();
    }

    return this.javaCompiler;
  }

}