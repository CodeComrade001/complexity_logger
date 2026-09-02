import { IFileRepository } from "../ports/IFileRepository.js";
import { IMongoRepository } from "../ports/IMongoRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class Get_Csharp_FileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;
  private readonly MongoRepo: IMongoRepository;

  constructor(repo: IFileRepository, workerClient: WorkerClient, mongoRepo: IMongoRepository) {
    this.repo = repo;
    this.workerClient = workerClient;
    this.MongoRepo = mongoRepo;
  }

  public async execute(filesToAnalyze: WorkerFile[]) {

    const { jobId } = await this.workerClient.execute("csharp_compiler", filesToAnalyze);

    if (!jobId || jobId === "") {
      return {
        success: false,
        message: "Failed to get JobId from worker",
      };
    }
    return {
      success: true,
      data: jobId,
    };
  }
}