import { Project } from "ts-morph";
import Ts_JS_Compiler from "./ts_js_Compiler.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { ComplexityOrchestrator_v1 } from "./modules/complexityGenerator_v1/complexity_orchestrator.js";
import { ComplexityReasonGenerator } from "./modules/complexityGenerator_v1/paidTierResources/aI_ReasonGenerator.js";
import { EnhancedAnalyzer_v2 } from "./modules/complexityGenerator_v1/paidTierResources/enhancedAnalyzer_v2.js";
import { BuildKeywordSet } from "./modules/complexityGenerator_v1/utils/buildkeyword.js";
import { PayloadNormalizer } from "./modules/complexityOrchestratorHelpers/payloadNormalizer.js";
import { GetUnitPartOfCode } from "./modules/fetchPartOfCode.js";
import { DeepFileSanitization } from "./utils/deepFileScan.js";


/*//////////////////////////////////////////////////////////////
                          TYPES && INTERFACE
    //////////////////////////////////////////////////////////////*/


export interface CompilerInterface {
  compiler: {
    execute: (payload: any) => Promise<any>;
  };
  analysis: {
    freeTier: (data: any) => Promise<any>;
    paidTier: (data: any) => Promise<any>;
  };
  utils: {
    normalize: (data: any) => any;
    deepScan: (data: any) => any;
    extract: (props: any, files: any, unitIndex: number) => any;
  };
}


export class CreateCompiler {
  public init(): CompilerInterface {
    // 🔹 SINGLE INSTANCES (no duplication)
    const project = new Project()
    const extractor = new GetUnitPartOfCode(project);
    const payloadNormalizer = new PayloadNormalizer();
    const deepScan = new DeepFileSanitization();

    // 🔹 AI + Analyzer stack
    const aiReason = new ComplexityReasonGenerator();
    const enhancedAnalyzer = new EnhancedAnalyzer_v2(aiReason);

    const orchestrator = new ComplexityOrchestrator_v1(
      BuildKeywordSet,
      enhancedAnalyzer
    );

    // 🔹 SIMPLE IN-MEMORY CACHE (replace with Redis later)
    const normalizationCache = new Map<string, any>();

    const normalizeWithCache = (payload: any) => {
      const key = JSON.stringify(payload);

      if (normalizationCache.has(key)) {
        return normalizationCache.get(key);
      }

      const result = payloadNormalizer.normalize(payload);
      normalizationCache.set(key, result);

      return result;
    };

    // 🔹 Generator (REAL injection)
    const complexityGenerator = new GetComplexityGenerator(
      orchestrator,
      normalizeWithCache
    );

    const compiler = new Ts_JS_Compiler(complexityGenerator);

    // 🔹 CLEAN INTERFACE (NO GOD OBJECT)
    return {
      compiler: {
        execute: (payload: any) => compiler.execute(payload),
      },

      analysis: {
        freeTier: (data: any) => orchestrator.executeFreeTier(data),
        paidTier: (data: any) => orchestrator.executePaidTier(data),
      },

      utils: {
        normalize: (data: any) => normalizeWithCache(data),
        extract: (props: any, files: any, unitIndex: number) =>
          extractor.extract(props, files, unitIndex),
        deepScan: (data: any) => deepScan.ts_js_deepFileScan(data),
      },
    };
  }
}