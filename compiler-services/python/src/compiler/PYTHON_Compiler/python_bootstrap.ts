import Parser from "tree-sitter";
import { PythonAnalyzer } from "./python_modules/python_analyzer.js";
import { AnalysisSummary } from "../compiler.interface.js";
import PYTHON from "tree-sitter-python";

export interface PYTHON_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class PYTHON_CreateCompiler {
  public init(): PYTHON_CompilerInterface {
    const parser = new Parser();

    const PYTHON_compiler = new PythonAnalyzer(parser);
    parser.setLanguage(PYTHON);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          PYTHON_compiler.execute(sourceCode, fileName),
      },
    };
  }
}