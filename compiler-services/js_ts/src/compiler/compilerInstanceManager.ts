import { JS_TS_CompilerInterface, JS_TS_CreateCompiler } from "./TS_JS_Compiler/ts_js_bootstrap.js";

export default class CompilerInstanceManager {
  private js_ts_Compiler: JS_TS_CompilerInterface | null = null;
  // ============================================================
  // C#
  // ============================================================

  public getJsTsCompiler(): JS_TS_CompilerInterface {
    if (!this.js_ts_Compiler) {
      console.log(
        "🚀 Initializing CSHARP compiler ONCE per CompilerInstanceManager"
      );

      this.js_ts_Compiler =
        new JS_TS_CreateCompiler().init();
    }

    return this.js_ts_Compiler;
  }
}