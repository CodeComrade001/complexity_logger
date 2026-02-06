
import { IFileRepository } from "../ports/IFileRepository.js";

export class GetSingleFileReport {
  constructor(private repo: IFileRepository) { }

  public async execute() {
    const result = await this.repo.getSingleFileReport();
    if (!result) return { status: 404, message: "getSingleFileReport() Not found" };
    // business-level mapping if needed
    return result;
  }
}
