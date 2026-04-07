import { FastifyInstance } from "fastify";
import type { Piscina } from "piscina";
import { createCompiler, TS_JS_payloadNormalizer } from '../../compilers/TS_JS_Compiler/bootstrap';
import { WorkerClient } from "../worker/workerClient.ts";

declare module "fastify" {
  interface FastifyInstance {
    workerPool: Piscina;
    ts_js_compiler: createCompiler
    ts_js_payloadNormalizer: TS_JS_payloadNormalizer
    workerClient: WorkerClient
  }
}