// workerPath.ts
import path from "path";
import { fileURLToPath } from "url";

export function getWorkerPath(fileName: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const isTsRuntime =
    process.execArgv.some(arg => arg.includes("ts-node")) ||
    process.execArgv.some(arg => arg.includes("tsx"));

  const extension = isTsRuntime ? ".ts" : ".js";

  return path.resolve(__dirname, `./${fileName}${extension}`);
}