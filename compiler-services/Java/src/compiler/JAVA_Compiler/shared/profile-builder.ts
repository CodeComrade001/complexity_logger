// ============================================================================
// COMPLEXITY PROFILE BUILDER
// Faithful port of buildComplexityProfile() from enhanced-analyzer-v3-paid.ts.
// Maps SignalProfile signals → Big-O strings + numeric scores.
// DO NOT modify the decision tree without updating the source module too.
// ============================================================================

import type { ComplexityNotation, ComplexityProfile, SignalProfile } from "./interfaces.js";
import { NotationValidator } from "./complexity-utils.js";

/**
 * TIME scoring ladder  (1 = best → 10 = worst):
 *   O(1)        → 1
 *   O(log n)    → 2
 *   O(n)        → 4
 *   O(n log n)  → 5
 *   O(n²)       → 7
 *   O(n³)       → 8
 *   O(2ⁿ)       → 9
 *   O(n!)       → 10
 *
 * SPACE scoring ladder:
 *   O(1)  → 1
 *   O(n)  → 4
 *   O(n²) → 7
 */
export function buildComplexityProfile(signals: SignalProfile): ComplexityProfile {
  let timeNotation: ComplexityNotation;
  let timeScore: number;

  // ── TIME COMPLEXITY ──────────────────────────────────────────────────────

  if (signals.isConstantWithReturn) {
    timeNotation = "O(1)";
    timeScore = 1;
  } else if (signals.isConstantBody && signals.conditionals > 0) {
    timeNotation = "O(1)";
    timeScore = 1;
  } else if (signals.recursionDoubled) {
    timeNotation = "O(2ⁿ)";
    timeScore = 9;
  } else if (
    signals.recursion &&
    signals.hasLoopInRecursion &&
    signals.hasFilterOrSlice
  ) {
    timeNotation = "O(n!)";
    timeScore = 10;
  } else if (signals.hasLinearSearchInLoop || signals.hasNestedArrayMethods) {
    timeNotation = "O(n²)";
    timeScore = 7;
  } else if (signals.recursion && signals.nestedLoops >= 2) {
    timeNotation = "O(n³)";
    timeScore = 8;
  } else if (signals.recursion && signals.hasLoopInRecursion) {
    timeNotation = "O(n²)";
    timeScore = 7;
  } else if (signals.recursion && signals.allocations > 0) {
    if (signals.hasFilterOrSlice) {
      timeNotation = "O(n log n)";
      timeScore = 5;
    } else {
      timeNotation = "O(n²)";
      timeScore = 7;
    }
  } else if (signals.hasSorting) {
    timeNotation = "O(n log n)";
    timeScore = 5;
  } else if (signals.recursion) {
    timeNotation = "O(n)";
    timeScore = 4;
  } else if (signals.nestedLoops >= 3) {
    timeNotation = "O(n³)";
    timeScore = 8;
  } else if (signals.nestedLoops === 2) {
    timeNotation = "O(n²)";
    timeScore = 7;
  } else if (signals.loops > 0) {
    const likelyLogN =
      signals.conditionals > 0 &&
      (signals.hasBreakOrContinue || signals.hasEarlyReturn) &&
      signals.loops === 1;

    timeNotation = likelyLogN ? "O(log n)" : "O(n)";
    timeScore = likelyLogN ? 2 : 4;
  } else {
    timeNotation = "O(1)";
    timeScore = 1;
  }

  // ── SPACE COMPLEXITY ─────────────────────────────────────────────────────

  let spaceNotation: ComplexityNotation;
  let spaceScore: number;

  if (signals.usesNestedDataStructures) {
    spaceNotation = "O(n²)";
    spaceScore = 7;
  } else if (signals.hasSpreadOperator && signals.loops > 0) {
    spaceNotation = signals.nestedLoops >= 2 ? "O(n²)" : "O(n)";
    spaceScore = signals.nestedLoops >= 2 ? 7 : 4;
  } else if (signals.recursionWithAllocation || signals.loopWithAllocation) {
    spaceNotation = "O(n)";
    spaceScore = 4;
  } else if (signals.recursion) {
    spaceNotation = "O(n)";
    spaceScore = 4;
  } else if (signals.hasJSONOperations) {
    spaceNotation = "O(n)";
    spaceScore = 4;
  } else if (
    signals.allocations > 0 ||
    signals.usesDataStructures ||
    signals.hasSpreadOperator
  ) {
    spaceNotation = "O(1)";
    spaceScore = 2;
  } else {
    spaceNotation = "O(1)";
    spaceScore = 1;
  }

  // Validate both notations (fail-fast)
  NotationValidator.validate(timeNotation);
  NotationValidator.validate(spaceNotation);

  return { timeNotation, spaceNotation, timeScore, spaceScore };
}
