import {
  JS_TS_CompilerInterface,
  JS_TS_CreateCompiler,
} from "./TS_JS_Compiler/ts_js_bootstrap.js";

import {
  GO_CompilerInterface,
  GO_CreateCompiler,
} from "./GO_Compiler/go_bootstrap.js";

import {
  JAVA_CompilerInterface,
  JAVA_CreateCompiler,
} from "./JAVA_Compiler/java_bootstrap.js";

import {
  PYTHON_CompilerInterface,
  PYTHON_CreateCompiler,
} from "./PYTHON_Compiler/python_bootstrap.js";

import {
  RUST_CompilerInterface,
  RUST_CreateCompiler,
} from "./RUST_Compiler/rust_bootstrap.js";

import {
  CSHARP_CompilerInterface,
  CSHARP_CreateCompiler,
} from "./CSHARP_Compiler/csharp_bootstrap.js";

export default class CompilerInstanceManager {
  private tsjsCompiler: JS_TS_CompilerInterface | null = null;
  private goCompiler: GO_CompilerInterface | null = null;
  private javaCompiler: JAVA_CompilerInterface | null = null;
  private pythonCompiler: PYTHON_CompilerInterface | null = null;
  private rustCompiler: RUST_CompilerInterface | null = null;
  private csharpCompiler: CSHARP_CompilerInterface | null = null;

  // ============================================================
  // TS / JS
  // ============================================================

  public getJsTsCompiler(): JS_TS_CompilerInterface {
    if (!this.tsjsCompiler) {
      console.log(
        "🚀 Initializing TS/JS compiler ONCE per CompilerInstanceManager"
      );

      this.tsjsCompiler =
        new JS_TS_CreateCompiler().init();
    }

    return this.tsjsCompiler;
  }

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

  // ============================================================
  // RUST
  // ============================================================

  public getRustCompiler(): RUST_CompilerInterface {
    if (!this.rustCompiler) {
      console.log(
        "🚀 Initializing RUST compiler ONCE per CompilerInstanceManager"
      );

      this.rustCompiler =
        new RUST_CreateCompiler().init();
    }

    return this.rustCompiler;
  }

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