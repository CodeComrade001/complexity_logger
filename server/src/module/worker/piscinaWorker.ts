// ============================================================================
// WORKER (True Plugin-Based, No Duplication, No Central Compiler)
// ============================================================================

console.log("👷 Worker booted");

import { Project } from "ts-morph";
import { saveResult } from "./storage/fileStorage.js";
import { Job } from "./worker_types/workerTypes.js";

import { enforceProjectLimit, processFilesBatch } from "./utils/file_process.js";

// 🔥 Individual compiler getters
import { get_Js_Ts_Compiler, getGoCompiler, getJavaCompiler, getPythonCompiler, getRustCompiler, getCsharpCompiler } from "../../compilers/allCompilerInstance.js";

/* ================================
   SINGLETONS
================================ */

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

/* ================================
   GENERIC COMPILER EXECUTOR FACTORY
================================ */

function createCompilerHandler(getCompiler: () => any) {
  return async (job: Job) => {
    const compiler = getCompiler();
    const project = getProject();

    const result = await processFilesBatch(job.data as any[], project, compiler);

    enforceProjectLimit(project);

    return result;
  };
}

/* ================================
   TASK REGISTRY (NO SWITCH, NO SHARED COMPILER)
================================ */

const TASK_HANDLERS: Record<string, (job: Job) => Promise<any>> = {
  // ── TS/JS ─────────────────────
  ts_js_compiler: createCompilerHandler(get_Js_Ts_Compiler),

  // ── PLUGINS ───────────────────
  go_compiler: createCompilerHandler(getGoCompiler),
  java_compiler: createCompilerHandler(getJavaCompiler),
  python_compiler: createCompilerHandler(getPythonCompiler),
  rust_compiler: createCompilerHandler(getRustCompiler),
  csharp_compiler: createCompilerHandler(getCsharpCompiler),

  // ── NON-COMPILER TASKS ────────
  async freeTierAnalysis(job) {
    const compiler = get_Js_Ts_Compiler();
    if (!compiler?.analysis) {
      throw new Error("Compiler analysis module unavailable");
    }
    return compiler.compiler.execute(job.data);
  },

  async payloadNormalizer(job) {
    const compiler = get_Js_Ts_Compiler();
    if (!compiler?.utils) {
      throw new Error("Compiler utils module unavailable");
    }
    return compiler.utils.normalize(job.data);
  },

  async payloadDeepScan(job) {
    const compiler = get_Js_Ts_Compiler();
    if (!compiler?.utils) {
      throw new Error("Compiler utils module unavailable");
    }
    return compiler.utils.deepScan(job.data);
  },

  async ExtractUnitPartOfCode(job) {
    const compiler = get_Js_Ts_Compiler();
    if (!compiler?.utils) {
      throw new Error("Compiler utils module unavailable");
    }
    return compiler.utils.extract(job.data);
  },
};

/* ================================
   WORKER ENTRY
================================ */

export default async function workerFunction(job: Job) {
  console.log("👷 Worker Function booted");

  const start = Date.now();

  try {
    const handler = TASK_HANDLERS[job.task];

    if (!handler) {
      throw new Error(`Unknown task: ${job.task}`);
    }

    const result = await handler(job);

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
    return {
      jobId: job.id,
      task: job.task,
      result: null,
      error: err.message,
    };
  } finally {
    console.log(
      `⏱ Worker finished ${job.id} in ${Date.now() - start}ms`
    );
  }
}