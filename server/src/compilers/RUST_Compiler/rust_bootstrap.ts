import Parser from "tree-sitter";
import { AnalysisSummary } from "../shared/interfaces.js";
import { RustAnalyzer } from '../RUST_Compiler/rust_modules/rust_analyzer.js';

export interface RUST_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class RUST_CreateCompiler {
  public init(): RUST_CompilerInterface {
    const parser = new Parser();
    parser.setLanguage(require("tree-sitter-rust"));

    const RUST_compiler = new RustAnalyzer(parser);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          RUST_compiler.execute(sourceCode, fileName),
      },
    };
  }
}