import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Mock fs before importing fileStorage
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

const mockExistsSync = fs.existsSync as jest.Mock;
const mockMkdirSync = fs.mkdirSync as jest.Mock;
const mockWriteFileSync = fs.writeFileSync as jest.Mock;
const mockReadFileSync = fs.readFileSync as jest.Mock;

// We need to mock the module after mocking fs
const { saveResult, readResult, editResult } = await import(
  "../../src/module/worker/storage/fileStorage.js"
);

describe("fileStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("saveResult", () => {
    it("should write result to JSON file", () => {
      const jobId = "job-123";
      const data = {
        jobId: "job-123",
        task: "ts_js_compiler",
        result: { success: true },
      };

      saveResult(jobId, data as any);

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filePath, content] = mockWriteFileSync.mock.calls[0];
      expect(filePath).toContain("job-123.json");
      expect(JSON.parse(content)).toEqual(data);
    });

    it("should handle numeric job IDs", () => {
      const data = { jobId: 456, task: "test", result: {} };

      saveResult(456, data as any);

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filePath] = mockWriteFileSync.mock.calls[0];
      expect(filePath).toContain("456.json");
    });

    it("should create directory if it does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      // Re-import to trigger the module-level directory creation
      jest.isolateModules(async () => {
        const { saveResult } = await import(
          "../../src/module/worker/storage/fileStorage.js"
        );
        saveResult("test", { jobId: "test", task: "test", result: {} } as any);
        expect(mockMkdirSync).toHaveBeenCalled();
      });
    });
  });

  describe("readResult", () => {
    it("should read and parse existing result file", () => {
      const storedData = {
        jobId: "job-789",
        task: "go_compiler",
        result: { data: "test" },
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(storedData));

      const result = readResult("job-789");

      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
      const [filePath] = mockReadFileSync.mock.calls[0];
      expect(filePath).toContain("job-789.json");
      expect(result).toEqual(storedData);
    });

    it("should return null for non-existent file", () => {
      mockExistsSync.mockReturnValue(false);

      const result = readResult("missing-job");

      expect(result).toBeNull();
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it("should handle numeric job IDs", () => {
      mockReadFileSync.mockReturnValue('{"jobId": 999}');

      const result = readResult(999);

      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
      const [filePath] = mockReadFileSync.mock.calls[0];
      expect(filePath).toContain("999.json");
    });
  });

  describe("editResult", () => {
    it("should merge new data with existing result", () => {
      const existingData = {
        jobId: "job-abc",
        task: "java_compiler",
        result: { initial: true },
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(existingData));

      const updated = editResult("job-abc", {
        result: { updated: true },
      });

      expect(updated).toEqual({
        jobId: "job-abc",
        task: "java_compiler",
        result: { updated: true },
      });
      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
    });

    it("should throw error when result not found", () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => editResult("missing", { result: {} })).toThrow(
        "Result for job missing not found"
      );
    });

    it("should preserve unmodified fields during edit", () => {
      const existingData = {
        jobId: "job-xyz",
        task: "python_compiler",
        result: { data: "original" },
        extraField: "preserved",
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(existingData));

      const updated = editResult("job-xyz", { result: { data: "modified" } });

      expect(updated.task).toBe("python_compiler");
      expect(updated.extraField).toBe("preserved");
      expect(updated.result).toEqual({ data: "modified" });
    });
  });
});
