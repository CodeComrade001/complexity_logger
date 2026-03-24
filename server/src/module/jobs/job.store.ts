import fs from "fs";
import path from "path";

export function saveResult(jobId: string, data: any) {
  //job test
  console.log("Turbo Log  ~ saveResult ~ jobId:", jobId);
  console.log("Turbo Log  ~ saveResult ~ data:", data);

  fs.writeFileSync(
    path.join("storage/results", `${jobId}.json`),
    JSON.stringify(data, null, 2)
  );
}
