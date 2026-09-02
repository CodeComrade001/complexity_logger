import { MongoFileRepository } from "../repositories/MongoFileRepository.js";
import { CompilerPayload } from "../compiler/compiler.interface.js";
import { GoCompilerService } from "../compiler/compiler.service.js";

export interface AnalyzeCompilerResult {
  success: boolean;
  message: string;
  jobIdKey: string;
}

export async function analyzeCompiler(
  payload: CompilerPayload,
  compilerService: GoCompilerService,
  mongoRepo: MongoFileRepository,
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