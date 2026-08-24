// ============================================================================
// WORKER (True Plugin-Based, No Duplication, No Central Compiler)
// ============================================================================

console.log("👷 Worker booted");

import { Project } from "ts-morph";
import { saveResult } from "./storage/fileStorage.js";
import { Job } from "./worker_types/workerTypes.js";

// 🔥 Individual compiler getters
import { executeCSharpCompiler } from "./worker_client/csharpCompilerClient.js";
import { executeJS_Ts_Compiler } from "./worker_client/ts_js_CompilerClient.js";
import { executeGoCompiler } from "./worker_client/goCompilerClient.js";
import { executeJavaCompiler } from "./worker_client/javaCompilerClient.js";
import { executePythonCompiler } from "./worker_client/pythonCompilerClient.js";
import { executeRustCompiler } from "./worker_client/rustCompilerClient.js";

/* ============================================================
   PROJECT SINGLETON
============================================================ */

let projectInstance: Project | null = null;

function getProject(): Project {
  if (!projectInstance) {
    console.log("🔥 Initializing Project ONCE per worker");

    projectInstance = new Project({
      useInMemoryFileSystem: true,
    });
  }

  return projectInstance;
}

/* ============================================================
   TASK REGISTRY
============================================================ */

const TASK_HANDLERS: Record<
  string,
  (job: Job) => Promise<any>
> = {

  /* ==========================================================
     TS / JS MICROSERVICE
  ========================================================== */

  async ts_js_compiler(job: Job) {
    return executeJS_Ts_Compiler(job.data as any[]);
  },

  /* ==========================================================
     GO MICROSERVICE
  ========================================================== */

  async go_compiler(job: Job) {
    return executeGoCompiler(job.data as any[]);
  },

  /* ==========================================================
     JAVA MICROSERVICE
  ========================================================== */

  async java_compiler(job: Job) {
    return executeJavaCompiler(job.data as any[]);
  },

  /* ==========================================================
     PYTHON MICROSERVICE
  ========================================================== */

  async python_compiler(job: Job) {
    return executePythonCompiler(job.data as any[]);
  },

  /* ==========================================================
     RUST MICROSERVICE
  ========================================================== */

  async rust_compiler(job: Job) {
    return executeRustCompiler(job.data as any[]);
  },


  /* ==========================================================
     C# MICROSERVICE
  ========================================================== */

  async csharp_compiler(job: Job) {
    return executeCSharpCompiler(job.data as any[]);
  },


};

/* ============================================================
   WORKER ENTRY
============================================================ */

export default async function (job: Job) {
  console.log(
    "👷 Worker Function booted:",
    job.task
  );

  const start = Date.now();

  try {
    const handler =
      TASK_HANDLERS[job.task];

    if (!handler) {
      throw new Error(
        `Unknown task: ${job.task}`
      );
    }

    const result =
      await handler(job);

    await saveResult(job.id, {
      jobId: job.id,
      task: job.task,
      result,
    });

    return {
      jobId: job.id,
      task: job.task,
      result,
    };

  } catch (err: any) {

    console.error(
      `❌ Worker failed: ${job.task}`,
      err
    );

    return {
      jobId: job.id,
      task: job.task,
      result: null,
      error:
        err instanceof Error
          ? err.message
          : String(err),
    };

  } finally {

    console.log(
      `⏱ Worker finished ${job.id} in ${Date.now() - start
      }ms`
    );
  }
}