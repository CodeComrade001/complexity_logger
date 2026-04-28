// ============================================================================
// COMPILER SINGLETON REGISTRY
// Lazy-loaded per worker thread
// ============================================================================

import { JS_TS_CompilerInterface, JS_TS_CreateCompiler } from "./TS_JS_Compiler/ts_js_bootstrap.js";
import { GO_CompilerInterface, GO_CreateCompiler } from "./GO_Compiler/go_bootstrap.js";
import { JAVA_CompilerInterface, JAVA_CreateCompiler } from "./JAVA_Compiler/java_bootstrap.js";
import { PYTHON_CompilerInterface, PYTHON_CreateCompiler } from "./PYTHON_Compiler/python_bootstrap.js";
import { RUST_CompilerInterface, RUST_CreateCompiler } from "./RUST_Compiler/rust_bootstrap.js";
import { CSHARP_CompilerInterface, CSHARP_CreateCompiler } from "./CSHARP_Compiler/csharp_bootstrap.js";

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let tsjsCompiler: JS_TS_CompilerInterface | null = null;
let goCompiler: GO_CompilerInterface | null = null;
let javaCompiler: JAVA_CompilerInterface | null = null;
let pythonCompiler: PYTHON_CompilerInterface | null = null;
let rustCompiler: RUST_CompilerInterface | null = null;
let csharpCompiler: CSHARP_CompilerInterface | null = null;
// ============================================================================
// TS/JS COMPILER
// ============================================================================
export function get_Js_Ts_Compiler(): JS_TS_CompilerInterface {
  if (!tsjsCompiler) {
    console.log("🚀 Initializing TS/JS compiler ONCE per worker thread");
    tsjsCompiler = new JS_TS_CreateCompiler().init();
  }
  return tsjsCompiler;
}

// ============================================================================
// GO COMPILER
// ============================================================================
export function getGoCompiler(): GO_CompilerInterface {
  if (!goCompiler) {
    console.log("🚀 Initializing GO compiler ONCE per worker thread");
    goCompiler = new GO_CreateCompiler().init();
  }
  return goCompiler;
}

// ============================================================================
// JAVA COMPILER
// ============================================================================
export function getJavaCompiler(): JAVA_CompilerInterface {
  if (!javaCompiler) {
    console.log("🚀 Initializing JAVA compiler ONCE per worker thread");
    javaCompiler = new JAVA_CreateCompiler().init();
  }
  return javaCompiler;
}

// ============================================================================
// PYTHON COMPILER
// ============================================================================
export function getPythonCompiler(): PYTHON_CompilerInterface {
  if (!pythonCompiler) {
    console.log("🚀 Initializing PYTHON compiler ONCE per worker thread");
    pythonCompiler = new PYTHON_CreateCompiler().init();
  }
  return pythonCompiler;
}



// ============================================================================
// RUST COMPILER
// ============================================================================
export function getRustCompiler(): RUST_CompilerInterface {
  if (!rustCompiler) {
    console.log("🚀 Initializing RUST compiler ONCE per worker thread");
    rustCompiler = new RUST_CreateCompiler().init();
  }
  return rustCompiler;
}

// ============================================================================
// CSHARP COMPILER
// ============================================================================
export function getCsharpCompiler(): CSHARP_CompilerInterface {
  if (!csharpCompiler) {
    console.log("🚀 Initializing CSHARP compiler ONCE per worker thread");
    csharpCompiler = new CSHARP_CreateCompiler().init();
  }
  return csharpCompiler;
}

