import { GetFileHealth } from "../../usecases/GetFileHealth";
import { IFileRepository } from "../../ports/IFileRepository";
import { GetFileAnalyzer } from "../../usecases/getFileAnalyzer";
import Compiler from "../../../compiler/compiler";
import { GetFileData } from "../../usecases/GetFileData";
import { GetSingleFileReport } from "../../usecases/getSingleFileReport";
import { GetFilePatchApply } from "../../usecases/getFilePatchApply";
import { GetUser } from "../../usecases/getUser";
import { IMongoRepository } from "../../ports/IMongoRepository";
import { FileUploadModel } from "../../model/fileInterface";

// The controller adapter is thin: it only calls use-cases and maps results to HTTP-friendly objects.
// Keep it simple: no DB, no heavy logic.
export class FileController {
  private getHealthUsecase: GetFileHealth;
  private getFileDataUsecase: GetFileData;
  private getFileAnalyzerUsecase: GetFileAnalyzer;
  private getSingleFileReportUsecase: GetSingleFileReport;
  private getFilePatchApplyUsecase: GetFilePatchApply;
  private getUserUsecase: GetUser;

  constructor(postgresRepo: IFileRepository, mongoRepo: IMongoRepository, compiler: Compiler) {
    this.getHealthUsecase = new GetFileHealth(postgresRepo, mongoRepo);
    this.getFileDataUsecase = new GetFileData(postgresRepo);

    this.getSingleFileReportUsecase = new GetSingleFileReport(postgresRepo);
    this.getFilePatchApplyUsecase = new GetFilePatchApply(postgresRepo);
    this.getUserUsecase = new GetUser(postgresRepo);
    this.getFileAnalyzerUsecase = new GetFileAnalyzer(postgresRepo, compiler);

  }

  public async getHealth(_request: any, reply: any) {
    const result = await this.getHealthUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getFile(request: any, reply: any) {
    const { id } = request.params;
    const result = await this.getFileDataUsecase.execute(id);
    return reply.code(200).send(result);
  }

  public async getFileAnalyzer(request: any, reply: any) {
    try {
      const files: FileUploadModel[] = [];

      for await (const part of request.parts()) {
        if (part.type === "file") {
          files.push({
            name: part.filename,
            size: part.file.bytesRead,
            language: "typescript", // or read from fields
            file: part.file,        // Readable stream ✅
          });
        }
      }

      if (!files || files.length === 0) {
        return { success: false, message: "No files provided for analysis" };
      }
      const { success, data, message } = await this.getFileAnalyzerUsecase.execute(files);
      if (!success) {
        return reply.code(400).send({ success: false, message: message || "File analysis failed." });
      }
      return reply.code(200).send(data);
    } catch (err) {
      console.error("Error in getFileAnalyzer:", err);
      return reply.code(500).send({ success: false, message: "Internal server error" });
    }
  }


  public async getSingleFileReport(_request: any, reply: any) {
    const result = await this.getSingleFileReportUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getFilePatchApply(_request: any, reply: any) {
    const result = await this.getFilePatchApplyUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getUser(_request: any, reply: any) {
    const result = await this.getUserUsecase.execute();
    return reply.code(200).send(result);
  }

}
