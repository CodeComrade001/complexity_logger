// piscinaPool.ts
import { Piscina } from "piscina";
import { getWorkerPath } from "./workerPath.js";

const workerPath = getWorkerPath("piscinaWorker");
console.log("Turbo Log  ~ workerPath:", workerPath);

export const piscina = new Piscina({
  filename: workerPath,
  minThreads: 2,
  maxThreads: 5,
});

