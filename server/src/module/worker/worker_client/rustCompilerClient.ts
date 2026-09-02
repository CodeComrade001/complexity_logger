import { publishCompilerAnalysis } from "../../../infra/messaging/compiler.publisher.js";
import { WorkerFile } from "../worker_types/workerTypes.js";

export async function executeRustCompiler(
  payload: WorkerFile[]
): Promise<{ jobId: string }> {
  const jobId = crypto.randomUUID();

  console.log("RUST worker created and message is being published", jobId)

  await publishCompilerAnalysis({
    event: "compiler.analysis.requested",
    jobId,
    language: "rust",
    files: payload,
    createdAt: new Date().toISOString(),
  });

  return {
    jobId,
  };
}