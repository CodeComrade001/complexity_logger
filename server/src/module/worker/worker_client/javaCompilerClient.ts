import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";

const JAVA_COMPILER_URL =
  process.env.JAVA_COMPILER_URL ??
  "http://localhost:4003";

export function executeJavaCompiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    JAVA_COMPILER_URL,
    payload,
    "Rust"
  );
}