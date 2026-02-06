
import { IFileRepository } from "../ports/IFileRepository.js";

export class GetFilePatchApply {
  constructor(private repo: IFileRepository) { }

  public async execute() {
    const result = await this.repo.getFilePatchApply();
    if (!result) return { status: 404, message: "getFilePatchApply() Not found" };
    // business-level mapping if needed
    return result;
  }
}
