import { parentPort } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes";
import { saveResult } from "../utils/fileStorage";
import { FilePayload, normalizedPayloadData } from "../../compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface";
import { ComplexityOrchestrator_v1 } from "../../compiler/modules/complexityGenerator_v1/complexity_orchestrator";
import { PayloadNormalizer } from "../../compiler/modules/complexityOrchestratorHelpers/payloadNormalizer";
import { GetUnitPartOfCode } from "../../compiler/modules/fetchPartOfCode";
import { FetchUnitPartOfCodeProps } from "../../compiler/interfaces/fetchUnitPartOfCodeProps";
import { FileUploadModel } from "../model/fileInterface";
import { AIComplexityExplainer } from "../../compiler/modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator";
import { ComplexityNotation } from "../../compiler/interfaces/complexityGeneratorInterface";


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
