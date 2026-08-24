import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";

const PYTHON_COMPILER_URL =
  process.env.PYTHON_COMPILER_URL ??
  "http://localhost:4005";

export function executePythonCompiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    PYTHON_COMPILER_URL,
    payload,
    "Rust"
  );
}