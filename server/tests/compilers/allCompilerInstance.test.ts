import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock all compiler bootstraps
const mockTsJsInit = jest.fn();
const mockGoInit = jest.fn();
const mockJavaInit = jest.fn();
const mockPythonInit = jest.fn();
const mockRustInit = jest.fn();
const mockCsharpInit = jest.fn();

jest.mock("../../src/compilers/TS_JS_Compiler/ts_js_bootstrap.js", () => ({
  JS_TS_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockTsJsInit.mockReturnValue({ name: "tsjs" }),
  })),
}));

jest.mock("../../src/compilers/GO_Compiler/go_bootstrap.js", () => ({
  GO_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockGoInit.mockReturnValue({ name: "go" }),
  })),
}));

jest.mock("../../src/compilers/JAVA_Compiler/java_bootstrap.js", () => ({
  JAVA_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockJavaInit.mockReturnValue({ name: "java" }),
  })),
}));

jest.mock("../../src/compilers/PYTHON_Compiler/python_bootstrap.js", () => ({
  PYTHON_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockPythonInit.mockReturnValue({ name: "python" }),
  })),
}));

jest.mock("../../src/compilers/RUST_Compiler/rust_bootstrap.js", () => ({
  RUST_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockRustInit.mockReturnValue({ name: "rust" }),
  })),
}));

jest.mock("../../src/compilers/CSHARP_Compiler/csharp_bootstrap.js", () => ({
  CSHARP_CreateCompiler: jest.fn().mockImplementation(() => ({
    init: mockCsharpInit.mockReturnValue({ name: "csharp" }),
  })),
}));

import {
  get_Js_Ts_Compiler,
  getGoCompiler,
  getJavaCompiler,
  getPythonCompiler,
  getRustCompiler,
  getCsharpCompiler,
} from "../../src/compilers/allCompilerInstance.js";

describe("allCompilerInstance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset module state by re-evaluating - jest.isolateModules
  });

  describe("get_Js_Ts_Compiler", () => {
    it("should initialize TS/JS compiler on first call", () => {
      const compiler = get_Js_Ts_Compiler();
      expect(compiler).toEqual({ name: "tsjs" });
      expect(mockTsJsInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      const first = get_Js_Ts_Compiler();
      const second = get_Js_Ts_Compiler();
      expect(first).toBe(second);
      expect(mockTsJsInit).toHaveBeenCalledTimes(1); // init only called once
    });
  });

  describe("getGoCompiler", () => {
    it("should initialize Go compiler on first call", () => {
      const compiler = getGoCompiler();
      expect(compiler).toEqual({ name: "go" });
      expect(mockGoInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      getGoCompiler();
      getGoCompiler();
      expect(mockGoInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("getJavaCompiler", () => {
    it("should initialize Java compiler on first call", () => {
      const compiler = getJavaCompiler();
      expect(compiler).toEqual({ name: "java" });
      expect(mockJavaInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      getJavaCompiler();
      getJavaCompiler();
      expect(mockJavaInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPythonCompiler", () => {
    it("should initialize Python compiler on first call", () => {
      const compiler = getPythonCompiler();
      expect(compiler).toEqual({ name: "python" });
      expect(mockPythonInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      getPythonCompiler();
      getPythonCompiler();
      expect(mockPythonInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("getRustCompiler", () => {
    it("should initialize Rust compiler on first call", () => {
      const compiler = getRustCompiler();
      expect(compiler).toEqual({ name: "rust" });
      expect(mockRustInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      getRustCompiler();
      getRustCompiler();
      expect(mockRustInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCsharpCompiler", () => {
    it("should initialize C# compiler on first call", () => {
      const compiler = getCsharpCompiler();
      expect(compiler).toEqual({ name: "csharp" });
      expect(mockCsharpInit).toHaveBeenCalledTimes(1);
    });

    it("should return cached instance on subsequent calls", () => {
      getCsharpCompiler();
      getCsharpCompiler();
      expect(mockCsharpInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("cross-compiler isolation", () => {
    it("should maintain separate caches for each compiler type", () => {
      const tsjs = get_Js_Ts_Compiler();
      const go = getGoCompiler();
      const java = getJavaCompiler();
      const python = getPythonCompiler();
      const rust = getRustCompiler();
      const csharp = getCsharpCompiler();

      expect(tsjs).toEqual({ name: "tsjs" });
      expect(go).toEqual({ name: "go" });
      expect(java).toEqual({ name: "java" });
      expect(python).toEqual({ name: "python" });
      expect(rust).toEqual({ name: "rust" });
      expect(csharp).toEqual({ name: "csharp" });

      // Each init should only be called once
      expect(mockTsJsInit).toHaveBeenCalledTimes(1);
      expect(mockGoInit).toHaveBeenCalledTimes(1);
      expect(mockJavaInit).toHaveBeenCalledTimes(1);
      expect(mockPythonInit).toHaveBeenCalledTimes(1);
      expect(mockRustInit).toHaveBeenCalledTimes(1);
      expect(mockCsharpInit).toHaveBeenCalledTimes(1);
    });
  });
});
