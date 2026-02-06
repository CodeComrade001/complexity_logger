import { ASTSignals, CalculatorComplexityResult, ComplexityReason, RISK_THRESHOLDS, Uppercase_RiskLevelType, WEIGHTS } from "../../../interfaces/complexityGeneratorInterface.js";

export class PaidTierComplexityCalculator {


  static calculateTimeComplexity(
    loopDepth: number,
    hasRecursion: boolean,
    isBinaryRecursion: boolean,
    hasSorting: boolean,
    hasLinearSearch: boolean,
    hasDeepClone: boolean,
    hasAccumulation: boolean
  ): CalculatorComplexityResult {
    const flags: string[] = [];

    // --- 1. FACTORIAL GROWTH (O(n!)) ---
    // Recursion combined with loops or permutations
    if (hasRecursion && loopDepth >= 1 && (hasSorting || isBinaryRecursion)) {
      flags.push("FACTORIAL_EXPLOSION");
      return { notation: "O(n!)", confidence: 70, flags };
    }

    // --- 2. EXPONENTIAL GROWTH (O(2^n)) ---
    if (isBinaryRecursion || (hasRecursion && hasDeepClone)) {
      flags.push("EXPONENTIAL_RECURSION");
      return { notation: "O(2^n)", confidence: 85, flags };
    }

    // --- 3. UNKNOWN HIGH POLYNOMIAL (O(n^k)) ---
    // Depth 4+ is usually the threshold where we stop precise naming
    if (loopDepth >= 4) {
      flags.push("DEEP_NESTING_EXCESSIVE");
      return { notation: "O(n^k)", confidence: 90, flags };
    }

    // --- 4. CUBIC GROWTH (O(n³)) ---
    // Depth 3, or Depth 2 with heavy operations like sorting
    if (loopDepth === 3 || (loopDepth === 2 && hasSorting)) {
      flags.push("CUBIC_COMPLEXITY");
      return { notation: "O(n³)", confidence: 80, flags };
    }

    // --- 5. QUADRATIC GROWTH (O(n²)) ---
    // Depth 2, or Depth 1 with Linear Search/Sorting/Deep Clone
    if (loopDepth === 2) {
      flags.push("NESTED_LOOPS");
      return { notation: "O(n²)", confidence: 95, flags };
    }

    if (loopDepth === 1 && (hasLinearSearch || hasSorting || hasDeepClone)) {
      flags.push("SEARCH_OR_SORT_IN_LOOP");
      // O(n * log n) or O(n * n) both map here for safety
      return { notation: "O(n²)", confidence: 85, flags };
    }

    // --- 6. SUPERLINEAR (O(n log n)) ---
    if (hasSorting) {
      flags.push("SORTING_ALGORITHM");
      return { notation: "O(n log n)", confidence: 95, flags };
    }

    // --- 7. LINEAR (O(n)) ---
    if (loopDepth === 1 || hasLinearSearch || hasRecursion || hasAccumulation) {
      if (hasRecursion) flags.push("RECURSIVE_WALK");
      if (hasAccumulation) flags.push("ACCUMULATION_PATTERN");
      flags.push("LINEAR_SCAN");

      return {
        notation: "O(n)",
        confidence: hasRecursion ? 75 : 90,
        flags
      };
    }

    // --- 8. CONSTANT (O(1)) ---
    // If no loops, no recursion, and no linear operations found
    return {
      notation: "O(1)",
      confidence: 95,
      flags
    };
  }



  /**
  * SPACE COMPLEXITY — Analyzes Stack and Heap growth patterns
  */
  static calculateSpaceComplexity(
    loopDepth: number,
    allocationInLoop: number,
    hasRecursion: boolean,
    hasSorting: boolean,
    hasDeepClone: boolean,
    hasAccumulation: boolean
  ): CalculatorComplexityResult {
    const flags: string[] = [];

    // --- 1. QUADRATIC SPACE (O(n²)) ---
    // Deep cloning or Accumulation inside a loop creates a 2D data growth pattern
    if (loopDepth >= 1 && (hasDeepClone || hasAccumulation)) {
      flags.push("NESTED_ALLOCATION");
      return {
        notation: "O(n²)",
        confidence: 80,
        flags
      };
    }

    // --- 2. LINEAR SPACE (O(n)) ---
    // Recursion causes stack growth. Accumulation/Cloning causes heap growth.
    if (hasRecursion || hasAccumulation || hasDeepClone) {
      if (hasRecursion) flags.push("STACK_RECURSION");
      if (hasAccumulation) flags.push("HEAP_GROWTH");
      if (hasDeepClone) flags.push("OBJECT_CLONING");

      return {
        notation: "O(n)",
        // Recursion depth is an estimate, so lower confidence slightly
        confidence: hasRecursion ? 75 : 90,
        flags
      };
    }

    // --- 3. UNKNOWN / VOLATILE ---
    // If we see generic allocations in a loop but no specific pattern
    if (allocationInLoop > 0) {
      flags.push("LOOP_ALLOCATIONS");
      return {
        notation: "O(n^k)", // Mapping "Unknown" to "n^k" to match your allowed types
        confidence: 60,
        flags
      };
    }

    // --- 4. LOGARITHMIC SPACE (O(log n)) ---
    // Sorting (e.g., QuickSort) typically uses O(log n) stack space
    if (hasSorting) {
      flags.push("SORT_STACK_USAGE");
      return {
        notation: "O(log n)",
        confidence: 85,
        flags
      };
    }

    // --- 5. CONSTANT SPACE (O(1)) ---
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
  static calculateOverallConfidence(signals: ASTSignals): number {
    let confidence = 100;

    if (signals.maxLoopDepth > 0) {
      confidence -= WEIGHTS.LOOP;
      confidence -= signals.maxLoopDepth * WEIGHTS.NESTED_LOOP_FACTOR;
    }

    if (signals.hasRecursion) {
      confidence -= signals.isBinaryRecursion
        ? WEIGHTS.BINARY_RECURSION
        : WEIGHTS.RECURSION;
    }

    if (signals.hasSorting) confidence -= WEIGHTS.SORT;
    if (signals.hasLinearSearch) confidence -= WEIGHTS.SEARCH_LINEAR;

    confidence -= signals.allocationsInLoop * WEIGHTS.ALLOCATION;

    if (signals.hasDeepClone) confidence -= WEIGHTS.DEEP_CLONE;
    if (signals.hasAccumulation) confidence -= WEIGHTS.ACCUMULATOR;

    confidence -= signals.matchedKeywords.length * WEIGHTS.KEYWORD_HIT;

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

}
