import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import { Job, JobResult } from "./worker_types/workerTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkerWrapper {
  worker: Worker;
  busy: boolean;
}

interface WorkerTask {
  job: Job;
  resolve: (result: JobResult) => void;
  reject: (err: any) => void;
}

const MAX_QUEUE = 1000;
const WORKER_TIMEOUT = 15000;
const workerPath = path.resolve(__dirname, "./worker.ts");

export class WorkerPool {
  private workers: WorkerWrapper[] = [];
  private queue: WorkerTask[] = [];
  private maxWorkers: number;

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(workerPath);
      this.workers.push({ worker, busy: false });
    }
  }

  run(job: Job): Promise<JobResult> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= MAX_QUEUE) {
        return reject(new Error("Queue overflow"));
      }

      this.queue.push({ job, resolve, reject });
      this.process();
    });
  }

  private process() {
    for (const wrapper of this.workers) {
      if (wrapper.busy) continue;

      const task = this.queue.shift();
      if (!task) return;

      wrapper.busy = true;

      let finished = false;

      const done = (err?: any, result?: JobResult) => {
        if (finished) return;
        finished = true;

        clearTimeout(timeout);

        wrapper.busy = false;

        if (err) task.reject(err);
        else task.resolve(result!);

        this.process();
      };

      const timeout = setTimeout(() => {
        wrapper.worker.terminate();
        done(new Error("Worker timeout"));
      }, WORKER_TIMEOUT);

      const handleMessage = (msg: JobResult) => {
        done(undefined, msg);
      };

      const handleError = (err: any) => {
        done(err);
      };

      wrapper.worker.once("message", handleMessage);
      wrapper.worker.once("error", handleError);
      // wrapper.worker.on("exit", () => respawnWorker())


      wrapper.worker.postMessage(task.job);
    }
  }
}