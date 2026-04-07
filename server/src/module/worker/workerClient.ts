// workerClient.ts
import { piscina } from "./piscinaPool.js";
import crypto from "crypto";
import { Job } from "./worker_types/workerTypes.js";

export class WorkerClient {
  async execute(task: Job["task"], data: any) {
    const job: Job = {
      id: crypto.randomUUID(),
      task,
      data,
    };

    const result = await piscina.run(job);

    if (result?.error) {
      throw new Error(result.error);
    }

    return result.result;
  }
}