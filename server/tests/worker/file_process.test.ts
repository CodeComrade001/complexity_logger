import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock dependencies
const mockHashContent = jest.fn();
const mockGetCachedResult = jest.fn();
const mockSetCachedResult = jest.fn();

jest.mock("../../src/module/worker/cache/workerCache.js", () => ({
  hashContent: mockHashContent,
  getCachedResult: mockGetCachedResult,
  setCachedResult: mockSetCachedResult,
}));

jest.mock("../../src/compilers/TS_JS_Compiler/ts_js_bootstrap.js", () => ({
  JS_TS_CompilerInterface: {},
}));

// We need to mock Project and SourceFile from ts-morph
const mockCreateSourceFile = jest.fn();
const mockReplaceWithText = jest.fn();
const mockDelete = jest.fn();
const mockGetSourceFiles = jest.fn();

jest.mock("ts-morph", () => ({
  Project: jest.fn().mockImplementation(() => ({
    createSourceFile: mockCreateSourceFile.mockReturnValue({
      replaceWithText: mockReplaceWithText,
    }),
    getSourceFile: jest.fn().mockReturnValue(null),
    getSourceFiles: mockGetSourceFiles.mockReturnValue([]),
  })),
  SourceFile: jest.fn(),
}));

import {
  processFile,
  processFilesBatch,
  enforceProjectLimit,
  GetUnitPartOfCode_BATCHLIMIT,
} from "../../src/module/worker/utils/file_process.js";
import { Project, SourceFile } from "ts-morph";

