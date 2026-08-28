import { PYTHON_CompilerInterface, PYTHON_CreateCompiler } from "./PYTHON_Compiler/python_bootstrap.js";

export default class CompilerInstanceManager {
  private pythonCompiler: PYTHON_CompilerInterface | null = null;
  // ============================================================
  // PYTHON
  // ============================================================

  public getPythonCompiler(): PYTHON_CompilerInterface {
    if (!this.pythonCompiler) {
      console.log(
        "🚀 Initializing PYTHON compiler ONCE per CompilerInstanceManager"
      );

      this.pythonCompiler =
        new PYTHON_CreateCompiler().init();
    }

    return this.pythonCompiler;
  }
}