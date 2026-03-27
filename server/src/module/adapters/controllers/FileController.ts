import { GetFileHealth } from "../../usecases/GetFileHealth.js";
import { IFileRepository } from "../../ports/IFileRepository.js";
import { GetFileAnalyzer } from "../../usecases/getFileAnalyzer.js";
import Compiler from "../../../compilers/TS_JS_Compiler/compiler.js";
import { GetFileData } from "../../usecases/GetFileData.js";
import { GetSingleFileReport } from "../../usecases/getSingleFileReport.js";
import { GetFilePatchApply } from "../../usecases/getFilePatchApply.js";
import { GetUser } from "../../usecases/getUser.js";
import { IMongoRepository } from "../../ports/IMongoRepository.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";

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



  //these is for testing purpose remember to delete later
  public async getFileAnalyzer(request: any, reply: any) {
    try {
      const files: FileUploadModel[] = [];


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
