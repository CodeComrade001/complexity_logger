
import { FileUploadModel } from "../file_Interface/fileInterface.js";
import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class GetFileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }



  public async execute(filesToAnalyze: WorkerFile[]) {
    const { success, data } = await this.workerClient.execute("payloadDeepScan", filesToAnalyze);
    console.log("Turbo Log  ~ GetFileAnalyzer  Worker deep scan ~ execute ~ success:", success);
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ data:", data[0].name);

    if (!success) {
      return {
        success: false,
        data: null,
        message: "Sanitization failed",
      };
    }

    // ✅ ALL heavy work goes to worker
    const result = await this.workerClient.execute(
      "ts_js_compiler",
      data
    );
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ result:", result);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: result,
    };
  }
}
