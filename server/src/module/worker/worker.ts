import { parentPort } from "worker_threads";
import { runExtraction } from "./extract.task";

parentPort!.on("message", async (job) => {
  try {
    const result = await runExtraction(job);
    console.log("Turbo Log  ~ result:", result);
    parentPort!.postMessage({ jobId: job.jobId, result });
  } catch (e: any) {
    parentPort!.postMessage({ jobId: job.jobId, error: e?.message });
  }
});
