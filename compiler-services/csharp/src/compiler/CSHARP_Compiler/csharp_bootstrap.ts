import Parser from "tree-sitter";
import { CSharpAnalyzer } from "./csharp_modules/csharp_analyzer.js";
import { AnalysisSummary } from "../compiler.interface.js";
import CSharp from 'tree-sitter-c-sharp';


export interface CSHARP_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
}

export class CSHARP_CreateCompiler {
  public init(): CSHARP_CompilerInterface {
    const parser = new Parser();
    parser.setLanguage(CSharp);

    const CSHARP_compiler = new CSharpAnalyzer(parser);

    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) =>
          CSHARP_compiler.execute(sourceCode, fileName),
      },
    };
  }
}