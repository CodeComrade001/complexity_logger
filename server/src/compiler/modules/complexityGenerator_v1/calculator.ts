
// ============================================================================
// COMPLEXITY CALCULATOR
// ============================================================================

import { ComplexityNotation, ComplexityReason, RISK_THRESHOLDS } from "../../interfaces/complexityGeneratorInterface";

export class ComplexityCalculator {

  /**
   * Calculate Big-O notation from detected patterns
   */
  static calculateTimeComplexity(
    loopDepth: number,
    hasRecursion: boolean,
    isBinaryRecursion: boolean,
    hasSorting: boolean,
    hasLinearSearch: boolean
  ): ComplexityNotation {
    // Exponential - worst case
    if (isBinaryRecursion) return "O(2^n)";

    // Cubic and higher
    if (loopDepth >= 3) return "O(n³)";

    // Quadratic
    if (loopDepth === 2) return "O(n²)";

    // n log n - sorting or divide & conquer
    if (hasSorting || (hasRecursion && loopDepth === 1)) return "O(n log n)";

    // Linear
    if (loopDepth === 1 || hasLinearSearch || hasRecursion) return "O(n)";

    // Logarithmic - rare, but possible with binary search patterns
    // (would need more sophisticated detection)

    // Constant - no loops, no recursion
    return "O(1)";
  }

  static calculateSpaceComplexity(
    allocationsInLoop: number,
    hasRecursion: boolean,
    loopDepth: number,
    hasDeepClone: boolean,
    hasAccumulation: boolean
  ): ComplexityNotation {
    // Recursion always adds stack space
    if (hasRecursion && loopDepth >= 2) return "O(n²)";
    if (hasRecursion && allocationsInLoop > 0) return "O(n²)";

    // Deep cloning or accumulation in nested loops
    if ((hasDeepClone || hasAccumulation) && loopDepth >= 2) return "O(n²)";

    // Linear space - allocations in loop or recursion
    if (allocationsInLoop > 0 || hasRecursion || hasAccumulation || hasDeepClone) {
      return "O(n)";
    }

    // Logarithmic space - recursion with divide & conquer (rare)
    // Would need sophisticated detection

    // Constant space
    return "O(1)";
  }

  static determineRiskLevel(totalScore: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (totalScore >= RISK_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (totalScore >= RISK_THRESHOLDS.HIGH) return "HIGH";
    if (totalScore >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  static calculateOverallConfidence(reasons: ComplexityReason[]): number {
    if (reasons.length === 0) return 50;

    const avgConfidence = reasons.reduce((sum, r) => sum + r.confidence, 0) / reasons.length;
    return Math.round(avgConfidence);
  }
}