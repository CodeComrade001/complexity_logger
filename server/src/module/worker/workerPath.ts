// workerPath.ts
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

/**
 * The function `getWorkerPath` determines the file path based on the runtime environment for
 * TypeScript or JavaScript files.
 * @param {string} fileName - The `fileName` parameter is a string that represents the name of the
 * worker file for which you want to get the path.
 * @returns The function `getWorkerPath` returns the resolved path to a worker file based on the
 * provided `fileName` and the runtime environment (whether it is a TypeScript runtime or not). The
 * returned path includes the directory name (`__dirname`) and the file name with the appropriate
 * extension (`.ts` for TypeScript runtime, `.js` for other runtimes).
 */
export function getWorkerPath(fileName: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const isTsRuntime =
    process.execArgv.some(arg => arg.includes("ts-node")) ||
    process.execArgv.some(arg => arg.includes("tsx"));

  const extension = isTsRuntime ? ".ts" : ".js";

  return path.resolve(__dirname, `./${fileName}${extension}`);
}

