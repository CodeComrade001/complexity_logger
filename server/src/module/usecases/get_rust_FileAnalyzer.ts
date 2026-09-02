import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class Get_Rust_FileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }

  public async execute(filesToAnalyze: WorkerFile[]) {

    const { jobId } = await this.workerClient.execute("rust_compiler", filesToAnalyze);

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