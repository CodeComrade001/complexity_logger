import { publishCompilerAnalysis } from "../../../infra/messaging/compiler.publisher.js";
import { WorkerFile } from "../worker_types/workerTypes.js";

export async function executePythonCompiler(
  payload: WorkerFile[]
): Promise<{ jobId: string }> {
  const requestId = crypto.randomUUID();
  const executionId = crypto.randomUUID();

  console.log("PYTHON worker created and message is being published", executionId)

  await publishCompilerAnalysis({
    event: "compiler.analysis.requested",
    requestId,
    executionId,
    language: "python",
    files: payload,
    createdAt: new Date().toISOString(),
  });

  return {
    jobId: executionId,
  };
}