// FileController.ts

import { GetFileHealth } from "../../usecases/GetFileHealth.js";
import { IFileRepository } from "../../ports/IFileRepository.js";
import { GetFileAnalyzer } from "../../usecases/getFileAnalyzer.js";
import { GetFileData } from "../../usecases/GetFileData.js";
import { GetSingleFileReport } from "../../usecases/getSingleFileReport.js";
import { GetFilePatchApply } from "../../usecases/getFilePatchApply.js";
import { GetUser } from "../../usecases/getUser.js";
import { IMongoRepository } from "../../ports/IMongoRepository.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";
import { WorkerClient } from "../../worker/workerClient.js";

export class FileController {
  private getHealthUsecase: GetFileHealth;
  private getFileDataUsecase: GetFileData;
  private getFileAnalyzerUsecase: GetFileAnalyzer;
  private getSingleFileReportUsecase: GetSingleFileReport;
  private getFilePatchApplyUsecase: GetFilePatchApply;
  private getUserUsecase: GetUser;

  constructor(
    postgresRepo: IFileRepository,
    mongoRepo: IMongoRepository,
    workerClient: WorkerClient // ✅ instead of compiler
  ) {
    this.getHealthUsecase = new GetFileHealth(postgresRepo, mongoRepo);
    this.getFileDataUsecase = new GetFileData(postgresRepo);
    this.getSingleFileReportUsecase = new GetSingleFileReport(postgresRepo);
    this.getFilePatchApplyUsecase = new GetFilePatchApply(postgresRepo);
    this.getUserUsecase = new GetUser(postgresRepo);
    workerClient = new WorkerClient()

    this.getFileAnalyzerUsecase = new GetFileAnalyzer(
      postgresRepo,
      workerClient
    );
  }

  public async getFileAnalyzer(request: any, reply: any) {
    try {
      const files: FileUploadModel[] = [];

      for await (const part of request.parts()) {
        if (part.type === "file") {
          files.push({
            name: part.filename,
            size: part.file.bytesRead,
            language: "typescript",
            file: part.file,
            fileContent: part.text,
          });
        }
      }

      if (!files.length) {
        return reply.code(400).send({
          success: false,
          message: "No files provided",
        });
      }


      const result = await this.getFileAnalyzerUsecase.execute(files);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err: any) {
      console.error("Error in getFileAnalyzer:", err);
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }
}