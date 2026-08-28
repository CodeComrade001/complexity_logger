import { describe, it, expect } from "@jest/globals";

// We need to test getWorkerPath with different process.execArgv values
const originalExecArgv = process.execArgv;

describe("getWorkerPath", () => {
  afterEach(() => {
    // Restore original execArgv after each test
    Object.defineProperty(process, "execArgv", {
      value: originalExecArgv,
      configurable: true,
      writable: true,
    });
  });

  it("should return .ts extension for ts-node runtime", async () => {
    Object.defineProperty(process, "execArgv", {
      value: ["--loader", "ts-node/esm"],
      configurable: true,
      writable: true,
    });

    const { getWorkerPath } = await import(
      "../../src/module/worker/workerPath.js"
    );
    const path = getWorkerPath("piscinaWorker");

    expect(path).toMatch(/\.ts$/);
    expect(path).toContain("piscinaWorker");
  });

  it("should return .ts extension for tsx runtime", async () => {
    Object.defineProperty(process, "execArgv", {
      value: ["tsx", "watch"],
      configurable: true,
      writable: true,
    });

    const { getWorkerPath } = await import(
      "../../src/module/worker/workerPath.js"
    );
    const path = getWorkerPath("piscinaWorker");

    expect(path).toMatch(/\.ts$/);
  });

  it("should return .js extension for regular node runtime", async () => {
    Object.defineProperty(process, "execArgv", {
      value: [],
      configurable: true,
      writable: true,
    });

    const { getWorkerPath } = await import(
      "../../src/module/worker/workerPath.js"
    );
    const path = getWorkerPath("piscinaWorker");

    expect(path).toMatch(/\.js$/);
    expect(path).toContain("piscinaWorker");
  });

  it("should return absolute path", async () => {
    Object.defineProperty(process, "execArgv", {
      value: [],
      configurable: true,
      writable: true,
    });

    const { getWorkerPath } = await import(
      "../../src/module/worker/workerPath.js"
    );
    const path = getWorkerPath("testWorker");

    expect(path.startsWith("/") || /^[A-Z]:/i.test(path)).toBe(true);
  });

  it("should include the filename in the path", async () => {
    Object.defineProperty(process, "execArgv", {
      value: [],
      configurable: true,
      writable: true,
    });

    const { getWorkerPath } = await import(
      "../../src/module/worker/workerPath.js"
    );
    const path = getWorkerPath("customWorker");

    expect(path).toContain("customWorker");
  });
});

