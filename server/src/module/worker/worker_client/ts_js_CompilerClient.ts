import { WorkerFile } from "../worker_types/workerTypes.js";
import { CompilerAnalyzeResponse } from "./worker_client_utils/compiler.api.js";
import { executeCompiler } from "./worker_client_utils/compiler.executor.js";


const JS_TS_COMPILER_URL =
  process.env.JS_TS_COMPILER_URL ??
  "http://localhost:4004";

export function executeJS_Ts_Compiler(
  payload: WorkerFile[]
): Promise<CompilerAnalyzeResponse> {
  return executeCompiler<WorkerFile[], CompilerAnalyzeResponse>(
    JS_TS_COMPILER_URL,
    payload,
    "Rust"
  );
}