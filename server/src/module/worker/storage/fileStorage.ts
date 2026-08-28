import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JobResult } from "../worker_types/workerTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the folder, not the file
const RESULTS_FOLDER = path.join(__dirname, "jobs_storage");

// Ensure the folder exists
if (!fs.existsSync(RESULTS_FOLDER)) {
  fs.mkdirSync(RESULTS_FOLDER, { recursive: true });
}

export function saveResult(jobId: string | number, data: JobResult): void {
  const filePath = path.join(RESULTS_FOLDER, `${jobId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readResult(jobId: string | number): JobResult | null {
  const filePath = path.join(RESULTS_FOLDER, `${jobId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function editResult(
  jobId: string | number,
  newData: Partial<JobResult>
): JobResult {
  const existing = readResult(jobId);
  if (!existing) throw new Error(`Result for job ${jobId} not found`);

  const merged = { ...existing, ...newData };
  saveResult(jobId, merged);
  return merged;
}