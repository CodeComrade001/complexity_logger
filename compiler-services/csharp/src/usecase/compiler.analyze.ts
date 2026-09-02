import { ResultStore } from "../storage/result.store.js";
import { MongoFileRepository } from "../repositories/MongoFileRepository.js";
import { JobModel } from "../models/job.model.js";
import { CSharpCompilerService } from "../compiler/compiler.service.js";
import { CompilerPayload } from "../compiler/compiler.interface.js";

export interface AnalyzeCompilerResult {
  success: boolean;
  message: string;
  jobIdKey: string;
}

const resultStore = new ResultStore();

const mongoRepo = new MongoFileRepository(
  JobModel
);

const compilerService = new CSharpCompilerService(
  resultStore,
  mongoRepo
);

export async function analyzeCompiler(
  payload: CompilerPayload
): Promise<AnalyzeCompilerResult> {
  if (!payload) {
    throw new Error("payload is required");
  }

  try {

    const { jobId, results } = await compilerService.submit(
      payload
    );

    if (!results || results.length === 0) {
      throw new Error("No results returned from compiler service");
    }

    await mongoRepo.storeCreatedJob(jobId, results);

    return {
      success: true,
      message: "C# compiler job accepted",
      jobIdKey: jobId,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to submit compiler job"
    );
  }
}