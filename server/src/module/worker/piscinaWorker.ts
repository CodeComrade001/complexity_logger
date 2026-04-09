import { Job } from "./worker_types/workerTypes.js";
import { saveResult } from "./storage/fileStorage.js";
import { CompilerInterface, CreateCompiler } from "../../compilers/TS_JS_Compiler/bootstrap.js";
import { Project, SourceFile } from "ts-morph";
import {
  getCachedResult,
  hashContent,
  setCachedResult,
} from "./cache/workerCache.js";


let compilerInstance: CompilerInterface | null = null;
let projectInstance: Project | null = null;

// ✅ Compiler singleton (per worker thread)
function getCompiler(): CompilerInterface {
  if (!compilerInstance) {
    console.log("🚀 Initializing compiler ONCE per worker thread");
    const instance = new CreateCompiler();
    compilerInstance = instance.init();
  }
  return compilerInstance;
}

// ✅ Project singleton (CRITICAL OPTIMIZATION)
export function getProject(): Project {
  if (!projectInstance) {
    console.log("🔥 Initializing Project ONCE per worker");
    projectInstance = new Project({
      useInMemoryFileSystem: true,
    });
  }
  return projectInstance;
}

// 🚀 Piscina worker entry
export default async function workerFunction(job: Job) {
  const start = Date.now();

  const compiler = getCompiler();
  const project = getProject();

  try {
    let result;

    switch (job.task) {
      case "ts_js_compiler":
        result = await compiler.compiler.execute(job.data);
        break;

      case "freeTierAnalysis":
        result = await compiler.analysis.freeTier(job.data);
        break;

      case "paidTierAnalysis": {
        const files = job.data as any[];

        const results = [];

        for (const f of files) {
          const fileHash = hashContent(f.content);

          // ✅ CACHE HIT (skip EVERYTHING)
          const cached = getCachedResult(fileHash);
          if (cached) {
            results.push(cached);
            continue;
          }

          // ✅ REUSE SOURCE FILE (CRITICAL)
          let sourceFile: SourceFile;
          const existing = project.getSourceFile(f.name);

          if (existing) {
            existing.replaceWithText(f.content);
            sourceFile = existing;
          } else {
            sourceFile = project.createSourceFile(f.name, f.content);
          }

          // ✅ NORMALIZE (sync, not async)
          const normalized = compiler.utils.normalize([sourceFile]);

          if (!normalized) {
            results.push({
              success: false,
              message: "Normalization failed",
              data: null,
            });
            continue;
          }

          // ✅ RUN ANALYSIS (FIXED: execute, not exec ❌)
          const fileResult = await compiler.compiler.execute(normalized);

          // ✅ CACHE RESULT
          setCachedResult(fileHash, fileResult);

          results.push(fileResult);
        }

        result = results;
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
          job.data.files,
          job.data.unitIndex
        );
        break;

      default:
        throw new Error(`Unknown task: ${job.task}`);
    }

    // ✅ Persist result
    await saveResult(job.id, {
      jobId: job.id,
      task: job.task,
      result,
    });

    return { jobId: job.id, task: job.task, result };
  } catch (err: any) {
    return {
      jobId: job.id,
      task: job.task,
      result: null,
      error: err.message,
    };
  } finally {
    console.log(`Worker finished ${job.id} in ${Date.now() - start}ms`);
  }
}