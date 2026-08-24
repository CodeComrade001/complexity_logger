import Ts_JS_Compiler from "./ts_js_Compiler.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { ComplexityOrchestrator_v1 } from "./modules/complexityGenerator_v1/complexity_orchestrator.js";
import { ComplexityReasonGenerator } from "./modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { BuildKeywordSet } from "./modules/complexityGenerator_v1/utils/buildkeyword.js";
import { PayloadNormalizer } from "./modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";
import { DeepFileSanitization } from "./utils/deepFileScan.js";
import { EnhancedAnalyzer_v2 } from "./modules/complexityGenerator_v1/paidTierResources/enhanced-analyzer-v3-paid.js";
import CompilerInstanceManager from "../compilerInstanceManager.js";
import { WorkerClient } from "../../worker/workerClient.js";


export interface JS_TS_CompilerInterface {
  compiler: {
    execute: (payload: any) => Promise<any>;
  };
  analysis?: {
    freeTier?: (data: any) => Promise<any>;
    paidTier?: (data: any) => Promise<any>;
  }; utils: {
    normalize: (data: any) => any;
    deepScan: (data: any) => any;
    extract: (files: any) => any;
  };
}


export class JS_TS_CreateCompiler {

  public init(): JS_TS_CompilerInterface {
    // 🔹 SINGLE INSTANCES (no duplication)
    const extractor = new GetUnitPartOfCode();
    const payloadNormalizer = new PayloadNormalizer();
    const deepScan = new DeepFileSanitization();

    // 🔹 AI + Analyzer stack
    const aiReason = new ComplexityReasonGenerator();
    const enhancedAnalyzer = new EnhancedAnalyzer_v2(aiReason);

    const orchestrator = new ComplexityOrchestrator_v1(
      BuildKeywordSet,
      enhancedAnalyzer
    );

    const compilerInstancesManager = new CompilerInstanceManager();

    const workerClient = new WorkerClient();
    // 🔹 Generator (REAL injection)
    const complexityGenerator = new GetComplexityGenerator(
      orchestrator, compilerInstancesManager,
      workerClient
    );


    // 🔹 TS_JS_Compiler 
    const ts_js_compiler = new Ts_JS_Compiler(complexityGenerator);

    // 🔹 CLEAN INTERFACE (NO GOD OBJECT)
    return {
      compiler: {
        execute: (payload: any) => ts_js_compiler.execute(payload),
      },

      analysis: {
        freeTier: (data: any) => orchestrator.executeFreeTier(data),
        paidTier: (data: any) => orchestrator.executePaidTier(data),
      },

      utils: {
        normalize: (data: any) => payloadNormalizer.normalize(data),
        extract: (files: any) =>
          extractor.extract(files),
        deepScan: (data: any) => deepScan.ts_js_deepFileScan(data),
      },
    };
  }
}