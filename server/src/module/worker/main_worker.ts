import fs from "fs";
import { Worker } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes.js";
import { readResult, editResult } from "../utils/fileStorage.js";
import { WorkerPool } from "./workerPool.js";
// Load jobs from JSON
const jobs: Job[] = JSON.parse(fs.readFileSync("jobs.json", "utf-8"));
const maxWorkers = 30;
const pool = new WorkerPool(maxWorkers);

// Run a single job in a worker
function runJob(job: Job): Promise<JobResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.ts");

    worker.on("message", (msg: JobResult) => {
      resolve(msg);
      worker.terminate();
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });

    worker.postMessage(job);
  });
}

// Run all jobs in parallel
export async function runAllJobsParallel(jobsArray: Job[]): Promise<JobResult[]> {
  const promises = jobsArray.map((job) => pool.run(job));
  return Promise.all(promises);
}

// Example usage
(async () => {
  const results = await runAllJobsParallel(jobs);
  console.log("All jobs finished:");
  results.forEach((r) => console.log(`Job ${r.jobId}: ${r.result}`));

  // Example reading a result
  const firstJob = jobs[0];
  const storedResult = readResult(firstJob.id);
  console.log("Read stored result:", storedResult);

  // Example editing a result
  const updated = editResult(firstJob.id, { note: "Checked and verified" });
  console.log("Edited result:", updated);
})();
