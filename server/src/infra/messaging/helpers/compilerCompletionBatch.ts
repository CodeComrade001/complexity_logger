import type {
  Channel,
  ConsumeMessage,
} from "amqplib";
import { HandleCompletedCompilerJob, IHandleCompletedCompilerJobResponse } from "./handleCompletedCompilerJob.js";

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 100;

type PendingJob = {
  jobId: string;
  message: ConsumeMessage;
  channel: Channel;
};

export class CompilerCompletionBatcher {
  private pending: PendingJob[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly batchProcessor: IHandleCompletedCompilerJobResponse
  ) { }

  async add(jobId: string, message: ConsumeMessage, channel: Channel) {
    this.pending.push({
      jobId,
      message,
      channel,
    });

    if (this.pending.length >= BATCH_SIZE) {
      await this.flush();
      return;
    }

    if (!this.timer) {
      this.timer = setTimeout(() => {
        void this.flush();
      }, FLUSH_INTERVAL);
    }
  }

  private async flush() {
    if (this.pending.length === 0) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.pending.splice(
      0,
      BATCH_SIZE
    );

    try {
      const jobIds = batch.map(
        ({ jobId }) => jobId
      );

      await this.batchProcessor.execute(jobIds);

      for (const item of batch) {
        item.channel.ack(item.message);
      }
    } catch (error) {
      console.error(
        "Failed processing compiler batch:",
        error
      );

      for (const item of batch) {
        item.channel.nack(
          item.message,
          false,
          true
        );
      }
    }
  }
}
