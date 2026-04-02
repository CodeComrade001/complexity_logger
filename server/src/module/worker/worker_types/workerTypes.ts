import { ComplexityNotation } from "../../../compilers/TS_JS_Compiler/interfaces/complexityGeneratorInterface.js";
import { FetchUnitPartOfCodeProps } from "../../../compilers/TS_JS_Compiler/interfaces/fetchUnitPartOfCodeProps.js";
import { FilePayload, normalizedPayloadData } from "../../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";
import { Node as TsMorphNode } from "ts-morph";

export interface BaseJob {
  id: string;
  task: string;
}

export interface FreeTierAnalysisJob extends BaseJob {
  task: "freeTierAnalysis";
  data: normalizedPayloadData;
}

export interface PaidTierAnalysisJob extends BaseJob {
  task: "paidTierAnalysis";
  data: normalizedPayloadData;
}

export interface PayloadNormalizerJob extends BaseJob {
  task: "payloadNormalizer";
  data: FilePayload;
}

export interface EnhancedAnalyzer_v2Job extends BaseJob {
  task: "EnhancedAnalyzer_v2";
  data: {
    nodeText: TsMorphNode
    keywordSet: Set<string>
    functionName: string | null;
  };
}

export interface ExtractUnitPartOfCodeJob extends BaseJob {
  task: "ExtractUnitPartOfCode";
  data: {
    props: FetchUnitPartOfCodeProps;
    files: FileUploadModel[];
    unitIndex: number;
  };
}

export interface AIReasoningJob extends BaseJob {
  task: "AIReasoning";
  data: {
    notation: { time: ComplexityNotation; space: ComplexityNotation };
    signals: string[];
  };
}

// ✅ FIXED: included missing type
export type Job =
  | FreeTierAnalysisJob
  | PaidTierAnalysisJob
  | PayloadNormalizerJob
  | ExtractUnitPartOfCodeJob
  | EnhancedAnalyzer_v2Job
  | AIReasoningJob;

export interface JobResult {
  jobId: string;
  task: Job["task"];
  result: any;
  error?: string;
}