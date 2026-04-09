
import { FileUploadModel } from "../file_Interface/fileInterface.js";
import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerClient } from "../worker/workerClient.js";

export class GetFileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }

  public async execute(filesToAnalyze: FileUploadModel[]) {
    const { success, data } = await this.workerClient.execute("payloadDeepScan", filesToAnalyze);
    console.log("Turbo Log  ~ GetFileAnalyzer  Worker deep scan ~ execute ~ success:", success);
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ data:", data[0]);

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

    return {
      success: true,
      data: result,
    };
  }
}
