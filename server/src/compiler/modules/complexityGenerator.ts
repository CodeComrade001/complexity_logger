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

  private serializeData(data: any) {
    const newData: any[] = [];
    data.map((item: any) => {
      const formatDataToArray = this.ensureArray(item);
      if (formatDataToArray.length !== 0) {
        newData.push(...formatDataToArray);
      }

    })
    if (newData.length === 0) return { success: false, message: "No valid data to serialize", data: null };

    return { success: true, message: "Data serialization complete", data: newData };
  }

  // main public API
  public async execute(fetchPartOfCodeResult: any) {
    // expected keys: methods, arrows, functions
    const { data, success } = await this.serializeData(fetchPartOfCodeResult);
    if (!success) return { success: false, message: "Data serialization failed" };
    const freeComplexityReport = await this.complexityEngineGenerator.executeFreeTier(data);
    console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ freeComplexityReport:", freeComplexityReport);
    const paidComplexityReport = await this.complexityEngineGenerator.executeFreeTier(data);
    console.log("Turbo Log  ~ GetComplexityGenerator ~ execute ~ paidComplexityReport:", paidComplexityReport);

    return {
      success: true, message: "Complexity analysis complete", data: { freeComplexityReport, paidComplexityReport }
    }
  }
}
