import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fileRoute from "../../module/routes/fileRoute.js";
import { WorkerClient } from "../../module/worker/workerClient.js";
import { JS_TS_CreateCompiler } from "../../compilers/TS_JS_Compiler/ts_js_bootstrap.js";
import { JAVA_CreateCompiler } from "../../compilers/JAVA_Compiler/java_bootstrap.js";
import { PYTHON_CreateCompiler } from "../../compilers/PYTHON_Compiler/python_bootstrap.js";
import { RUST_CreateCompiler } from "../../compilers/RUST_Compiler/rust_bootstrap.js";
import { CSHARP_CreateCompiler } from "../../compilers/CSHARP_Compiler/csharp_bootstrap.js";
import CompilerInstanceManager from "../../compilers/compilerInstanceManager.js";
import Python_Compiler from "../../compilers/PYTHON_Compiler/python_compiler.js";
import TS_JS_Compiler from "../../compilers/TS_JS_Compiler/ts_js_Compiler.js";
import JAVA_Compiler from "../../compilers/JAVA_Compiler/java_compiler.js";
import Rust_Compiler from "../../compilers/RUST_Compiler/rust_compiler.js";
import Csharp_Compiler from "../../compilers/CSHARP_Compiler/csharp_compiler.js";
import { GetComplexityGenerator } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator.js";

export async function createApp() {
  const app = fastify({ logger: true });
  const compilerInstanceManager =
    new CompilerInstanceManager();


  // ---------- CROSS ORIGIN ----------
  await app.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  });

  // ---------- FILE UPLOAD ----------
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 200 * 1024,
      files: 300,
    },
  });

  // ---------- GLOBAL SERVICES ----------
  app.decorate("workerClient", new WorkerClient());


  // ---------- COMPILER SERVICES ----------

  app.decorate(
    "compilerInstanceManager",
    compilerInstanceManager
  );

  app.decorate(
    "python_compiler",
    new Python_Compiler(
      compilerInstanceManager
    )
  );

  // app.decorate("ts_js_compiler", new TS_JS_Compiler(
  //   // compilerInstanceManager
  // ));
  app.decorate("java_compiler", new JAVA_Compiler(
    compilerInstanceManager
  ));
  app.decorate("rust_compiler", new Rust_Compiler(
    compilerInstanceManager
  ));
  app.decorate("csharp_compiler", new Csharp_Compiler(
    compilerInstanceManager
  ));

  // ---------- ROUTES ----------
  await app.register(fileRoute, { prefix: "/api/file" });

  // ---------- ERROR HANDLING ----------
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: "Not found" });
  });

  app.setErrorHandler((error: any, _req, reply) => {
    reply.code(500).send({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message,
    });
  });

  return app;
}