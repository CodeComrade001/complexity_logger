import { WorkerFile } from "../../../module/worker/worker_types/workerTypes.js";

export interface CompilerAnalysisRequested {
  event: "compiler.analysis.requested";
  requestId: string;
  executionId: string;
  language: string;
  files: WorkerFile[];
  createdAt: string;
}