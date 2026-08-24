// workerPath.ts
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export function getWorkerPath(fileName: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const isTsRuntime =
    import.meta.url.endsWith(".ts") ||
    process.execArgv.some((arg) => /tsx|ts-node/.test(arg));

  const extension = isTsRuntime ? ".ts" : ".js";
  return path.resolve(__dirname, `./${fileName}${extension}`);
}

