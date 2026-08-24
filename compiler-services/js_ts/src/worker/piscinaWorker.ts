// ============================================================================
// WORKER (True Plugin-Based, No Duplication, No Central Compiler)
// ============================================================================

console.log("👷 Worker booted");

import { Project } from "ts-morph";
import { Job } from "./worker_types/workerTypes.js";
import CompilerInstanceManager from "../compiler/compilerInstanceManager.js";

const compilerInstanceManager = new CompilerInstanceManager()

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


const TASK_HANDLERS: Record<
  string,
  (job: Job) => Promise<any>
> = {

  /* ==========================================================
     TS / JS MICROSERVICE
  ========================================================== */

  async ts_js_compiler(job: Job) {
    const compiler =
      compilerInstanceManager.getJsTsCompiler();

    if (!compiler?.compiler) {
      throw new Error(
        "Compiler analysis module unavailable"
      );
    }

    return compiler.compiler.execute(job.data as any[]);
  },

  /* ==========================================================
    NON-COMPILER TASKS
 ========================================================== */

  async freeTierAnalysis(job: Job) {
    const compiler =
      compilerInstanceManager.getJsTsCompiler();

    if (!compiler?.analysis) {
      throw new Error(
        "Compiler analysis module unavailable"
      );
    }

    return compiler.compiler.execute(job.data);
  },

  async payloadNormalizer(job: Job) {
    const compiler =
      compilerInstanceManager.getJsTsCompiler();

    if (!compiler?.utils) {
      throw new Error(
        "Compiler utils module unavailable"
      );
    }

    return compiler.utils.normalize(job.data);
  },

  async payloadDeepScan(job: Job) {
    const compiler =
      compilerInstanceManager.getJsTsCompiler();

    if (!compiler?.utils) {
      throw new Error(
        "Compiler utils module unavailable"
      );
    }

    return compiler.utils.deepScan(job.data);
  },

  async ExtractUnitPartOfCode(job: Job) {
    const compiler =
      compilerInstanceManager.getJsTsCompiler();

    if (!compiler?.utils) {
      throw new Error(
        "Compiler utils module unavailable"
      );
    }

    return compiler.utils.extract(job.data);
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