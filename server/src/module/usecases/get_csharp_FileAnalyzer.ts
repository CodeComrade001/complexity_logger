import { IFileRepository } from "../ports/IFileRepository.js";
import { WorkerFile } from "../worker/worker_types/workerTypes.js";
import { WorkerClient } from "../worker/workerClient.js";

export class Get_Csharp_FileAnalyzer {
  private repo: IFileRepository;
  private workerClient: WorkerClient;

  constructor(repo: IFileRepository, workerClient: WorkerClient) {
    this.repo = repo;
    this.workerClient = workerClient;
  }

  public async execute(filesToAnalyze: WorkerFile[]) {
    // const { success, data } = await this.workerClient.execute(
    //   "payloadDeepScan",
    //   filesToAnalyze
    // );
    // console.log("Turbo Log  ~ Get_Csharp_FileAnalyzer ~ execute ~ data:", data);

    // if (!success) {
    //   return {
    //     success: false,
    //     data: null,
    //     message: "Sanitization failed",
    //   };
    // }

    // const { success: isCompilerWorkerTrue, data: compilerWorkerData } = await this.workerClient.execute("csharp_compiler", filesToAnalyze);
    const compilerWorkerData = await this.workerClient.execute("csharp_compiler", filesToAnalyze);
    console.log("Turbo Log  ~ Get_Csharp_FileAnalyzer ~ execute ~ compilerWorkerData:", compilerWorkerData);

    // if (!data) {
    //   return {
    //     success: false,
    //     data: null,
    //   };
    // }

    return {
      success: true,
      data: [],
    };
  }
}