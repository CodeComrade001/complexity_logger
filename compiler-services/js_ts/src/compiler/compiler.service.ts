import { randomUUID } from "node:crypto";

import type {
  CompilerPayload,
} from "./compiler.interface.js";

import {
  ResultStore,
  type CompilerJob,
} from "../storage/result.store.js";

import { WorkerClient } from "../worker/workerClient.js";
import { IMongoRepository } from "../ports/IMongoRepository.js";

export class Js_Ts_CompilerService {
  private readonly resultStore: ResultStore;
  private readonly workerClient: WorkerClient;
  private readonly mongoRepo: IMongoRepository;

  constructor(
    resultStore: ResultStore,
    workerClient: WorkerClient,
    mongoRepo: IMongoRepository
  ) {
    this.resultStore = resultStore;
    this.workerClient = workerClient;
    this.mongoRepo = mongoRepo;
  }

  async submit(
    payload: CompilerPayload | CompilerPayload[]
  ) {
    const payloads = Array.isArray(payload)
      ? payload
      : [payload];

    if (payloads.length === 0) {
      throw new Error("Payload cannot be empty");
    }

    const { success, data: sanitizedPayloads } = await this.workerClient.execute("payloadDeepScan", payloads);

    if (!success) {
      return {
        success: false,
        data: null,
        message: "Sanitization failed",
      };
    }

    const jobId = randomUUID();

    const job: CompilerJob = {
      jobId,
      status: "queued",
      results: [],
      createdAt: Date.now(),
    };

    // Create the job BEFORE sending it to the worker.
    this.resultStore.create(job);

    this.mongoRepo.storeCreatedJob(jobId, sanitizedPayloads)

    // Send the job to the worker.
    const { success: isCompilerWorkerTrue, data: compilerWorkerData } = await this.workerClient.execute(
      "ts_js_compiler",
      sanitizedPayloads
    );

    if (!isCompilerWorkerTrue) {
      return {
        success: false,
        data: null,
      };
    }

    this.mongoRepo.storeCreatedJob(jobId, compilerWorkerData)

    return {
      success: true,
      data: compilerWorkerData,
    };
  }

  getResult(
    jobId: string
  ): CompilerJob | undefined {
    return this.resultStore.get(jobId);
  }

  getStatus() {
    const jobs = this.resultStore.getAll();

    return {
      totalJobs: jobs.length,

      queuedJobs:
        jobs.filter(
          (job) => job.status === "queued"
        ).length,

      processingJobs:
        jobs.filter(
          (job) => job.status === "processing"
        ).length,

      completedJobs:
        jobs.filter(
          (job) => job.status === "completed"
        ).length,

      failedJobs:
        jobs.filter(
          (job) => job.status === "failed"
        ).length,
    };
  }
}