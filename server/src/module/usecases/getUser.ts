
import { IFileRepository } from "../ports/IFileRepository.js";

export class GetUser {
  constructor(private repo: IFileRepository) { }

  public async execute() {
    const result = await this.repo.getUser();
    if (!result) return { status: 404, message: "getUser() Not found" };
    // business-level mapping if needed
    return result;
  }
}
