import { EnhancedComplexityGenerator_v1 } from "../../compiler/modules/complexityGenerator_v1/enhanced_analyzer";



export async function runComplexityGeneration(job: any) {
  try {
    const output: any = {};
    const fastAnalyzer = new EnhancedComplexityGenerator_v1();

  } catch (error) {
    console.error("Error during worker running complexity generation:", error);
    throw error;
  }
}