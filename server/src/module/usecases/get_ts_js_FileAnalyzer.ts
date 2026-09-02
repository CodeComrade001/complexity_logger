
import { FileUploadModel } from "../file_Interface/fileInterface.js";
import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class Get_js_TS_FileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }



  public async execute(filesToAnalyze: WorkerFile[]) {
    const { success, data } = await this.workerClient.execute("payloadDeepScan", filesToAnalyze);

    if (!success) {
      return {
        success: false,
        data: null,
        message: "Sanitization failed",
      };
    }

    // ✅ ALL heavy work goes to worker
    const { jobId } = await this.workerClient.execute(
      "ts_js_compiler",
      data
    );

    if (!jobId || jobId === "") {
      return {
        success: false,
        message: "Failed to get JobId from worker",
      };
    }
    return {
      success: true,
      jobId,
    };
  }
}
