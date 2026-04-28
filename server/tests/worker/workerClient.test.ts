import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock piscina before importing WorkerClient
const mockRun = jest.fn();
jest.mock("../../src/module/worker/piscinaPool.js", () => ({
  piscina: {
    run: mockRun,
  },
}));

import { WorkerClient } from "../../src/module/worker/workerClient.js";

describe("WorkerClient", () => {
  let workerClient: WorkerClient;

  beforeEach(() => {
    workerClient = new WorkerClient();
    mockRun.mockClear();
  });

  it("should execute a task and return the result", async () => {
    const mockResult = {
      result: { data: "test-result" },
      error: null,
    };
    mockRun.mockResolvedValue(mockResult);

    const result = await workerClient.execute("ts_js_compiler", [
      { name: "test.ts", content: "const x = 1;", language: "typescript" },
    ]);

    expect(mockRun).toHaveBeenCalledTimes(1);
    const jobArg = mockRun.mock.calls[0][0];
    expect(jobArg.task).toBe("ts_js_compiler");
    expect(jobArg.data).toEqual([
      { name: "test.ts", content: "const x = 1;", language: "typescript" },
    ]);
    expect(typeof jobArg.id).toBe("string");
    expect(result).toEqual({ data: "test-result" });
  });

  it("should throw an error when worker returns an error", async () => {
    mockRun.mockResolvedValue({
      result: null,
      error: "Worker processing failed",
    });

    await expect(
      workerClient.execute("csharp_compiler", [{ name: "test.cs", content: "", language: "csharp" }])
    ).rejects.toThrow("Worker processing failed");
  });

  it("should generate unique job IDs for each execution", async () => {
    mockRun.mockResolvedValue({ result: {}, error: null });

    await workerClient.execute("task1", {});
    await workerClient.execute("task1", {});

    const id1 = mockRun.mock.calls[0][0].id;
    const id2 = mockRun.mock.calls[1][0].id;
    expect(id1).not.toBe(id2);
  });

  it("should handle different task types correctly", async () => {
    mockRun.mockResolvedValue({ result: { success: true }, error: null });

    const tasks = [
      "ts_js_compiler",
      "go_compiler",
      "java_compiler",
      "python_compiler",
      "rust_compiler",
      "csharp_compiler",
      "payloadDeepScan",
      "payloadNormalizer",
      "freeTierAnalysis",
    ];

    for (const task of tasks) {
      await workerClient.execute(task, { test: true });
      const jobArg = mockRun.mock.calls[mockRun.mock.calls.length - 1][0];
      expect(jobArg.task).toBe(task);
    }
  });

  it("should pass complex data structures to the worker", async () => {
    const complexData = {
      files: [
        { name: "a.ts", content: "export const a = 1;", language: "typescript" },
        { name: "b.ts", content: "export const b = 2;", language: "typescript" },
      ],
      options: { deep: true },
    };
    mockRun.mockResolvedValue({ result: complexData, error: null });

    const result = await workerClient.execute("payloadDeepScan", complexData);

    expect(mockRun.mock.calls[0][0].data).toEqual(complexData);
    expect(result).toEqual(complexData);
  });

  it("should propagate worker exceptions", async () => {
    mockRun.mockRejectedValue(new Error("Piscina pool exhausted"));

    await expect(workerClient.execute("ts_js_compiler", [])).rejects.toThrow(
      "Piscina pool exhausted"
    );
  });
});

