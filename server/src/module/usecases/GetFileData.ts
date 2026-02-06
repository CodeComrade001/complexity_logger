
import { IFileRepository } from "../ports/IFileRepository.js";

export class GetFileData {
  constructor(private repo: IFileRepository) { }

  public async execute(fileId: string) {
    if (!fileId) throw new Error("fileId required");
    const result = await this.repo.findById(fileId);
    if (!result) return { status: 404, message: "Not found" };
    // business-level mapping if needed
    return result;
  }
}
