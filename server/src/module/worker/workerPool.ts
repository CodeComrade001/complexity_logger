// workerPool.ts
import { Worker } from "worker_threads";
import { Job, JobResult } from "./worker_types/workerTypes";

interface WorkerTask {
  job: Job;
  resolve: (result: JobResult) => void;
  reject: (err: any) => void;
}

export class WorkerPool {
  private maxWorkers: number = 10;
  private activeWorkers: number = 0;
  private queue: WorkerTask[] = [];

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers;
  }

  // Add a job to the pool
  run(job: Job): Promise<JobResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
      this.next();
    });
  }

  private next() {
    if (this.activeWorkers >= this.maxWorkers) return;

    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers++;
    const worker = new Worker("./worker.js");

    worker.on("message", (msg: JobResult) => {
      task.resolve(msg);
      worker.terminate();
      this.activeWorkers--;
      this.next(); // run next queued job
    });

    worker.on("error", (err) => {
      task.reject(err);
      this.activeWorkers--;
      this.next();
    });

    worker.on("exit", (code) => {
      if (code !== 0) task.reject(new Error(`Worker stopped with code ${code}`));
      this.activeWorkers--;
      this.next();
    });

    worker.postMessage(task.job);
  }
}
