import { FastifyInstance } from "fastify";
import type { Piscina } from "piscina";
import { WorkerClient } from "../worker/workerClient.ts";
import CompilerInstanceManager from "../../compilers/compilerInstanceManager.ts";
import Python_Compiler from "../../compilers/PYTHON_Compiler/python_compiler.ts";
import Csharp_Compiler from '../../compilers/CSHARP_Compiler/csharp_compiler';
import Rust_Compiler from '../../compilers/RUST_Compiler/rust_compiler';
import TS_JS_Compiler from "../../compilers/TS_JS_Compiler/ts_js_Compiler.ts";
import JAVA_Compiler from "../../compilers/JAVA_Compiler/java_compiler.ts";

declare module "fastify" {
  interface FastifyInstance {
    workerPool: Piscina;

    workerClient: WorkerClient;

    compilerInstanceManager: CompilerInstanceManager;

    ts_js_compiler: TS_JS_Compiler;
    java_compiler: JAVA_Compiler;
    python_compiler: Python_Compiler;
    rust_compiler: Rust_Compiler;
    csharp_compiler: Csharp_Compiler;
  }
}