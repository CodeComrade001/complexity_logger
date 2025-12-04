import { GetFileHealth } from "../../usecases/GetFileHealth";
import { IFileRepository } from "../../ports/IFileRepository";
import { GetFileAnalyzer } from "../../usecases/getFileAnalyzer";
import Compiler from "../../../../compiler/compiler";
import { GetFileData } from "../../usecases/GetFileData";
import { GetSingleFileReport } from "../../usecases/getSingleFileReport";
import { GetFilePatchApply } from "../../usecases/getFilePatchApply";
import { GetUser } from "../../usecases/getUser";

// The controller adapter is thin: it only calls use-cases and maps results to HTTP-friendly objects.
// Keep it simple: no DB, no heavy logic.
export class FileController {
  private getHealthUsecase: GetFileHealth;
  private getFileDataUsecase: GetFileData;
  private getFileAnalyzerUsecase: GetFileAnalyzer;
  private getSingleFileReportUsecase: GetSingleFileReport;
  private getFilePatchApplyUsecase: GetFilePatchApply;
  private getUserUsecase: GetUser;

  constructor(repo: IFileRepository, compiler: Compiler) {
    this.getHealthUsecase = new GetFileHealth(repo);
    this.getFileDataUsecase = new GetFileData(repo);

    this.getSingleFileReportUsecase = new GetSingleFileReport(repo);
    this.getFilePatchApplyUsecase = new GetFilePatchApply(repo);
    this.getUserUsecase = new GetUser(repo);
    this.getFileAnalyzerUsecase = new GetFileAnalyzer(repo, compiler);

  }

  public async getHealth(reply: any) {
    const result = await this.getHealthUsecase.execute();
    return reply.status(200).send(result);
  }

  public async getFile(request: any, reply: any) {
    const { id } = request.params as { id: string };
    try {
      const result = await this.getFileDataUsecase.execute(id);
      if ((result as any).status === 404) return reply.status(404).send(result);
      return reply.status(200).send(result);
    } catch (err) {
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }

  public async getFileAnalyzer(reply: any) {
    const result = await this.getFileAnalyzerUsecase.execute();
    return reply.status(200).send(result);
  }

  public async getSingleFileReport(reply: any) {
    const result = await this.getSingleFileReportUsecase.execute();
    return reply.status(200).send(result
    );
  }

  public async getFilePatchApply(reply: any) {
    const result = await this.getFilePatchApplyUsecase.execute();
    return reply.status(200).send(result);
  }

  public async getUser(reply: any) {
    const result = await this.getUserUsecase.execute();
    return reply.status(200).send(result);
  }
}
