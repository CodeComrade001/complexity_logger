
// ============================================================================
// FREE TIER COMPLEXITY CALCULATOR
// ============================================================================

import { CalculatorComplexityResult, ComplexityReason, RISK_THRESHOLDS, Uppercase_RiskLevelType } from "../../../interfaces/complexityGeneratorInterface";


export class FreeTierComplexityCalculator {

  /**
   * TIME COMPLEXITY — heuristic upper-bound classification
   */
  static calculateTimeComplexity(
    loopDepth: number,
    hasRecursion: boolean,
    isBinaryRecursion: boolean,
    hasSorting: boolean,
    hasLinearSearch: boolean
  ): CalculatorComplexityResult {

    const flags: string[] = [];
    let confidence = 100;

    // 1. Explosive growth dominates everything
    if (isBinaryRecursion) {
      flags.push("BINARY_RECURSION");
      return {
        notation: "O(2^n)",
        confidence: 90,
        flags
      };
    }

    // 2. High-order polynomial (unknown exponent)
    if (loopDepth >= 2 && hasRecursion) {
      flags.push("RECURSION", "NESTED_LOOPS");
      confidence -= 30;

      return {
        notation: "O(n^k)",
        confidence,
        flags
      };
    }

    if (loopDepth >= 2) {
      flags.push("NESTED_LOOPS");
      confidence -= 20;

      return {
        notation: "O(n^k)",
        confidence,
        flags
      };
    }

    // 3. Superlinear
    if (hasSorting) {
      flags.push("SORTING_PATTERN");
      confidence -= 15;

      return {
        notation: "O(n log n)",
        confidence,
        flags
      };
    }

    // 4. Linear
    if (loopDepth === 1 || hasLinearSearch || hasRecursion) {
      flags.push("LINEAR_ITERATION");
      confidence -= hasRecursion ? 20 : 0;

      return {
        notation: "O(n)",
        confidence,
        flags
      };
    }

    // 5. Constant
    return {
      notation: "O(1)",
      confidence: 95,
      flags
    };
  }

  /**
   * SPACE COMPLEXITY — conservative and honest
   */
  static calculateSpaceComplexity(
    allocationsInLoop: number, hasRecursion: boolean, _maxLoopDepth: number, hasDeepClone: boolean, hasAccumulation: boolean): CalculatorComplexityResult {

    const flags: string[] = [];
    let confidence = 100;

    // Recursion → stack growth (linear upper bound)
    if (hasRecursion) {
      flags.push("RECURSION_STACK");
      confidence -= 25;

      return {
        notation: "O(n)",
        confidence,
        flags
      };
    }

    // Accumulation or cloning → heap growth
    if (hasAccumulation || hasDeepClone) {
      flags.push("HEAP_ACCUMULATION");
      confidence -= 20;

      return {
        notation: "O(n)",
        confidence,
        flags
      };
    }

    // Allocations inside loop (escape unknown)
    if (allocationsInLoop > 0) {
      flags.push("LOOP_ALLOCATIONS");
      confidence -= 30;

      return {
        notation: "UNKNOWN",
        confidence,
        flags
      };
    }

    // Constant space
    return {
      notation: "O(1)",
      confidence: 95,
      flags
    };
  }

  static determineRiskLevel(totalScore: number): Uppercase_RiskLevelType {
    if (totalScore >= RISK_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (totalScore >= RISK_THRESHOLDS.HIGH) return "HIGH";
    if (totalScore >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  /**
   * Confidence aggregation — no averaging
   */
  static calculateOverallConfidence(reasons: ComplexityReason[]): number {
    if (reasons.length === 0) return 50;

    // Take the strongest signal, not the average
    return Math.max(...reasons.map(r => r.confidence));
  }
}
