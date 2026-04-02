import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Job, JobResult } from "./worker_types/workerTypes.js";
import { WorkerPool } from "./workerPool.js";
import { editResult, readResult, saveResult } from "./storage/fileStorage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobs: Job[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./jobs.json"), "utf-8")
);

const pool = new WorkerPool(5);

export async function runAllJobsParallel(jobsArray: Job[]): Promise<JobResult[]> {
  console.log("Running jobs:", jobsArray.length);

  const results = await Promise.all(
    jobsArray.map(async (job) => {
      const result = await pool.run(job);

      // ✅ centralize file write here
      saveResult(job.id, result);

      return result;
    })
  );

  return results;
}

(async () => {
  const results = await runAllJobsParallel(jobs);

  console.log("All jobs finished:");
  results.forEach((r) => {
    console.log(`Job ${r.jobId}:`, r.result ?? r.error);
  });

  const firstJob = jobs[0];
  const stored = readResult(firstJob.id);
  console.log("Stored:", stored);

  const updated = editResult(firstJob.id, { result: stored?.result });
  console.log("Updated:", updated);
})();