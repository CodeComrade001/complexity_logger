// ============================================================================
// WORKER (True Plugin-Based, No Duplication, No Central Compiler)
// ============================================================================

console.log("👷 Worker booted");

import { Project } from "ts-morph";
import { saveResult } from "./storage/fileStorage.js";
import { Job } from "./worker_types/workerTypes.js";


// 🔥 Individual compiler getters
import { Js_enforceProjectLimit, Js_processFilesBatch } from "./utils/Js_file_process.js";
import { Other_Languages_processFilesBatch } from "./utils/Other_file_process.js";
import { Other_Languages_enforceProjectLimit } from './utils/Other_file_process.js';
import CompilerInstanceManager from "../../compilers/compilerInstanceManager.js";
const compilerInstanceManager =
  new CompilerInstanceManager();

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
   GENERIC JAVASCRIPT / TYPESCRIPT COMPILER HANDLER
============================================================ */

function create_Js_CompilerHandler(
  getCompiler: () => any
) {
  return async (job: Job) => {
    const compiler = getCompiler();
    const project = getProject();

    const result = await Js_processFilesBatch(
      job.data as any[],
      project,
      compiler
    );

    Js_enforceProjectLimit(project);

    return result;
  };
}

/* ============================================================
   GENERIC OTHER-LANGUAGE COMPILER HANDLER
============================================================ */

function create_other_languages_CompilerHandler(
  getCompiler: () => any
) {
  return async (job: Job) => {
    const compiler = getCompiler();
    const project = getProject();

    const result =
      await Other_Languages_processFilesBatch(
        job.data as any[],
        project,
        compiler
      );

    Other_Languages_enforceProjectLimit(project);

    return result;
  };
}

/* ============================================================
   TASK REGISTRY
============================================================ */

const TASK_HANDLERS: Record<
  string,
  (job: Job) => Promise<any>
> = {

  /* ==========================================================
     TS / JS
  ========================================================== */

  ts_js_compiler:
    create_Js_CompilerHandler(
      () =>
        compilerInstanceManager.getJsTsCompiler()
    ),

  /* ==========================================================
     OTHER LANGUAGES
  ========================================================== */

  go_compiler:
    create_other_languages_CompilerHandler(
      () =>
        compilerInstanceManager.getGoCompiler()
    ),

  java_compiler:
    create_other_languages_CompilerHandler(
      () =>
        compilerInstanceManager.getJavaCompiler()
    ),

  python_compiler:
    create_other_languages_CompilerHandler(
      () =>
        compilerInstanceManager.getPythonCompiler()
    ),

  rust_compiler:
    create_other_languages_CompilerHandler(
      () =>
        compilerInstanceManager.getRustCompiler()
    ),

  csharp_compiler:
    create_other_languages_CompilerHandler(
      () =>
        compilerInstanceManager.getCsharpCompiler()
    ),

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