import fs from "fs";
import path from "path";

export function saveResult(jobId: string, data: any) {
  fs.writeFileSync(
    path.join("storage/results", `${jobId}.json`),
    JSON.stringify(data, null, 2)
  );
}
