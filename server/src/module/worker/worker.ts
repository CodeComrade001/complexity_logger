import { parentPort } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes.js";

import { ComplexityOrchestrator_v1 } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator_v1/complexity_orchestrator.js";
import { PayloadNormalizer } from "../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "../../compilers/TS_JS_Compiler/modules/fetchPartOfCode.js";
import { EnhancedAnalyzer_v2 } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator_v1/paidTierResources/enhancedAnalyzer_v2.js";
import { ComplexityReasonGenerator } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";

const port = parentPort!;
if (!port) throw new Error("Must run as worker");

// persistent instances
const aiReasonEXplainer = new ComplexityReasonGenerator();
const enhancedAnalyzer = new EnhancedAnalyzer_v2(aiReasonEXplainer);
const complexityOrchestrator = new ComplexityOrchestrator_v1(new Set<string>(), enhancedAnalyzer);
const normalizer = new PayloadNormalizer();
const extractor = new GetUnitPartOfCode();

port.on("message", async (job: Job) => {
  const start = Date.now();
  console.log("Turbo Log  ~ start:", start);
  console.log("Turbo Log  ~ start:", start);

  try {
    let result: any;

    switch (job.task) {
      case "freeTierAnalysis":
        result = await complexityOrchestrator.executeFreeTier(job.data);
        break;

      case "paidTierAnalysis":
        result = await complexityOrchestrator.executePaidTier(job.data);
        break;

      case "payloadNormalizer":
        result = normalizer.normalize(job.data);
        break;

      case "ExtractUnitPartOfCode":
        result = extractor.extract(
          job.data.props,
          job.data.files,
          job.data.unitIndex
        );
        break;

      case "EnhancedAnalyzer_v2":
        // ⚠️ Ensure node is NOT a complex object from main thread
        result = enhancedAnalyzer.run(
          job.data.nodeText, // pass raw text instead of complex object
          job.data.functionName,
          job.data.keywordSet // safe rebuild
        );
        break;

      default:
        throw new Error(`Unknown task: ${job.task}`);
    }

    const jobResult: JobResult = {
      jobId: job.id,
      task: job.task,
      result,
    };

    port.postMessage(jobResult);

    console.log(`Worker completed job ${job.id} in ${Date.now() - start}ms`);

  } catch (err: any) {
    port.postMessage({
      jobId: job.id,
      task: job.task,
      result: null,
      error: err.message,
    });
  }
});