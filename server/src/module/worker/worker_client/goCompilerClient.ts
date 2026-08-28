import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";

const GO_COMPILER_URL =
  process.env.GO_COMPILER_URL ??
  "http://localhost:4002";

export function executeGoCompiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    GO_COMPILER_URL,
    payload,
    "Rust"
  );
}