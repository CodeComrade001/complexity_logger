import { AnalysisSummary } from "./interfaces/complexityGeneratorInterface.js";
import { GetComplexityGenerator } from "./modules/complexityGenerator.js";
import { CodeParts } from "./modules/complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { runWithConcurrency } from "./utils/RunWithConcurrency.js";
export type ComplexityGeneratorPayload = Record<string, CodeParts>;



export default class TS_JS_Compiler {
  private getComplexityGenerator: GetComplexityGenerator;

  constructor(
    getComplexityGenerator: GetComplexityGenerator
  ) {
    this.getComplexityGenerator = getComplexityGenerator;
  }



  private async complexityGenerator(
    payload: ComplexityGeneratorPayload,
  ): Promise<AnalysisSummary[] | null> {
    const complexityGenerator = this.getComplexityGenerator;

    const entries = Object.entries(payload);

    const results = await Promise.allSettled(
      entries.map(([fileName, data]) =>
        this.getComplexityGenerator.execute({ [fileName]: data })
      )
    );

    const final: AnalysisSummary[] = [];

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.success && r.value.data) {
        final.push(r.value.data);
      }
    }

    return final;
  }

  private isPayloadEmpty(payload: ComplexityGeneratorPayload): boolean {
    return Object.values(payload).every((file) =>
      Object.values(file).every(
        (arr) => Array.isArray(arr) && arr.length === 0
      )
    );
  }

  public async execute(
    input: ComplexityGeneratorPayload | ComplexityGeneratorPayload[]
  ): Promise<{
    data: AnalysisSummary[] | null;
    success: boolean;
    message?: string;
  }> {

    // ✅ normalize to array (CRITICAL FIX)
    const items = Array.isArray(input) ? input : [input];

    // ✅ empty check (REAL one, not your fake Object.keys hack)
    if (items.length === 0) {
      return {
        success: false,
        data: null,
        message: "Empty payload passed to compiler",
      };
    }

    // ✅ deep validation
    const validItems = items.filter((item) => !this.isPayloadEmpty(item));

    if (validItems.length === 0) {
      return {
        success: false,
        data: null,
        message: "No analyzable code found (empty extraction)",
      };
    }

    // ✅ concurrency execution
    const results = await runWithConcurrency<
      ComplexityGeneratorPayload,
      AnalysisSummary[] | null
    >({
      items: validItems,
      handler: async (item) => {
        return await this.complexityGenerator(item);
      },
      concurrency: 4,
      stopOnError: true,
    });

    // ✅ flatten (because each item returns AnalysisSummary[])
    const flattened = (results ?? [])
      .filter((r): r is AnalysisSummary[] => Array.isArray(r))
      .flat();

    if (flattened.length === 0) {
      return {
        success: false,
        data: null,
        message: "Complexity generation returned no usable results",
      };
    }


    return {
      success: true,
      data: flattened,
    };
  }

}


