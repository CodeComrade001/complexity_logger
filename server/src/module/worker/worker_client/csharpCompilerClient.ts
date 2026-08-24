import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";

const CSHARP_COMPILER_URL =
  process.env.CSHARP_COMPILER_URL ??
  "http://localhost:4001";

export function executeCSharpCompiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    CSHARP_COMPILER_URL,
    payload,
    "Rust"
  );
}