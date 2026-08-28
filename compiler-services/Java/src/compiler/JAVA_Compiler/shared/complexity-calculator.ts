// ============================================================================
// COMPLEXITY PROFILE BUILDER - Shared Logic
// Mirrors: buildComplexityProfile() from enhanced-analyzer-v3-paid.ts
// Language modules call this after extracting their SignalProfile.
// Language-specific overrides are applied BEFORE calling this.
// ============================================================================

import {
  ComplexityNotation,
  ComplexityProfile,
  GrowthProfile,
  Risk,
  SignalProfile,
} from "./interfaces.js";
import { NotationValidator, RiskCalculator } from "./shared-utils.js";

// ============================================================================
// TIME COMPLEXITY DECISION TREE
// Ordered by severity — first match wins.
// Mirrors the exact ladder from enhanced-analyzer-v3-paid.ts.
// ============================================================================
export function buildTimeComplexity(
  signals: SignalProfile
): { notation: ComplexityNotation; score: number } {
  // 1. O(1) - constant with return, no loops
  if (signals.isConstantWithReturn) {
    return { notation: "O(1)", score: 1 };
  }

  // 2. O(1) - constant body, only conditionals
  if (signals.isConstantBody && signals.conditionals > 0) {
    return { notation: "O(1)", score: 1 };
  }

  // 3. O(2ⁿ) - binary recursion
  if (signals.recursionDoubled) {
    return { notation: "O(2ⁿ)", score: 9 };
  }

  // 4. O(n!) - recursion + loop in recursion + filter/slice (permutation pattern)
  if (signals.recursion && signals.hasLoopInRecursion && signals.hasFilterOrSlice) {
    return { notation: "O(n!)", score: 10 };
  }

  // 5. O(n²) - linear search in loop OR nested array methods
  if (signals.hasLinearSearchInLoop || signals.hasNestedArrayMethods) {
    return { notation: "O(n²)", score: 7 };
  }

  // 6. O(n³) - recursion + deeply nested loops (≥2)
  if (signals.recursion && signals.nestedLoops >= 2) {
    return { notation: "O(n³)", score: 8 };
  }

  // 7. O(n²) - recursion + loop inside recursion
  if (signals.recursion && signals.hasLoopInRecursion) {
    return { notation: "O(n²)", score: 7 };
  }

  // 8. Recursion + allocations
  if (signals.recursion && signals.allocations > 0) {
    if (signals.hasFilterOrSlice) {
      return { notation: "O(n log n)", score: 5 };
    }
    return { notation: "O(n²)", score: 7 };
  }

  // 9. O(n log n) - sorting detected
  if (signals.hasSorting) {
    return { notation: "O(n log n)", score: 5 };
  }

  // 10. O(n) - simple recursion (no branching)
  if (signals.recursion) {
    return { notation: "O(n)", score: 4 };
  }

  // 11. O(n³) - triple nested loops
  if (signals.nestedLoops >= 3) {
    return { notation: "O(n³)", score: 8 };
  }

  // 12. O(n²) - double nested loops
  if (signals.nestedLoops === 2) {
    return { notation: "O(n²)", score: 7 };
  }

  // 13. O(log n) / O(n) - single loop
  if (signals.loops > 0 || signals.functionalLoopCount > 0) {
    const likelyLogN =
      signals.conditionals > 0 &&
      (signals.hasBreakOrContinue || signals.hasEarlyReturn) &&
      signals.loops === 1 &&
      signals.functionalLoopCount === 0;

    return likelyLogN
      ? { notation: "O(log n)", score: 2 }
      : { notation: "O(n)", score: 4 };
  }

  // 14. O(1) fallback
  return { notation: "O(1)", score: 1 };
}

// ============================================================================
// SPACE COMPLEXITY DECISION TREE
// Ordered by severity — first match wins.
// ============================================================================
export function buildSpaceComplexity(
  signals: SignalProfile
): { notation: ComplexityNotation; score: number } {
  // 1. O(n²) - nested data structures
  if (signals.usesNestedDataStructures) {
    return { notation: "O(n²)", score: 7 };
  }

  // 2. Spread operator in nested loops
  if (signals.hasSpreadOperator && signals.nestedLoops >= 2) {
    return { notation: "O(n²)", score: 7 };
  }

  // 3. O(n) - allocation in loop or recursion
  if (signals.loopWithAllocation || signals.recursionWithAllocation) {
    return { notation: "O(n)", score: 4 };
  }

  // 4. O(n) - recursion alone (call stack)
  if (signals.recursion) {
    return { notation: "O(n)", score: 4 };
  }

  // 5. O(n) - JSON operations (full copy)
  if (signals.hasJSONOperations) {
    return { notation: "O(n)", score: 4 };
  }

  // 6. O(1) - fixed allocations outside loops
  if (
    signals.allocations > 0 ||
    signals.usesDataStructures ||
    signals.hasSpreadOperator
  ) {
    return { notation: "O(1)", score: 2 };
  }

  // 7. O(1) - no allocations
  return { notation: "O(1)", score: 1 };
}

// ============================================================================
// COMPLETE PROFILE BUILDER
// ============================================================================
export function buildComplexityProfile(signals: SignalProfile): ComplexityProfile {
  const { notation: timeNotation, score: timeScore } = buildTimeComplexity(signals);
  const { notation: spaceNotation, score: spaceScore } = buildSpaceComplexity(signals);

  NotationValidator.validate(timeNotation);
  NotationValidator.validate(spaceNotation);

  return { timeNotation, spaceNotation, timeScore, spaceScore };
}

// ============================================================================
// MODEL GROWTH
// Combines time + space into weighted total with risk tier.
// Mirrors: modelGrowth() from enhanced-analyzer-v3-paid.ts
// ============================================================================
export function modelGrowth(profile: ComplexityProfile): GrowthProfile {
  // Weighted combination: time 70%, space 30%
  const totalScore = Math.round(profile.timeScore * 0.7 + profile.spaceScore * 0.3);

  return {
    time: profile.timeNotation,
    space: profile.spaceNotation,
    timeScore: profile.timeScore,
    spaceScore: profile.spaceScore,
    totalScore,
    riskLevel: RiskCalculator.scoreToRisk(totalScore),
  };
}

// ============================================================================
// COMPOSE GROWTH
// Clamps and re-evaluates risk.
// Mirrors: composeGrowth() from enhanced-analyzer-v3-paid.ts
// ============================================================================
export function composeGrowth(growth: GrowthProfile): GrowthProfile {
  const totalScore = Math.min(10, Math.max(1, growth.totalScore));
  return {
    ...growth,
    totalScore,
    riskLevel: RiskCalculator.scoreToRisk(totalScore),
  };
}

// ============================================================================
// CONFIDENCE FROM GROWTH
// Higher risk = lower confidence (more heuristic assumptions).
// ============================================================================
export function confidenceFromGrowth(growth: GrowthProfile): number {
  if (growth.totalScore <= 3) return 90;
  if (growth.totalScore <= 6) return 80;
  return 70;
}
