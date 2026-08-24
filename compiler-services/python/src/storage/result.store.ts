import type {
  CompilerResult
} from "../compiler/compiler.interface.js";

export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface CompilerJob {
  jobId: string;
  status: JobStatus;
  results: CompilerResult[];
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export class ResultStore {
  private readonly jobs =
    new Map<string, CompilerJob>();

  create(job: CompilerJob): void {
    this.jobs.set(job.jobId, job);
  }

  get(jobId: string): CompilerJob | undefined {
    return this.jobs.get(jobId);
  }

  update(
    jobId: string,
    updates: Partial<CompilerJob>
  ): CompilerJob | undefined {

    const job = this.jobs.get(jobId);

    if (!job) {
      return undefined;
    }

    Object.assign(job, updates);

    return job;
  }

  getAll(): CompilerJob[] {
    return Array.from(this.jobs.values());
  }

  size(): number {
    return this.jobs.size;
  }
}