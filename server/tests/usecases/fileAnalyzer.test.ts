import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock WorkerClient
const mockExecute = jest.fn();

jest.mock("../../src/module/worker/workerClient.js", () => ({
  WorkerClient: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

import { Get_Csharp_FileAnalyzer } from "../../src/module/usecases/get_csharp_FileAnalyzer.js";
import { Get_Go_FileAnalyzer } from "../../src/module/usecases/get_go_FileAnalyzer.js";
import { Get_Java_FileAnalyzer } from "../../src/module/usecases/get_java_FileAnalyzer.js";
import { Get_Python_FileAnalyzer } from "../../src/module/usecases/get_python_FileAnalyzer.js";
import { Get_Rust_FileAnalyzer } from "../../src/module/usecases/get_rust_FileAnalyzer.js";
import { Get_js_TS_FileAnalyzer } from "../../src/module/usecases/get_ts_js_FileAnalyzer.js";

const mockRepo = {
  getCompilerResult: jest.fn(),
  getHealth: jest.fn(),
  findById: jest.fn(),
  getFileAnalyzer: jest.fn(),
  getSingleFileReport: jest.fn(),
  getFilePatchApply: jest.fn(),
  getUser: jest.fn(),
};

interface UsecaseClass {
  new(repo: any, workerClient: any): {
    execute: (files: any[]) => Promise<any>;
  };
}

const testCases: {
  name: string;
  UsecaseClass: UsecaseClass;
  compilerTask: string;
}[] = [
    {
      name: "C#",
      UsecaseClass: Get_Csharp_FileAnalyzer,
      compilerTask: "csharp_compiler",
    },
    {
      name: "Go",
      UsecaseClass: Get_Go_FileAnalyzer,
      compilerTask: "go_compiler",
    },
    {
      name: "Java",
      UsecaseClass: Get_Java_FileAnalyzer,
      compilerTask: "java_compiler",
    },
    {
      name: "Python",
      UsecaseClass: Get_Python_FileAnalyzer,
      compilerTask: "python_compiler",
    },
    {
      name: "Rust",
      UsecaseClass: Get_Rust_FileAnalyzer,
      compilerTask: "rust_compiler",
    },
    {
      name: "TypeScript/JavaScript",
      UsecaseClass: Get_js_TS_FileAnalyzer,
      compilerTask: "ts_js_compiler",
    },
  ];

describe("FileAnalyzer Usecases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each(testCases)(
    "Get_$name_FileAnalyzer",
    ({ UsecaseClass, compilerTask }) => {
      it("should successfully analyze files through worker", async () => {
        const sanitizedFiles = [
          { name: "test.ts", content: "const x = 1;", language: "typescript" },
        ];
        const compilerResult = {
          success: true,
          data: { analyzed: true, results: [] },
        };

        mockExecute
          .mockResolvedValueOnce({ success: true, data: sanitizedFiles })
          .mockResolvedValueOnce(compilerResult);

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        const result = await usecase.execute([
          { name: "test.ts", content: "const x = 1;", language: "typescript" },
        ]);

        expect(mockExecute).toHaveBeenNthCalledWith(
          1,
          "payloadDeepScan",
          expect.any(Array)
        );
        expect(mockExecute).toHaveBeenNthCalledWith(
          2,
          compilerTask,
          sanitizedFiles
        );
        expect(result).toEqual({
          success: true,
          data: compilerResult.data,
        });
      });

      it("should return failure when sanitization fails", async () => {
        mockExecute.mockResolvedValueOnce({
          success: false,
          data: null,
        });

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        const result = await usecase.execute([
          { name: "test.ts", content: "const x = 1;", language: "typescript" },
        ]);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          success: false,
          data: null,
          message: "Sanitization failed",
        });
      });

      it("should return failure when compiler worker fails", async () => {
        mockExecute
          .mockResolvedValueOnce({ success: true, data: [] })
          .mockResolvedValueOnce({
            success: false,
            data: null,
          });

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        const result = await usecase.execute([
          { name: "test.ts", content: "const x = 1;", language: "typescript" },
        ]);

        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
          success: false,
          data: null,
        });
      });

      it("should handle empty file array", async () => {
        mockExecute
          .mockResolvedValueOnce({ success: true, data: [] })
          .mockResolvedValueOnce({
            success: true,
            data: { analyzed: true, results: [] },
          });

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        const result = await usecase.execute([]);

        expect(result.success).toBe(true);
      });

      it("should handle multiple files", async () => {
        const files = [
          { name: "a.ts", content: "const a = 1;", language: "typescript" },
          { name: "b.ts", content: "const b = 2;", language: "typescript" },
        ];
        const sanitized = [
          { name: "a.ts", content: "const a = 1;", language: "typescript" },
          { name: "b.ts", content: "const b = 2;", language: "typescript" },
        ];

        mockExecute
          .mockResolvedValueOnce({ success: true, data: sanitized })
          .mockResolvedValueOnce({
            success: true,
            data: { analyzed: true, count: 2 },
          });

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        const result = await usecase.execute(files);

        expect(mockExecute).toHaveBeenNthCalledWith(2, compilerTask, sanitized);
        expect(result.data.count).toBe(2);
      });

      it("should propagate worker errors", async () => {
        mockExecute.mockRejectedValue(new Error("Worker crashed"));

        const usecase = new UsecaseClass(mockRepo, { execute: mockExecute });
        await expect(usecase.execute([])).rejects.toThrow("Worker crashed");
      });
    }
  );
});
