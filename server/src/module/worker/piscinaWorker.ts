console.log("👷 Worker booted");

import { Project } from "ts-morph";
import { saveResult } from "./storage/fileStorage.js";
import {
  CompilerInterface,
  CreateCompiler,
} from "../../compilers/TS_JS_Compiler/ts_js_bootstrap.js";
import { Job } from "./worker_types/workerTypes.js";
import { enforceProjectLimit, processFilesBatch } from "./utils/file_process.js";

/* ================================
   SINGLETONS
================================ */

let compilerInstance: CompilerInterface | null = null;
let projectInstance: Project | null = null;

export function getCompiler(): CompilerInterface {
  if (!compilerInstance) {
    console.log("🚀 Initializing compiler ONCE per worker thread");
    const instance = new CreateCompiler();
    compilerInstance = instance.init();
  }
  return compilerInstance;
}

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
   WORKER ENTRY
================================ */

export default async function workerFunction(job: Job) {
  console.log("👷 Worker Function booted");

  const start = Date.now();

  const compiler = getCompiler();
  const project = getProject();

  try {
    let result;

    switch (job.task) {
      case "freeTierAnalysis":
        result = await compiler.analysis.freeTier(job.data);
        break;

      case "ts_js_compiler": {
        const files = job.data as any[];

        result = await processFilesBatch(files, project, compiler);

        // ✅ CLEANUP PROJECT MEMORY
        enforceProjectLimit(project);

        break;
      }

      case "payloadNormalizer":
        result = compiler.utils.normalize(job.data);
        break;

      case "payloadDeepScan":
        result = compiler.utils.deepScan(job.data);
        break;

      case "ExtractUnitPartOfCode":
        result = compiler.utils.extract(
          job.data.props,
          job.data.files
        );
        break;

      default:
        throw new Error(`Unknown task: ${job.task}`);
    }

    // ✅ Persist
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