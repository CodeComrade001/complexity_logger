import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";

// Mock dependencies before importing createApp
jest.mock("@fastify/cors", () => jest.fn());
jest.mock("@fastify/multipart", () => jest.fn());

// Mock worker and compilers
jest.mock("../../src/module/worker/workerClient.js", () => ({
  WorkerClient: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock("../../src/compilers/TS_JS_Compiler/ts_js_bootstrap.js", () => ({
  JS_TS_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../src/compilers/JAVA_Compiler/java_bootstrap.js", () => ({
  JAVA_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../src/compilers/PYTHON_Compiler/python_bootstrap.js", () => ({
  PYTHON_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../src/compilers/RUST_Compiler/rust_bootstrap.js", () => ({
  RUST_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../src/compilers/CSHARP_Compiler/csharp_bootstrap.js", () => ({
  CSHARP_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../src/module/routes/fileRoute.js", () =>
  jest.fn().mockResolvedValue(undefined)
);

import { createApp } from "../../src/core/di/container.js";

describe("createApp", () => {
  let app: any;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  it("should create and return a fastify instance", async () => {
    app = await createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe("function");
  });

  it("should register CORS with correct configuration", async () => {
    app = await createApp();
    expect(cors).toHaveBeenCalledWith(app, {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    });
  });

  it("should register multipart with correct limits", async () => {
    app = await createApp();
    expect(fastifyMultipart).toHaveBeenCalledWith(app, {
      limits: {
        fileSize: 200 * 1024,
        files: 300,
      },
    });
  });

  it("should decorate app with workerClient", async () => {
    app = await createApp();
    expect(app.workerClient).toBeDefined();
  });

  it("should decorate app with all compiler services", async () => {
    app = await createApp();
    expect(app.ts_js_compiler).toBeDefined();
    expect(app.java_compiler).toBeDefined();
    expect(app.python_compiler).toBeDefined();
    expect(app.rust_compiler).toBeDefined();
    expect(app.csharp_compiler).toBeDefined();
  });

  it("should register file routes with /api/file prefix", async () => {
    const fileRoute = (await import("../../src/module/routes/fileRoute.js"))
      .default;
    app = await createApp();
    expect(fileRoute).toHaveBeenCalledWith(app, { prefix: "/api/file" });
  });

  it("should return 404 for unknown routes", async () => {
    app = await createApp();
    const response = await app.inject({
      method: "GET",
      url: "/nonexistent",
    });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({ error: "Not found" });
  });

  it("should return 500 with error details in non-production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    app = await createApp();
    app.get("/error", () => {
      throw new Error("Test error");
    });

    const response = await app.inject({
      method: "GET",
      url: "/error",
    });

    expect(response.statusCode).toBe(500);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe("Internal Server Error");
    expect(payload.details).toBe("Test error");

    process.env.NODE_ENV = originalEnv;
  });

  it("should hide error details in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    app = await createApp();
    app.get("/error", () => {
      throw new Error("Sensitive error");
    });

    const response = await app.inject({
      method: "GET",
      url: "/error",
    });

    expect(response.statusCode).toBe(500);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe("Internal Server Error");
    expect(payload.details).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

