import { ComplexityNotation } from "../../../compilers/TS_JS_Compiler/interfaces/complexityGeneratorInterface.js";
import { FetchUnitPartOfCodeProps } from "../../../compilers/TS_JS_Compiler/interfaces/fetchUnitPartOfCodeProps.js";
import { FilePayload, normalizedPayloadData } from "../../../compilers/TS_JS_Compiler/modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";
import { Node as TsMorphNode } from "ts-morph";

// ============================================================================
// BASE
// ============================================================================

export interface BaseJob {
  id: string;
  task: string;
}

// ============================================================================
// EXISTING TS/JS JOBS (LEGACY)
// ============================================================================

export interface FreeTierAnalysisJob extends BaseJob {
  task: "freeTierAnalysis";
  data: normalizedPayloadData;
}

export interface PaidTierAnalysisJob extends BaseJob {
  task: "paidTierAnalysis";
  data: WorkerFile[];
}

export interface PayloadNormalizerJob extends BaseJob {
  task: "payloadNormalizer";
  data: FilePayload;
}

export interface PayloadDeepScanJob extends BaseJob {
  task: "payloadDeepScan";
  data: WorkerFile[];
}

export interface EnhancedAnalyzer_v2Job extends BaseJob {
  task: "EnhancedAnalyzer_v2";
  data: {
    nodeText: TsMorphNode;
    keywordSet: Set<string>;
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

export interface Ts_js_compiler_Job extends BaseJob {
  task: "ts_js_compiler";
  data: WorkerFile[];
}

// ============================================================================
// PLUGIN EXTENSIONS (NEW COMPILERS ADDED CLEANLY)
// ============================================================================

export interface Go_compiler_Job extends BaseJob {
  task: "go_compiler";
  data: WorkerFile[];
}

export interface Java_compiler_Job extends BaseJob {
  task: "java_compiler";
  data: WorkerFile[];
}

export interface Python_compiler_Job extends BaseJob {
  task: "python_compiler";
  data: WorkerFile[];
}

export interface Zig_compiler_Job extends BaseJob {
  task: "zig_compiler";
  data: WorkerFile[];
}

export interface Rust_compiler_Job extends BaseJob {
  task: "rust_compiler";
  data: WorkerFile[];
}

export interface Kotlin_compiler_Job extends BaseJob {
  task: "kotlin_compiler";
  data: WorkerFile[];
}

// ============================================================================
// UNION TYPE (UPDATED LEGACY + PLUGINS)
// ============================================================================

export type Job =
  | FreeTierAnalysisJob
  | PaidTierAnalysisJob
  | PayloadNormalizerJob
  | ExtractUnitPartOfCodeJob
  | EnhancedAnalyzer_v2Job
  | AIReasoningJob
  | PayloadDeepScanJob
  | Ts_js_compiler_Job
  | Go_compiler_Job
  | Java_compiler_Job
  | Python_compiler_Job
  | Zig_compiler_Job
  | Rust_compiler_Job
  | Kotlin_compiler_Job;

// ============================================================================
// RESULT TYPE (UNCHANGED)
// ============================================================================

export interface JobResult {
  jobId: string;
  task: Job["task"];
  result: any;
  error?: string;
}

// ============================================================================
// WORKER FILE (UNCHANGED)
// ============================================================================

export type WorkerFile = {
  name: string;
  content: string;
  language: string;
};