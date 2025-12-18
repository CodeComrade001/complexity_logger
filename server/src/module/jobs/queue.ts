import { FileUploadModel } from "../model/fileInterface";

type Job = {
  jobId: string;
  files: FileUploadModel[];
  targets: string[];
};

const MAX_QUEUE_SIZE = 100;
const queue: Job[] = [];

export function enqueue(job: Job) {
  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new Error("System overloaded. Try again later.");
  }
  queue.push(job);
}

export function dequeue(): Job | undefined {
  return queue.shift();
}
