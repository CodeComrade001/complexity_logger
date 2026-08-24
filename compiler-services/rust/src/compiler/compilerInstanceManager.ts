import { RUST_CompilerInterface, RUST_CreateCompiler } from "./RUST_Compiler/rust_bootstrap.js";

export default class CompilerInstanceManager {
  private rustCompiler: RUST_CompilerInterface | null = null;
  // ============================================================
  // C#
  // ============================================================

  public getCsharpCompiler(): RUST_CompilerInterface {
    if (!this.rustCompiler) {
      console.log(
        "🚀 Initializing CSHARP compiler ONCE per CompilerInstanceManager"
      );

      this.rustCompiler =
        new RUST_CreateCompiler().init();
    }

    return this.rustCompiler;
  }
}