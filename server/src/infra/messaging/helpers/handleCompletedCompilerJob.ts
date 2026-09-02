import { IMongoRepository } from "../../../module/ports/IMongoRepository.js";
import { IReaRealtimeNotifier } from "../../../realtime/realtimeNotifier.js";

export interface IHandleCompletedCompilerJobResponse {
  execute(jobId: string[]): Promise<{ success: boolean; message: string; data: unknown | null; }>;
}

export class HandleCompletedCompilerJob implements IHandleCompletedCompilerJobResponse {
  constructor(
    private readonly mongoRepo: IMongoRepository,
    private readonly notifier: IReaRealtimeNotifier
  ) { }


  async execute(jobId: string[]): Promise<{ success: boolean; message: string; data: unknown | null; }> {

    const { success, message, data: job } = await this.mongoRepo.findByJobId(jobId);
    console.dir(job, { depth: 1 });
    console.log("Turbo Log  ~ HandleCompletedCompilerJob ~ execute ~ job:", job);

    if (!success) {
      return {
        success: false,
        message: message,
        data: null
      };
    }

    if (!job) {
      return {
        success: false,
        message: "Job not found",
        data: null
      };
    }

    this.notifier.send(
      jobId,
      "compiler.completed",
      job
    );

    return {
      success: true,
      message: "Job completed successfully",
      data: job
    };
  }
}