import { GetFileHealth } from "../../usecases/GetFileHealth";
import { IFileRepository } from "../../ports/IFileRepository";
import { GetFileAnalyzer } from "../../usecases/getFileAnalyzer";
import Compiler from "../../../../compiler/compiler";
import { GetFileData } from "../../usecases/GetFileData";
import { GetSingleFileReport } from "../../usecases/getSingleFileReport";
import { GetFilePatchApply } from "../../usecases/getFilePatchApply";
import { GetUser } from "../../usecases/getUser";
import { IMongoRepository } from "../../ports/IMongoRepository";

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

  // public async getHealth(reply: any) {
  //   const result = await this.getHealthUsecase.execute();
  //   console.log("Turbo Log  ~ FileController ~ getHealth ~ result:", result);
  //   return reply.code(200).send(result);
  // }

  // public async getFile(request: any, reply: any) {
  //   const { id } = request.params as { id: string };
  //   try {
  //     const result = await this.getFileDataUsecase.execute(id);
  //     if ((result as any).status === 404) return reply.code(404).send(result);
  //     return reply.code(200).send(result);
  //   } catch (err) {
  //     return reply.code(500).send({ error: "Internal Server Error" });
  //   }
  // }

  // public async getFileAnalyzer(reply: any) {
  //   const result = await this.getFileAnalyzerUsecase.execute();
  //   return reply.code(200).send(result);
  // }

  // public async getSingleFileReport(reply: any) {
  //   const result = await this.getSingleFileReportUsecase.execute();
  //   return reply.code(200).send(result
  //   );
  // }

  // public async getFilePatchApply(reply: any) {
  //   const result = await this.getFilePatchApplyUsecase.execute();
  //   return reply.code(200).send(result);
  // }

  // public async getUser(reply: any) {
  //   const result = await this.getUserUsecase.execute();
  //   return reply.code(200).send(result);
  // }

  public async getHealth(request: any, reply: any) {
    const result = await this.getHealthUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getFile(request: any, reply: any) {
    const { id } = request.params;
    const result = await this.getFileDataUsecase.execute(id);
    return reply.code(200).send(result);
  }

  public async getFileAnalyzer(request: any, reply: any) {
    const result = await this.getFileAnalyzerUsecase.execute();
    console.log("Turbo Log  ~ FileController ~ getFileAnalyzer ~ result:", result);
    return reply.code(200).send(result);
  }

  public async getSingleFileReport(request: any, reply: any) {
    const result = await this.getSingleFileReportUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getFilePatchApply(request: any, reply: any) {
    const result = await this.getFilePatchApplyUsecase.execute();
    return reply.code(200).send(result);
  }

  public async getUser(request: any, reply: any) {
    const result = await this.getUserUsecase.execute();
    return reply.code(200).send(result);
  }

}
