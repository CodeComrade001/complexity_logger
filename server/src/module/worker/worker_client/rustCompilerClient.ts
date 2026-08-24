import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";

const RUST_COMPILER_URL =
  process.env.RUST_COMPILER_URL ??
  "http://localhost:4006";

export function executeRustCompiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    RUST_COMPILER_URL,
    payload,
    "Rust"
  );
}