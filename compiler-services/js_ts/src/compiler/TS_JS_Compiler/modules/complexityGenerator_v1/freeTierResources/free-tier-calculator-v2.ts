// ============================================================================
// FREE TIER COMPLEXITY CALCULATOR (Version 2.0 - Refactored)
// Target: ~80% correctness, production-ready
// ============================================================================

import {
  CalculatorComplexityResult,
  ComplexityReason,
  ComplexityNotation,
  RISK_THRESHOLDS,
  Uppercase_RiskLevelType
} from "../../../interfaces/complexityGeneratorInterface.js";
import {
  ConfidenceStrategy,
  NotationValidator,
  InputValidator
} from "../utils/shared-complexity-utils.js";

export class FreeTierComplexityCalculator {

  /**
   * TIME COMPLEXITY - Heuristic upper-bound classification
   * FREE VERSION: Simplified logic with basic validation
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
    let notation: ComplexityNotation;

    // Validate inputs
    const safeDepth = InputValidator.validateLoopDepth(loopDepth);

    // Decision tree (ordered by severity)

    // 1. Exponential growth dominates
    if (isBinaryRecursion) {
      notation = "O(2ⁿ)";
      confidence = 75; // Regex-based, less certain
      flags.push("BINARY_RECURSION");
    }
    // 2. Polynomial (unknown exponent)
    else if (safeDepth >= 4) {
      notation = "O(n^k)";
      confidence = 70;
      flags.push("EXCESSIVE_NESTING");
    }
    // 3. Cubic
    else if (safeDepth === 3) {
      notation = "O(n³)";
      confidence = 80;
      flags.push("TRIPLE_NESTED_LOOPS");
    }
    // 4. Quadratic
    else if (safeDepth === 2 || hasLinearSearch) {
      notation = "O(n²)";
      confidence = 85;
      flags.push(hasLinearSearch ? "LINEAR_SEARCH_IN_LOOP" : "NESTED_LOOPS");
    }
    // 5. Superlinear
    else if (hasSorting) {
      notation = "O(n log n)";
      confidence = 80;
      flags.push("SORTING_PATTERN");
    }
    // 6. Linear
    else if (safeDepth === 1 || hasRecursion) {
      notation = "O(n)";
      confidence = hasRecursion ? 75 : 85;
      flags.push(hasRecursion ? "RECURSION" : "LINEAR_ITERATION");
    }
    // 7. Constant
    else {
      notation = "O(1)";
      confidence = 90;
      flags.push("CONSTANT_TIME");
    }

    // Apply free tier confidence cap (smart business logic)
    const finalConfidence = ConfidenceStrategy.applyFreeTierCap(
      confidence,
      notation,
      "free"
    );

    // Validate output
    NotationValidator.validate(notation);

    return {
      notation,
      confidence: finalConfidence,
      flags
    };
  }

  /**
   * SPACE COMPLEXITY - Conservative estimation
   * FREE VERSION: Basic heuristics
   */
  static calculateSpaceComplexity(
    allocationsInLoop: number,
    hasRecursion: boolean,
    maxLoopDepth: number,
    hasDeepClone: boolean,
    hasAccumulation: boolean
  ): CalculatorComplexityResult {
    const flags: string[] = [];
    let confidence = 100;
    let notation: ComplexityNotation;

    // Validate inputs
    const safeDepth = InputValidator.validateLoopDepth(maxLoopDepth);

    // Decision tree

    // 1. Recursion → stack growth
    if (hasRecursion) {
      notation = "O(n)";
      confidence = 75;
      flags.push("RECURSION_STACK");
    }
    // 2. Deep cloning or accumulation
    else if (hasAccumulation || hasDeepClone) {
      notation = "O(n)";
      confidence = 70;
      flags.push("HEAP_ACCUMULATION");
    }
    // 3. Allocations in loops (conservative)
    else if (allocationsInLoop > 0) {
      if (safeDepth >= 2) {
        notation = "O(n²)";
        confidence = 65;
        flags.push("NESTED_LOOP_ALLOCATIONS");
      } else {
        notation = "O(n)";
        confidence = 70;
        flags.push("LOOP_ALLOCATIONS");
      }
    }
    // 4. Constant space
    else {
      notation = "O(1)";
      confidence = 85;
      flags.push("CONSTANT_SPACE");
    }

    // Apply free tier cap
    const finalConfidence = ConfidenceStrategy.applyFreeTierCap(
      confidence,
      notation,
      "free"
    );

    // Validate
    NotationValidator.validate(notation);

    return {
      notation,
      confidence: finalConfidence,
      flags
    };
  }

  /**
   * Map total score to risk level
   * Uses standard thresholds from interfaces
   */
  static determineRiskLevel(totalScore: number): Uppercase_RiskLevelType {
    if (totalScore >= RISK_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (totalScore >= RISK_THRESHOLDS.HIGH) return "HIGH";
    if (totalScore >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  /**
   * Aggregate confidence from multiple signals
   * Uses max strategy (strongest signal wins)
   */
  static calculateOverallConfidence(reasons: ComplexityReason[]): number {
    return ConfidenceStrategy.aggregateConfidence(reasons);
  }
}
