// FileController.ts

import { IFileRepository } from "../../ports/IFileRepository.js";
import { IMongoRepository } from "../../ports/IMongoRepository.js";
import { FileUploadModel } from "../../file_Interface/fileInterface.js";
import { WorkerClient } from "../../worker/workerClient.js";
import { extractFiles } from "../../../compilers/TS_JS_Compiler/utils/extractor.js";
import { Get_Go_FileAnalyzer } from "../../usecases/get_go_FileAnalyzer.js";
import { Get_Java_FileAnalyzer } from "../../usecases/get_java_FileAnalyzer.js";
import { Get_Python_FileAnalyzer } from "../../usecases/get_python_FileAnalyzer.js";
import { Get_Zig_FileAnalyzer } from "../../usecases/get_zig_FileAnalyzer.js";
import { Get_Rust_FileAnalyzer } from "../../usecases/get_rust_FileAnalyzer.js";
import { Get_Kotlin_FileAnalyzer } from "../../usecases/get_kotlin_FileAnalyzer.js";
import { Get_js_TS_FileAnalyzer } from "../../usecases/get_ts_js_FileAnalyzer.js";
import { AnalysisSummary } from "../../../compilers/shared/interfaces.js";


/*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

type SupportedLanguage = "typescript"
  | "go"
  | "java"
  | "python"
  | "zig"
  | "rust"
  | "kotlin"
  | "csharp"
  | "haskell"
  | "swift"



export class FileController {
  private get_go_FileAnalyzerUsecase: Get_Go_FileAnalyzer;
  private get_java_FileAnalyzerUsecase: Get_Java_FileAnalyzer;
  private get_python_FileAnalyzerUsecase: Get_Python_FileAnalyzer;
  private get_ts_js_FileAnalyzerUsecase: Get_js_TS_FileAnalyzer;
  private get_zig_FileAnalyzerUsecase: Get_Zig_FileAnalyzer;
  private get_rust_FileAnalyzerUsecase: Get_Rust_FileAnalyzer;
  private get_kotlin_FileAnalyzerUsecase: Get_Kotlin_FileAnalyzer;

  constructor(
    postgresRepo: IFileRepository,
    mongoRepo: IMongoRepository,
    workerClient: WorkerClient // ✅ instead of compiler
  ) {
    this.get_go_FileAnalyzerUsecase = new Get_Go_FileAnalyzer(postgresRepo, workerClient);
    this.get_java_FileAnalyzerUsecase = new Get_Java_FileAnalyzer(postgresRepo, workerClient);
    this.get_python_FileAnalyzerUsecase = new Get_Python_FileAnalyzer(postgresRepo, workerClient);
    this.get_zig_FileAnalyzerUsecase = new Get_Zig_FileAnalyzer(postgresRepo, workerClient);
    this.get_rust_FileAnalyzerUsecase = new Get_Rust_FileAnalyzer(postgresRepo, workerClient);
    this.get_kotlin_FileAnalyzerUsecase = new Get_Kotlin_FileAnalyzer(postgresRepo, workerClient);
    this.get_ts_js_FileAnalyzerUsecase = new Get_js_TS_FileAnalyzer(postgresRepo, workerClient);
  }

  public async getGoFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "go"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_go_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async get_js_ts_Analyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "typescript"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const analysis = await this.get_ts_js_FileAnalyzerUsecase.execute(fileToStreamData);


      if (!analysis.success) {
        return reply.code(400).send(analysis);
      }

      return reply.code(200).send(analysis);
    } catch (err: any) {
      console.error("Error in getFileAnalyzer:", err);
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getJavaFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "java"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_java_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getPythonFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "typescript"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_python_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getZigFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "typescript"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_zig_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getRustFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "typescript"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_rust_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getKotlinFileAnalyzer(request: any, reply: any) {
    try {
      const { success: isFileTOStreamSuccessful, data: fileToStreamData } = await this.fileToStream(request, "typescript"); // ✅ hardcoded HERE

      if (!isFileTOStreamSuccessful || !fileToStreamData) {
        return reply.code(400).send(fileToStreamData);
      }

      const result = await this.get_kotlin_FileAnalyzerUsecase.execute(fileToStreamData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.code(200).send(result);
    } catch (err) {
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /*//////////////////////////////////////////////////////////////
                           HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

  private async fileToStream(request: any, language: SupportedLanguage) {
    try {
      const files: FileUploadModel[] = [];

      for await (const part of request.parts()) {
        if (part.type === "file") {
          files.push({
            name: part.filename,
            size: part.file.bytesRead,
            language: language, // ✅ use the param, not hardcoded
            file: part.file,
            fileContent: part.text,
          });
        }
      }

      if (!files.length) {
        return {
          success: false,
          message: "No files provided",
        };
      }

      const extractedData = await extractFiles(files);

      if (!extractedData) {
        return {
          success: false,
          message: "Failed to extract files",
        };
      }

      return { success: true, data: extractedData };
    } catch (err: any) {
      console.error("Error in fileToStream:", err);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  // isLanguageSupported(lang: string): lang is SupportedLanguage {
  //   return lang in this.registry;
  // }

}