// infrastructure/demo/DemoFileLoader.ts
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { FileUploadModel } from "../file_Interface/fileInterface.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DemoFileLoader {
  static load(): FileUploadModel {
    const filePath = path.resolve(
      __dirname,
      "./demo.ts"
    );
    console.log("Turbo Log  ~ DemoFileLoader ~ load ~ filePath:", filePath);

    const fileContent = fs.readFileSync(filePath, "utf-8");

    return {
      name: "demo1.ts",
      size: Buffer.byteLength(fileContent),
      language: "typescript",
      file: Readable.from(fileContent),
      fileContent
    };
  }
}
