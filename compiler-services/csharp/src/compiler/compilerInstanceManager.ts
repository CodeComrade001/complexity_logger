
import {
  CSHARP_CompilerInterface,
  CSHARP_CreateCompiler,
} from "./CSHARP_Compiler/csharp_bootstrap.js";

export default class CompilerInstanceManager {
  private csharpCompiler: CSHARP_CompilerInterface | null = null;
  // ============================================================
  // C#
  // ============================================================

  public getCsharpCompiler(): CSHARP_CompilerInterface {
    if (!this.csharpCompiler) {
      console.log(
        "🚀 Initializing CSHARP compiler ONCE per CompilerInstanceManager"
      );

      this.csharpCompiler =
        new CSHARP_CreateCompiler().init();
    }

    return this.csharpCompiler;
  }
}