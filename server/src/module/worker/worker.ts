import { parentPort } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes.js";
import { saveResult } from "../utils/fileStorage.js";
import { FilePayload, normalizedPayloadData } from "../../compliers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { ComplexityOrchestrator_v1 } from "../../compliers/TS_JS_Compiler/modules/complexityGenerator_v1/complexity_orchestrator.js";
import { PayloadNormalizer } from "../../compliers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "../../compliers/TS_JS_Compiler/modules/fetchPartOfCode.js";
import { FetchUnitPartOfCodeProps } from "../../compliers/TS_JS_Compiler/interfaces/fetchUnitPartOfCodeProps.js";
import { FileUploadModel } from "../file_Interface/fileInterface.js";
import { AIComplexityExplainer } from "../../compliers/TS_JS_Compiler/modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { ComplexityNotation } from "../../compliers/TS_JS_Compiler/interfaces/complexityGeneratorInterface.js";


// Listen for job messages
parentPort?.on("message", (job: Job) => {
  let result: any;
  const complexityOrchestrator = new ComplexityOrchestrator_v1();
  const normalizer = new PayloadNormalizer();
  const extractor = new GetUnitPartOfCode();
  const aiReasoning = new AIComplexityExplainer()

  switch (job.task) {
    case "freeTierAnalysis":
      result = complexityOrchestrator.executeFreeTier(job.data as normalizedPayloadData);
      break;
    case "paidTierAnalysis":
      result = complexityOrchestrator.executePaidTier(job.data as normalizedPayloadData);
      break;
    case "payloadNormalizer":
      result = normalizer.normalize(job.data as FilePayload);
      break;
    case "ExtractUnitPartOfCode":
      result = extractor.extract(job.data as FetchUnitPartOfCodeProps,
        job.data as FileUploadModel[],
        job.data as number);
      break;
    case "AIReasoning":
      const { notation, signals } = job.data as {
        notation: { time: ComplexityNotation, space: ComplexityNotation },
        signals: string[]
      };

      result = aiReasoning.explainComplexity(notation, signals);
      break;
    default:
      result = null;
  }

  const jobResult: JobResult = {
    jobId: job.id,
    task: job.task,
    result,
  };

  saveResult(job.id, jobResult);
  parentPort?.postMessage(jobResult);
});
