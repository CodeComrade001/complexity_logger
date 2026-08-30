import { randomUUID } from 'node:crypto';

import type {
  Compiler,
  CompilerPayload,
  CompilerResult
} from "./compiler.interface.js";

import {
  ResultStore,
  type CompilerJob
} from "../storage/result.store.js";
import { RUST_CreateCompiler } from './RUST_Compiler/rust_bootstrap.js';
import { IMongoRepository } from '../ports/IMongoRepository.js';


export class RustCompilerService {

  private readonly resultStore: ResultStore;
  private readonly mongoRepo: IMongoRepository;

  constructor(resultStore: ResultStore, mongoRepo: IMongoRepository) {
    this.resultStore = resultStore;
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

    const jobId = randomUUID();

    const job: CompilerJob = {
      jobId,
      status: "queued",
      results: [],
      createdAt: Date.now()
    };

    this.resultStore.create(job);
    this.mongoRepo.storeCreatedJob(jobId, payloads)

    const compiler =
      this.createCompiler();

    return this.process(
      jobId,
      compiler,
      payloads
    );

  }

  private createCompiler(): Compiler {

    return new RUST_CreateCompiler()
      .init()
      .compiler;
  }

  private async process(
    jobId: string,
    compiler: Compiler,
    payloads: CompilerPayload[]
  ): Promise<CompilerResult[]> {

    this.resultStore.update(jobId, {
      status: "processing"
    });

    const results: CompilerResult[] = [];

    try {

      for (const payload of payloads) {

        try {

          const result =
            await compiler.execute(
              payload.content,
              payload.name
            );

          results.push({
            success: true,
            fileName: payload.name,
            result
          });

          this.mongoRepo.storeCreatedJob(jobId, result);

        } catch (error) {

          results.push({
            success: false,
            fileName: payload.name,
            error: this.getErrorMessage(error)
          });

        }
      }

      this.resultStore.update(jobId, {
        status: "completed",
        results,
        completedAt: Date.now()
      });

      return results

    } catch (error) {

      this.resultStore.update(jobId, {
        status: "failed",
        results,
        error: this.getErrorMessage(error),
        completedAt: Date.now()
      });

      return []
    }
  }

  getResult(
    jobId: string
  ): CompilerJob | undefined {

    return this.resultStore.get(jobId);
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