import Parser from "tree-sitter";
import { JavaAnalyzer } from "./java_modules/java_analyzer.js";
import { AnalysisSummary } from "./shared/interfaces.js";
import JAVA from "tree-sitter-java";

export interface JAVA_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class JAVA_CreateCompiler {
  public init(): JAVA_CompilerInterface {
    const parser = new Parser();
    parser.setLanguage(JAVA);

    const JAVA_compiler = new JavaAnalyzer(parser);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          JAVA_compiler.execute(sourceCode, fileName),
      },
    };
  }
}