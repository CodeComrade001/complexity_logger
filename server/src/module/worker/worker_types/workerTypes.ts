import { ComplexityNotation } from "../../../compiler/interfaces/complexityGeneratorInterface";

export type JobTask = "freeTierAnalysis" | "paidTierAnalysis" | "payloadNormalizer" | "ExtractUnitPartOfCode" | "AIReasoning" | "TimeComplexityGenerator" | "SpaceComplexityGenerator";

export interface Job {
  id: string | number;
  task: JobTask;
  data: any; // you can narrow this later e.g., number[] if all tasks expect arrays
}

export interface JobResult {
  jobId: string | number;
  task?: JobTask;
  result: any;
  note?: string;
}

