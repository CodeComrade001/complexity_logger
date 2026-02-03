
import path from "path";
import Compiler from "../../compliers/TS_JS_Compiler/compiler";
import { FileUploadModel } from "../model/fileInterface";
import { IFileRepository } from "../ports/IFileRepository";
import { streamToString } from "../utils/parserFileData";

const IGNORED_FILES = [
  ".DS_Store",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
];

const GENERATED_FILE_PATTERNS = [
  /\.d\.ts$/,
  /\.min\.ts$/,
  /\.generated\.ts$/,
];
const ALLOWED_EXTENSIONS = [
  ".ts",
  // later: ".js", ".cs"
];

const ALLOWED_LANGUAGES = [
  "typescript",
  // "javascript",
  // "csharp"
] as const;

const MAX_FILES = 300;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE = 200 * 1024;       // 200KB


export class GetFileAnalyzer {
  private compiler: Compiler;

  constructor(private repo: IFileRepository, compiler: Compiler) {
    this.compiler = compiler;
    this.repo = repo;
  }

  private async dataSecurityAndSanitization(
    files: FileUploadModel[]
  ): Promise<{ success: boolean; data: FileUploadModel[] }> {

    console.log("data sanitization has started ")

    if (!Array.isArray(files) || files.length === 0) {
      return { success: false, data: [] };
    }


    let totalSize = 0;
    const sanitized: FileUploadModel[] = [];

    const rejectionStats = {
      tooManyFiles: 0,
      fileTooLarge: 0,
      totalSizeExceeded: 0,
      languageRejected: 0,
      extensionRejected: 0,
      ignoredFile: 0,
      binaryFile: 0,
    };

    for (const file of files) {
      if (sanitized.length >= MAX_FILES) {
        rejectionStats.tooManyFiles++;
        return { success: false, data: [] };
      }

      if (file.size > MAX_FILE_SIZE) {
        rejectionStats.fileTooLarge++;
        return { success: false, data: [] };
      }

      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        rejectionStats.totalSizeExceeded++;
        return { success: false, data: [] };
      }

      if (!ALLOWED_LANGUAGES.includes(file.language.toLowerCase() as any)) {
        rejectionStats.languageRejected++;
        continue;
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        rejectionStats.extensionRejected++;
        continue;
      }

      if (IGNORED_FILES.includes(file.name)) {
        rejectionStats.ignoredFile++;
        continue;
      }

      if (GENERATED_FILE_PATTERNS.some(rx => rx.test(file.name))) {
        rejectionStats.ignoredFile++;
        continue;
      }

      // const text = await this.streamToString(file.file);
      const text = await streamToString(file.file);

      // const text = await file.file.text();
      if (text.includes("\u0000")) {
        rejectionStats.binaryFile++;
        continue;
      }

      sanitized.push({
        ...file,
        fileContent: text // string
      });
    }

    // Optional: log aggregated stats (safe)
    console.info("File sanitization stats:", rejectionStats);

    return { success: true, data: sanitized };
  }




  public async execute(
    filesToAnalyze: FileUploadModel[]
  ): Promise<{ success: boolean; data: any | null, message?: string }> {

    const { success, data: serializedData } = await this.dataSecurityAndSanitization(filesToAnalyze);
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ success:", success);
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ serializedData:", serializedData);

    if (!success) {
      return { success: false, data: null, message: "File sanitization failed." };
    }

    const compilerAnalysis = await this.compiler.execute(serializedData);
    console.log("Turbo Log  ~ GetFileAnalyzer ~ execute ~ compilerAnalysis:", compilerAnalysis);

    return {
      success: true,
      data: { compilerAnalysis }
    };
  }
}
