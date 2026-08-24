// compiler.executor.ts

import axios from "axios";
import { CompilerAnalyzeResponse, CompilerResultResponse, createApi, createApiGetRequest, createApiPostRequest } from "./compiler.api.js";

const POLL_INTERVAL_MS = 100;
const MAX_POLL_ATTEMPTS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeCompiler<TPayload, TResult>(
  compilerUrl: string,
  payload: TPayload,
  compilerName: string
): Promise<TResult> {
  const api = createApi(compilerUrl);

  let analyzeData: CompilerAnalyzeResponse;

  try {
    analyzeData = await createApiPostRequest<
      { payload: TPayload },
      CompilerAnalyzeResponse
    >(
      api,
      {
        payload,
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      throw new Error(
        `${compilerName} compiler service rejected request: ` +
        `${status ?? "unknown"} ${message ?? error.message}`
      );
    }

    throw error;
  }

  console.log(
    `🧩 ${compilerName} compiler analyze response:`,
    analyzeData
  );

  if (!analyzeData.success || !analyzeData.jobId) {
    throw new Error(
      analyzeData.message ??
      `${compilerName} compiler service failed to create job`
    );
  }

  const { jobId } = analyzeData;

  console.log(
    `🧩 ${compilerName} compiler job submitted: ${jobId}`
  );

  return analyzeData as unknown as TResult;


  // for (
  //   let attempt = 0;
  //   attempt < MAX_POLL_ATTEMPTS;
  //   attempt++
  // ) {
  //   await sleep(POLL_INTERVAL_MS);

  //   try {
  //     const resultData =
  //       await createApiGetRequest<CompilerResultResponse<TResult>>(
  //         api,
  //         `/compiler/result/${jobId}`
  //       );

  //     if (!resultData.success) {
  //       throw new Error(
  //         resultData.message ??
  //         `${compilerName} compiler job ${jobId} failed`
  //       );
  //     }

  //     if (resultData.data !== undefined) {
  //       console.log(
  //         `✅ ${compilerName} compiler job completed: ${jobId}`
  //       );

  //       return resultData.data;
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       // Job does not exist / is not ready yet.
  //       if (error.response?.status === 404) {
  //         continue;
  //       }

  //       throw new Error(
  //         `${compilerName} compiler result request failed: ` +
  //         `${error.response?.status ?? "unknown"} ` +
  //         `${error.response?.data?.message ?? error.message}`
  //       );
  //     }

  //     throw error;
  //   }
  // }

  // throw new Error(
  //   `${compilerName} compiler job ${jobId} timed out`
  // );
}