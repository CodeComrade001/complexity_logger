import { IFileRepository } from "../ports/IFileRepository";

export class GetFileHealth {
  constructor(private repo: IFileRepository) { }

  public async execute() {
    // pure business rule: could add extra logic here
    return this.repo.getHealth();
  }
}
