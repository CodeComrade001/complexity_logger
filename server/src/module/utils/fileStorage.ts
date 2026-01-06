import fs from "fs";
import path from "path";
import { JobResult } from "../worker/worker_types/workerTypes";

const RESULTS_DIR = path.join("storage", "results");
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

export function saveResult(jobId: string | number, data: JobResult): void {
  const filePath = path.join(RESULTS_DIR, `${jobId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readResult(jobId: string | number): JobResult | null {
  const filePath = path.join(RESULTS_DIR, `${jobId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function editResult(jobId: string | number, newData: Partial<JobResult>): JobResult {
  const existing = readResult(jobId);
  if (!existing) throw new Error(`Result for job ${jobId} not found`);
  const merged = { ...existing, ...newData };
  saveResult(jobId, merged);
  return merged;
}
