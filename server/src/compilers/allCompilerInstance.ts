// ============================================================================
// COMPILER SINGLETON REGISTRY
// Lazy-loaded per worker thread
// ============================================================================

import { CompilerInterface as TSJSCompilerInterface, CreateCompiler as TSJSCreateCompiler } from "./TS_JS_Compiler/ts_js_bootstrap.js";

import { GO_CompilerInterface, GO_CreateCompiler } from "./GO_Compiler/go_bootstrap.js";
import { JAVA_CompilerInterface, JAVA_CreateCompiler } from "./JAVA_Compiler/java_bootstrap.js";
import { PYTHON_CompilerInterface, PYTHON_CreateCompiler } from "./PYTHON_Compiler/python_bootstrap.js";
import { ZIG_CompilerInterface, ZIG_CreateCompiler } from "./ZIG_Compiler/zig_bootstrap.js";
import { KOTLIN_CompilerInterface, Kotlin_CreateCompiler } from "./KOTLIN_Compiler/kotlin_bootstrap.js";
import { RUST_CompilerInterface, RUST_CreateCompiler } from "./RUST_Compiler/rust_bootstrap.js";

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let tsjsCompiler: TSJSCompilerInterface | null = null;
let goCompiler: GO_CompilerInterface | null = null;
let javaCompiler: JAVA_CompilerInterface | null = null;
let pythonCompiler: PYTHON_CompilerInterface | null = null;
let zigCompiler: ZIG_CompilerInterface | null = null;
let rustCompiler: RUST_CompilerInterface | null = null;
let kotlinCompiler: KOTLIN_CompilerInterface | null = null;

// ============================================================================
// TS/JS COMPILER
// ============================================================================
export function get_Js_Ts_Compiler(): TSJSCompilerInterface {
  if (!tsjsCompiler) {
    console.log("🚀 Initializing TS/JS compiler ONCE per worker thread");
    tsjsCompiler = new TSJSCreateCompiler().init();
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
// ZIG COMPILER
// ============================================================================
export function getZigCompiler(): ZIG_CompilerInterface {
  if (!zigCompiler) {
    console.log("🚀 Initializing ZIG compiler ONCE per worker thread");
    zigCompiler = new ZIG_CreateCompiler().init();
  }
  return zigCompiler;
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
// KOTLIN COMPILER
// ============================================================================
export function getKotlinCompiler(): KOTLIN_CompilerInterface {
  if (!kotlinCompiler) {
    console.log("🚀 Initializing KOTLIN compiler ONCE per worker thread");
    kotlinCompiler = new Kotlin_CreateCompiler().init();
  }
  return kotlinCompiler;
}