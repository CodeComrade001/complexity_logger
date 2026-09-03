import { publishCompilerAnalysis } from "../../../infra/messaging/compiler.publisher.js";
import { WorkerFile } from "../worker_types/workerTypes.js";


export async function executeCSharpCompiler(
  payload: WorkerFile[]
): Promise<{ jobId: string }> {
  const requestId = crypto.randomUUID();
  const executionId = crypto.randomUUID();


  await publishCompilerAnalysis({
    event: "compiler.analysis.requested",
    requestId,
    executionId,
    language: "csharp",
    files: payload,
    createdAt: new Date().toISOString(),
  });

  return {
    jobId: executionId,
  };
}