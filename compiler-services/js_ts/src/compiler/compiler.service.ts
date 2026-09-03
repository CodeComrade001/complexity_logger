import { randomUUID } from "node:crypto";

import type {
  Compiler,
  CompilerPayload,
  CompilerResult,
} from "./compiler.interface.js";

import {
  ResultStore,
  type CompilerJob,
} from "../storage/result.store.js";

import { WorkerClient } from "../worker/workerClient.js";
import { IMongoRepository } from "../ports/IMongoRepository.js";
import { JS_TS_CreateCompiler } from "./TS_JS_Compiler/ts_js_bootstrap.js";

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
    payload: CompilerPayload
  ) {

    // const payloads = Array.isArray(payload)
    //   ? payload
    //   : [payload];

    if (payload.files.length === 0) {
      throw new Error("Payload cannot be empty");
    }


    const job: CompilerJob = {
      jobId: payload.executionId,
      status: "queued",
      results: [],
      createdAt: Date.now()
    };

    this.resultStore.create(job);
    const seeStoredJobLogs = await this.mongoRepo.storeCreatedJob(payload.requestId, payload)
    console.log("Turbo Log  ~ CSharpCompilerService ~ submit ~ seeStoredJobLogs:", seeStoredJobLogs);

    const compiler =
      this.createCompiler();

    return this.process(
      payload.requestId,
      payload.executionId,
      compiler,
      payload
    );

  }

  private createCompiler(): Compiler {

    return new JS_TS_CreateCompiler()
      .init()
      .compiler;
  }

  private async process(
    requestId: string,
    executionId: string,
    compiler: Compiler,
    payloads: CompilerPayload
  ): Promise<{ jobId: string; results: CompilerResult[] }> {
    console.dir(payloads, {
      depth: 1,
    });

    this.resultStore.update(executionId, {
      status: "processing"
    });

    const results: { jobId: string; results: CompilerResult[] } = { jobId: executionId, results: [] };

    try {

      for (const payload of payloads.files) {

        try {

          const result =
            await compiler.execute(
              payload.content,
              payload.name
            );

          results.results.push({
            success: true,
            fileName: payload.name,
            result
          });

        } catch (error) {

          results.results.push({
            success: false,
            fileName: payload.name,
            error: this.getErrorMessage(error)
          });

        }
      }

      this.resultStore.update(executionId, {
        status: "completed",
        results: results.results,
        completedAt: Date.now()
      });

      return { jobId: executionId, results: results.results }

    } catch (error) {

      this.resultStore.update(executionId, {
        status: "failed",
        results: results.results,
        error: this.getErrorMessage(error),
        completedAt: Date.now()
      });

      return { jobId: executionId, results: [] };
    }
  }

  getResult(
    executionId: string
  ): CompilerJob | undefined {

    return this.resultStore.get(executionId);
  }

  getStatus() {

    const jobs =
      this.resultStore.getAll();

    return {
      totalJobs: jobs.length,

      processingJobs:
        jobs.filter(
          job => job.status === "processing"
        ).length,

      completedJobs:
        jobs.filter(
          job => job.status === "completed"
        ).length,

      failedJobs:
        jobs.filter(
          job => job.status === "failed"
        ).length
    };
  }

  private getErrorMessage(
    error: unknown
  ): string {

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}