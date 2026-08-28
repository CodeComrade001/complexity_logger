import { describe, it, expect, jest, afterEach } from '@jest/globals';

// Mock createApp before importing bootstrap
jest.mock("../../src/core/di/container.js", () => ({
  createApp: jest.fn(),
}));

import { bootstrap } from "../../src/app/AppBootstrap.js";
import { createApp } from "../../src/core/di/container.js";

describe("AppBootstrap", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call createApp and return the app instance", async () => {
    const mockApp = {
      listen: jest.fn(),
      close: jest.fn(),
    };
    (createApp as jest.Mock).mockResolvedValue(mockApp);

    const result = await bootstrap();

    expect(createApp).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockApp);
  });

  it("should propagate errors from createApp", async () => {
    const mockError = new Error("Bootstrap failed");
    (createApp as jest.Mock).mockRejectedValue(mockError);

    await expect(bootstrap()).rejects.toThrow("Bootstrap failed");
    expect(createApp).toHaveBeenCalledTimes(1);
  });

  it("should return a fastify-compatible app with required methods", async () => {
    const mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      register: jest.fn(),
      decorate: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      inject: jest.fn(),
    };
    (createApp as jest.Mock).mockResolvedValue(mockApp);

    const result = await bootstrap();

    expect(result.listen).toBeDefined();
    expect(typeof result.listen).toBe("function");
    expect(result.close).toBeDefined();
    expect(typeof result.close).toBe("function");
  });
});

