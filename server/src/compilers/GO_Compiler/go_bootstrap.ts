import Parser from "tree-sitter";
import { GoAnalyzer } from "./go_modules/GO_analyzer.js";
import { AnalysisSummary } from "../shared/interfaces.js";

export interface GO_CompilerInterface {
  compiler: {
    execute: (sourceCode: string, fileName: string) => Promise<AnalysisSummary>;
  };
  // analysis: {
  //   freeTier: (data: any) => Promise<any>;
  //   paidTier: (data: any) => Promise<any>;
  // };
  // utils: {
  //   normalize: (data: any) => any;
  //   deepScan: (data: any) => any;
  //   extract: (props: any, files: any) => any;
  // };
}



export class GO_CreateCompiler {
  public init(): GO_CompilerInterface {
    const parser = new Parser()

    const GO_compiler = new GoAnalyzer(parser)

    // 🔹 CLEAN INTERFACE (NO GOD OBJECT)
    return {
      compiler: {
        execute: (sourceCode: string, fileName: string) => GO_compiler.execute(sourceCode, fileName),
      }
      // ,

      // analysis: {
      //   freeTier: (data: any) => orchestrator.executeFreeTier(data),
      //   paidTier: (data: any) => orchestrator.executePaidTier(data),
      // },

      // utils: {
      //   normalize: (data: any) => payloadNormalizer.normalize(data),
      //   extract: (props: any, files: any) =>
      //     extractor.extract(props, files),
      //   deepScan: (data: any) => deepScan.ts_js_deepFileScan(data),
      // },
    };
  }
}