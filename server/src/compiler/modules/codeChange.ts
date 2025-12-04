import { createHash } from "crypto";
import { readFileSync } from "fs";

export class GetCodeChanges {

  private async hashFile(path: string) {
    const fileBuffer = readFileSync(path);
    return createHash("sha256").update(fileBuffer).digest("hex");
  }

  public async hasCodeChanged(filePath: string, previousHash: string) {
    //TODO Query Database to fetch previous hash if not provided
    const currentHash = await this.hashFile(filePath);
    const result = currentHash !== previousHash;
    return { success: result, data: result }
  }
}