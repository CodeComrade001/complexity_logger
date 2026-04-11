import { FastifyInstance } from "fastify";
import type { Piscina } from "piscina";
import { WorkerClient } from "../worker/workerClient.ts";
import { CreateCompiler } from "../../compilers/TS_JS_Compiler/ts_js_bootstrap.ts";

declare module "fastify" {
  interface FastifyInstance {
    workerPool: Piscina;
    ts_js_compiler: CreateCompiler
    workerClient: WorkerClient
  }
}