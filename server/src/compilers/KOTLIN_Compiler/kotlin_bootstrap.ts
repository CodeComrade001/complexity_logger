import Parser from "tree-sitter";
import { KotlinAnalyzer } from "./kotlin_modules/kotlin_analyzer.js";
import { AnalysisSummary } from "../shared/interfaces.js";

export interface KOTLIN_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class Kotlin_CreateCompiler {
  public init(): KOTLIN_CompilerInterface {
    const parser = new Parser();

    const RUST_compiler = new KotlinAnalyzer(parser);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          RUST_compiler.execute(sourceCode, fileName),
      },
    };
  }
}