import { Job } from "./worker_types/workerTypes.js";
import { saveResult } from "./storage/fileStorage.js";
import { CreateCompiler } from "../../compilers/TS_JS_Compiler/bootstrap.js";

let compilerInstanceInitialize: any = null; // ✅ singleton per worker thread

function getCompiler() {
  if (!compilerInstanceInitialize) {
    console.log("🚀 Initializing compiler ONCE per worker thread");
    const compilerInstance = new CreateCompiler();
    compilerInstanceInitialize = compilerInstance.init();
  }
  return compilerInstanceInitialize;
}

// Piscina worker entry
export default async function workerFunction(job: Job) {
  const start = Date.now();
  console.log("Turbo Log  ~ workerFunction ~ start:", start);

  const compiler = getCompiler();

  try {
    let result;

    switch (job.task) {
      case "freeTierAnalysis":
        result = await compiler.freeTier(job.data);
        break;

      case "paidTierAnalysis":
        result = await compiler.paidTier(job.data);
        break;

      case "payloadNormalizer":
        result = await compiler.normalize(job.data);
        break;

      case "payloadDeepScan":
        const sanitized = await compiler.ts_js_fileScan(job.data);
        return sanitized;

      case "ExtractUnitPartOfCode":
        result = await compiler.extract(job.data.props, job.data.files, job.data.unitIndex);
        break;


      default:
        throw new Error(`Unknown task: ${job.task}`);
    }

    //temporary save file 
    await saveResult(job.id, { jobId: job.id, task: job.task, result });

    return { jobId: job.id, task: job.task, result };
  } catch (err: any) {
    return { jobId: job.id, task: job.task, result: null, error: err.message };
  } finally {
    console.log(`Worker finished ${job.id} in ${Date.now() - start}ms`);
  }
}