import { parentPort } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes.js";
import { editResult, readResult, saveResult } from "../utils/fileStorage.js";
import { FilePayload, normalizedPayloadData } from "../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { ComplexityOrchestrator_v1 } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator_v1/complexity_orchestrator.js";
import { PayloadNormalizer } from "../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "../../compilers/TS_JS_Compiler/modules/fetchPartOfCode.js";
import { AIComplexityExplainer } from "../../compilers/TS_JS_Compiler/modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";


// Listen for job messages
if (!parentPort) throw new Error("This script must be run as a worker");
parentPort?.on("message", (job: Job) => {
  let result: any;


  const aiReasoning = new AIComplexityExplainer()
  const complexityOrchestrator = new ComplexityOrchestrator_v1(new Set<string>(), aiReasoning);
  const normalizer = new PayloadNormalizer();
  const extractor = new GetUnitPartOfCode();

  (async () => {
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
        result = extractor.extract(job.data.props, job.data.files, job.data.unitIndex);
        break;

      case "AIReasoning":
        result = aiReasoning.explainComplexity(job.data.notation, job.data.signals);
        break;

      default:
        const _exhaustiveCheck: never = job; // will error if a new task is added but not handled
        result = null;
    }
  })();

  const jobResult: JobResult = {
    jobId: job.id,
    task: job.task,
    result,
  };



  saveResult(job.id, jobResult);
  parentPort?.postMessage(jobResult);
});