describe("file_process", () => {
  let mockProject: any;
  let mockCompiler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProject = {
      createSourceFile: mockCreateSourceFile.mockReturnValue({
        replaceWithText: mockReplaceWithText,
      }),
      getSourceFile: jest.fn().mockReturnValue(null),
      getSourceFiles: mockGetSourceFiles,
    };

    mockCompiler = {
      utils: {
        extract: jest.fn(),
      },
      compiler: {
        execute: jest.fn(),
      },
    };

    mockHashContent.mockReturnValue("hash123");
    mockGetCachedResult.mockReturnValue(null);
    mockSetCachedResult.mockImplementation(() => { });
  });

  describe("enforceProjectLimit", () => {
    it("should delete excess files when over limit", () => {
      const filesToDelete: any[] = [];
      for (let i = 0; i < 1005; i++) {
        filesToDelete.push({ delete: jest.fn() });
      }

      const project = {
        getSourceFiles: jest.fn().mockReturnValue(filesToDelete),
      };

      enforceProjectLimit(project as any);

      // Should delete 5 files (1005 - 1000 = 5)
      expect(filesToDelete[0].delete).toHaveBeenCalled();
      expect(filesToDelete[4].delete).toHaveBeenCalled();
      expect(filesToDelete[5].delete).not.toHaveBeenCalled();
    });

    it("should not delete files when under limit", () => {
      const files = [
        { delete: jest.fn() },
        { delete: jest.fn() },
      ];

      const project = {
        getSourceFiles: jest.fn().mockReturnValue(files),
      };

      enforceProjectLimit(project as any);

      files.forEach((f) => expect(f.delete).not.toHaveBeenCalled());
    });

    it("should handle exactly at limit", () => {
      const files = Array(1000).fill(null).map(() => ({ delete: jest.fn() }));

      const project = {
        getSourceFiles: jest.fn().mockReturnValue(files),
      };

      enforceProjectLimit(project as any);

      files.forEach((f) => expect(f.delete).not.toHaveBeenCalled());
    });
  });

  describe("processFile", () => {
    it("should process a single file and return results", async () => {
      const file = {
        name: "test.ts",
        content: "const x = 1;",
        language: "typescript",
      };

      mockCompiler.utils.extract.mockResolvedValue([
        { extracted: true, data: "extracted" },
      ]);
      mockCompiler.compiler.execute.mockResolvedValue({
        data: [{ result: "processed" }],
      });

      const result = await processFile(file, mockProject, mockCompiler);

      expect(mockCreateSourceFile).toHaveBeenCalledWith(
        "test.ts",
        "const x = 1;",
        { overwrite: true }
      );
      expect(mockCompiler.utils.extract).toHaveBeenCalled();
      expect(result).toEqual({ data: [{ result: "processed" }] });
    });

    it("should use cached results when available", async () => {
      const file = {
        name: "cached.ts",
        content: "const x = 1;",
        language: "typescript",
      };

      mockGetCachedResult.mockReturnValue({ cachedResult: true });

      const result = await processFile(file, mockProject, mockCompiler);

      expect(mockCompiler.utils.extract).not.toHaveBeenCalled();
      expect(result).toEqual({ data: [{ cachedResult: true }] });
    });

    it("should update existing source file if it exists", async () => {
      const existingFile = { replaceWithText: mockReplaceWithText };
      mockProject.getSourceFile = jest.fn().mockReturnValue(existingFile);

      const file = {
        name: "existing.ts",
        content: "updated content",
        language: "typescript",
      };

      mockCompiler.utils.extract.mockResolvedValue([{ data: "extracted" }]);
      mockCompiler.compiler.execute.mockResolvedValue({ data: [{ result: "ok" }] });

      await processFile(file, mockProject, mockCompiler);

      expect(mockReplaceWithText).toHaveBeenCalledWith("updated content");
      expect(mockCreateSourceFile).not.toHaveBeenCalled();
    });

    it("should throw error when batch exceeds limit", async () => {
      const files = Array(GetUnitPartOfCode_BATCHLIMIT + 1)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.ts`,
          content: `const x = ${i};`,
          language: "typescript",
        }));

      await expect(processFile(files, mockProject, mockCompiler)).rejects.toThrow(
        `Max batch size is ${GetUnitPartOfCode_BATCHLIMIT}`
      );
    });

    it("should return empty array when no extracted data", async () => {
      const file = {
        name: "empty.ts",
        content: "",
        language: "typescript",
      };

      mockCompiler.utils.extract.mockResolvedValue([]);

      const result = await processFile(file, mockProject, mockCompiler);

      expect(result).toEqual([]);
    });

    it("should handle multiple files in batch", async () => {
      const files = [
        { name: "a.ts", content: "const a = 1;", language: "typescript" },
        { name: "b.ts", content: "const b = 2;", language: "typescript" },
      ];

      mockCompiler.utils.extract
        .mockResolvedValueOnce([{ data: "extracted_a" }])
        .mockResolvedValueOnce([{ data: "extracted_b" }]);

      mockCompiler.compiler.execute.mockResolvedValue({
        data: [{ result: "a" }, { result: "b" }],
      });

      const result = await processFile(files, mockProject, mockCompiler);

      expect(mockCompiler.compiler.execute).toHaveBeenCalledWith([
        { data: "extracted_a" },
        { data: "extracted_b" },
      ]);
      expect(result).toEqual({ data: [{ result: "a" }, { result: "b" }] });
    });

    it("should skip duplicate files based on content hash", async () => {
      const files = [
        { name: "a.ts", content: "same", language: "typescript" },
        { name: "b.ts", content: "same", language: "typescript" },
      ];

      // First call returns null (not cached), second should be skipped
      mockGetCachedResult
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ cached: true });

      mockCompiler.utils.extract.mockResolvedValue([{ data: "extracted" }]);
      mockCompiler.compiler.execute.mockResolvedValue({ data: [{ result: "ok" }] });

      await processFile(files, mockProject, mockCompiler);

      // extract should only be called once for the unique content
      expect(mockCompiler.utils.extract).toHaveBeenCalledTimes(1);
    });
  });

  describe("processFilesBatch", () => {
    it("should delegate to processFile", async () => {
      const files = [{ name: "test.ts", content: "const x = 1;", language: "typescript" }];

      mockCompiler.utils.extract.mockResolvedValue([{ data: "extracted" }]);
      mockCompiler.compiler.execute.mockResolvedValue({ data: [{ result: "ok" }] });

      const result = await processFilesBatch(files, mockProject, mockCompiler);

      expect(result).toEqual({ data: [{ result: "ok" }] });
    });
  });
});

