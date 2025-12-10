import { AnalysisSummary } from "../interfaces/complexityGeneratorInterface";
import { EnhancedComplexityGenerator_v1 } from "./complexityGenerator_v1/enhanced_analyzer";


export class GetComplexityGenerator {
  private complexityEngineGenerator: EnhancedComplexityGenerator_v1;

  constructor(complexityEngineGenerator: EnhancedComplexityGenerator_v1) {
    this.complexityEngineGenerator = complexityEngineGenerator;
  }



  // helpers to handle arrays or single node values safely
  private ensureArray(x: any): any[] {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    return [x];
  }

  private async generateFreeTierReport(data: any): Promise<{ success: boolean, message: string, data?: AnalysisSummary }> {
    try {

      const freeComplexityReport = await this.complexityEngineGenerator.executeFreeTier(data);
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ freeComplexityReport:", freeComplexityReport);

      return ({ success: true, message: "Free  tier report generation successful", data: freeComplexityReport });
    } catch (error) {
      console.log("Turbo Log  ~ GetComplexityGenerator ~ generateFreeTierReport ~ error:", error);
      return { success: false, message: "internal server error" }
    }
  }

  private async generatePaidTierReport(data: any): Promise<{ success: boolean, message: string, data?: AnalysisSummary }> {
    try {

      const paidComplexityReport = await this.complexityEngineGenerator.executeFreeTier(data);
      console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ paidComplexityReport:", paidComplexityReport);
      return { success: true, message: "Paid  tier report generation successful", data: paidComplexityReport };
    } catch (error) {
      console.log("Turbo Log  ~ GetComplexityGenerator ~ generateFreeTierReport ~ error:", error);
      return { success: false, message: "internal server error" }
    }
  }

  /**
 * Filters input data to retain only non-empty arrays for specific keys (methods, arrows, functions).
 * @param data The raw input object from fetchPartOfCodeResult.
 * @returns An object containing only valid, non-empty data subsets.
 */
  private filterAndCleanCodeParts(data: any): { success: boolean, data: { [key: string]: any[] } } {
    const cleanedData: { [key: string]: any[] } = {};
    const relevantKeys = ['methods', 'arrows', 'functions'];

    if (!data || typeof data !== 'object') {
      return ({ success: false, data: cleanedData }); // Return empty if input is invalid
    }

    for (const key of relevantKeys) {
      // Use your existing helper to ensure we always deal with an array
      const valueArray = this.ensureArray(data[key]);

      // Only add to the result if the array has content
      if (valueArray.length > 0) {
        cleanedData[key] = valueArray;
      }
    }

    return ({ success: true, data: cleanedData });
  }

  // main public API
  public async execute(fetchPartOfCodeResult: any) {
    // expected keys: methods, arrows, functions
    const { data, success } = await this.filterAndCleanCodeParts(fetchPartOfCodeResult);

    if (!success) return { success: false, message: "Data serialization failed" };

    const { data: freeComplexityReport, success: freeTierSuccess } = await this.generateFreeTierReport(data);
    if (!freeTierSuccess) return { success: false, message: "Free tier complexity analysis failed" };

    const { data: paidComplexityReport, success: paidTierConfirmation } = await this.generatePaidTierReport(data);
    if (!paidTierConfirmation) return { success: false, message: "Paid tier complexity analysis failed" };
    return {
      success: true, message: "Complexity analysis complete", data: { paidComplexityReport, freeComplexityReport }
    }
  }
}
