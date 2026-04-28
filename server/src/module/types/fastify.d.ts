import { FastifyInstance } from "fastify";
import type { Piscina } from "piscina";
import { WorkerClient } from "../worker/workerClient.ts";
import { JS_TS_CreateCompiler } from "../../compilers/TS_JS_Compiler/ts_js_bootstrap.ts";
import { JAVA_CreateCompiler } from "../../compilers/JAVA_Compiler/java_bootstrap.ts";
import { PYTHON_CreateCompiler } from "../../compilers/PYTHON_Compiler/python_bootstrap.ts";
import { RUST_CreateCompiler } from "../../compilers/RUST_Compiler/rust_bootstrap.ts";
import { CSHARP_CreateCompiler } from "../../compilers/CSHARP_Compiler/csharp_bootstrap.ts";

declare module "fastify" {
  interface FastifyInstance {
    workerPool: Piscina;
    ts_js_compiler: JS_TS_CreateCompiler
    java_compiler: JAVA_CreateCompiler
    python_compiler: PYTHON_CreateCompiler
    rust_compiler: RUST_CreateCompiler
    csharp_compiler: CSHARP_CreateCompiler
    workerClient: WorkerClient
  }
}