import Parser from "tree-sitter";
import { ZigAnalyzer } from "./zig_modules/zig_analyzer.js";
import { AnalysisSummary } from "../shared/interfaces.js";

export interface ZIG_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class ZIG_CreateCompiler {
  public init(): ZIG_CompilerInterface {
    const parser = new Parser();

    const ZIG_compiler = new ZigAnalyzer(parser);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          ZIG_compiler.execute(sourceCode, fileName),
      },
    };
  }
}