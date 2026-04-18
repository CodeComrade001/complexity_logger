import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class Get_Python_FileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }

  public async execute(filesToAnalyze: WorkerFile[]) {
    const { success, data } = await this.workerClient.execute(
      "payloadDeepScan",
      filesToAnalyze
    );

    if (!success) {
      return {
        success: false,
        data: null,
        message: "Sanitization failed",
      };
    }

    const { success: isCompilerWorkerTrue, data: compilerWorkerData } =
      await this.workerClient.execute("python_compiler", data);

    if (!isCompilerWorkerTrue) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: compilerWorkerData,
    };
  }
}