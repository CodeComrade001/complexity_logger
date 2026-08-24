import { GO_CompilerInterface, GO_CreateCompiler } from "./GO_Compiler/go_bootstrap.js";


export default class CompilerInstanceManager {
  private goCompiler: GO_CompilerInterface | null = null;
  // ============================================================
  // GO
  // ============================================================

  public getGoCompiler(): GO_CompilerInterface {
    if (!this.goCompiler) {
      console.log(
        "🚀 Initializing GO compiler ONCE per CompilerInstanceManager"
      );

      this.goCompiler =
        new GO_CreateCompiler().init();
    }

    return this.goCompiler;
  }
}