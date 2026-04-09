import path from "path";
import { FileUploadModel } from "../../../module/file_Interface/fileInterface.js";
import { streamToString } from "../../../module/utils/parserFileData.js";
import { WorkerFile } from "../../../module/worker/worker_types/workerTypes.js";

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
const MAX_FILE_SIZE = 200 * 1024;

export class DeepFileSanitization {

  async ts_js_deepFileScan(files: FileUploadModel[]
  ): Promise<{ success: boolean; data: any[] }> {


    if (!Array.isArray(files) || files.length === 0) {
      return { success: false, data: [] };
    }


    let totalSize = 0;
    const sanitized: WorkerFile[] = [];

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
        name: file.name,
        language: file.language,
        content: text,
      });
    }

    // Optional: log aggregated stats (safe)
    console.info("File sanitization stats:", rejectionStats);

    return { success: true, data: sanitized };
  }
}