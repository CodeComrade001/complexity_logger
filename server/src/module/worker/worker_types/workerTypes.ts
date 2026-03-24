// worker_types/workerTypes.ts

import { ComplexityNotation } from "../../../compilers/TS_JS_Compiler/interfaces/complexityGeneratorInterface.js";
import { FetchUnitPartOfCodeProps } from "../../../compilers/TS_JS_Compiler/interfaces/fetchUnitPartOfCodeProps.js";
import { FilePayload, normalizedPayloadData } from "../../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";

// Base Job
export interface BaseJob {
  id: string;
  task: string;
}

// Free/Paid tier analysis job
export interface FreeTierAnalysisJob extends BaseJob {
  task: "freeTierAnalysis";
  data: normalizedPayloadData;
}

export interface PaidTierAnalysisJob extends BaseJob {
  task: "paidTierAnalysis";
  data: normalizedPayloadData;
}

// Payload normalizer job
export interface PayloadNormalizerJob extends BaseJob {
  task: "payloadNormalizer";
  data: FilePayload;
}

// Extract unit of code job
export interface ExtractUnitPartOfCodeJob extends BaseJob {
  task: "ExtractUnitPartOfCode";
  data: {
    props: FetchUnitPartOfCodeProps;
    files: FileUploadModel[];
    unitIndex: number;
  };
}

// AI Reasoning job
export interface AIReasoningJob extends BaseJob {
  task: "AIReasoning";
  data: {
    notation: { time: ComplexityNotation; space: ComplexityNotation };
    signals: string[];
  };
}

// Discriminated union of all jobs
export type Job =
  | FreeTierAnalysisJob
  | PaidTierAnalysisJob
  | PayloadNormalizerJob
  | ExtractUnitPartOfCodeJob
  | AIReasoningJob;

// Job result
export interface JobResult {
  jobId: string;
  task: Job["task"];
  result: any;
  error?: string;
}