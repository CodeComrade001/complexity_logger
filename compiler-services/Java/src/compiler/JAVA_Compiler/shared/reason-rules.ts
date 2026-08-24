// ============================================================================
// SHARED REASON RULES
// Language-agnostic rule database.
// Mirrors: paid-tier-reason-v3.ts from original TS project.
// Language modules may EXTEND (not replace) these rules with language-specific ones.
// ============================================================================

import {
  ComplexityProfile,
  ComplexityReason,
  Lowercase_RiskLevelType,
  ReasonRule,
  SignalProfile,
} from "./interfaces.js";
import { NotationValidator } from "./shared-utils.js";

// ============================================================================
// TIME COMPLEXITY RULES
// ============================================================================
export const SHARED_TIME_RULES: ReasonRule[] = [
  // ── Factorial ─────────────────────────────────────────────────────────────
  {
    id: "factorial-pattern",
    timeNotation: "O(n!)",
    condition: (_p: any, s: any) => s.recursion && s.hasLoopInRecursion && s.hasFilterOrSlice,
    reason:
      "Factorial time: recursion generates all permutations/combinations by filtering remaining elements in each recursive call",
    impact: "critical",
    confidence: 90,
    priority: 110,
  },

  // ── Exponential ───────────────────────────────────────────────────────────
  {
    id: "binary-recursion-exponential",
    timeNotation: "O(2ⁿ)",
    condition: (_p: any, s: any) => s.recursionDoubled,
    reason:
      "Exponential growth: each recursive call spawns two more, creating a binary computation tree (e.g., naive Fibonacci)",
    impact: "critical",
    confidence: 92,
    priority: 105,
  },

  // ── Cubic ─────────────────────────────────────────────────────────────────
  {
    id: "cubic-nested-loops",
    timeNotation: "O(n³)",
    condition: (_p: any, s: any) => s.nestedLoops >= 3 && !s.recursion,
    reason:
      "Cubic time: three nested loops create n × n × n iterations as input grows",
    impact: "critical",
    confidence: 95,
    priority: 95,
  },

  // ── Quadratic ─────────────────────────────────────────────────────────────
  {
    id: "quadratic-nested-loops",
    timeNotation: "O(n²)",
    condition: (_p: any, s: any) => s.nestedLoops === 2 && !s.recursion,
    reason:
      "Quadratic time: two nested loops produce n × n iterations as input size grows",
    impact: "high",
    confidence: 95,
    priority: 90,
  },
  {
    id: "quadratic-linear-search-in-loop",
    timeNotation: "O(n²)",
    condition: (_p: any, s: any) => s.hasLinearSearchInLoop,
    reason:
      "Hidden quadratic: linear search methods inside a loop create nested iteration",
    impact: "high",
    confidence: 90,
    priority: 92,
  },
  {
    id: "quadratic-nested-array-methods",
    timeNotation: "O(n²)",
    condition: (_p: any, s: any) => s.hasNestedArrayMethods,
    reason:
      "Nested iteration: array method called inside another array iteration callback",
    impact: "high",
    confidence: 88,
    priority: 91,
  },
  {
    id: "quadratic-recursion-with-loop",
    timeNotation: "O(n²)",
    condition: (_p: any, s: any) =>
      s.recursion && s.hasLoopInRecursion && !s.hasFilterOrSlice,
    reason:
      "Quadratic: each recursive level performs a linear pass — O(n) work × O(n) depth",
    impact: "high",
    confidence: 85,
    priority: 89,
  },

  // ── Linearithmic ──────────────────────────────────────────────────────────
  {
    id: "divide-conquer-with-merge",
    timeNotation: "O(n log n)",
    condition: (_p: any, s: any) =>
      s.recursion &&
      s.allocations > 0 &&
      (s.hasFilterOrSlice || s.hasSpreadOperator),
    reason:
      "Divide-and-conquer with allocation: recursive splitting with array slicing (e.g., merge sort)",
    impact: "medium",
    confidence: 88,
    priority: 78,
  },
  {
    id: "builtin-sorting",
    timeNotation: "O(n log n)",
    condition: (_p: any, s: any) => s.hasSorting,
    reason:
      "Sorting operation: comparison-based sort drives O(n log n) complexity",
    impact: "medium",
    confidence: 95,
    priority: 75,
  },

  // ── Linear ────────────────────────────────────────────────────────────────
  {
    id: "simple-recursion",
    timeNotation: "O(n)",
    condition: (_p: any, s: any) =>
      s.recursion && !s.recursionDoubled && !s.hasLoopInRecursion,
    reason:
      "Linear recursion: single call per frame, depth proportional to input",
    impact: "medium",
    confidence: 90,
    priority: 65,
  },
  {
    id: "single-loop",
    timeNotation: "O(n)",
    condition: (_p: any, s: any) =>
      (s.loops > 0 || s.functionalLoopCount > 0) &&
      s.nestedLoops === 1 &&
      !s.recursion,
    reason: "Linear iteration: single pass through input elements",
    impact: "low",
    confidence: 95,
    priority: 60,
  },
  {
    id: "json-linear",
    timeNotation: "O(n)",
    condition: (_p: any, s: any) => s.hasJSONOperations,
    reason:
      "JSON serialization/deserialization traverses the entire structure linearly",
    impact: "medium",
    confidence: 95,
    priority: 58,
  },

  // ── Logarithmic ───────────────────────────────────────────────────────────
  {
    id: "binary-search-pattern",
    timeNotation: "O(log n)",
    condition: (_p: any, s: any) =>
      s.loops === 1 &&
      s.conditionals > 0 &&
      (s.hasBreakOrContinue || s.hasEarlyReturn) &&
      s.functionalLoopCount === 0,
    reason:
      "Logarithmic: loop repeatedly halves the search space (binary search pattern)",
    impact: "low",
    confidence: 80,
    priority: 45,
  },

  // ── Constant ──────────────────────────────────────────────────────────────
  {
    id: "constant-no-loops",
    timeNotation: "O(1)",
    condition: (_p: any, s: any) => s.isConstantBody && !s.recursion,
    reason: "Constant time: fixed operations regardless of input size",
    impact: "low",
    confidence: 98,
    priority: 20,
  },
  {
    id: "constant-with-conditionals",
    timeNotation: "O(1)",
    condition: (_p: any, s: any) =>
      s.isConstantWithReturn ||
      (s.conditionals > 0 && s.loops === 0 && !s.recursion),
    reason:
      "Constant time: branching only, no iteration or recursion",
    impact: "low",
    confidence: 95,
    priority: 15,
  },
];

// ============================================================================
// SPACE COMPLEXITY RULES
// ============================================================================
export const SHARED_SPACE_RULES: ReasonRule[] = [
  {
    id: "nested-data-structures",
    spaceNotation: "O(n²)",
    condition: (_p: any, s: any) => s.usesNestedDataStructures,
    reason:
      "Quadratic space: nested data structures (array-of-arrays, map-of-maps) grow with n²",
    impact: "critical",
    confidence: 92,
    priority: 95,
  },
  {
    id: "spread-in-nested-loops",
    spaceNotation: "O(n²)",
    condition: (_p: any, s: any) => s.hasSpreadOperator && s.nestedLoops >= 2,
    reason:
      "Quadratic allocation: spread/copy operator inside nested loop creates n² copies",
    impact: "critical",
    confidence: 85,
    priority: 92,
  },
  {
    id: "recursion-stack",
    spaceNotation: "O(n)",
    condition: (_p: any, s: any) => s.recursion,
    reason:
      "Linear stack space: recursion depth creates call-stack frames proportional to input",
    impact: "medium",
    confidence: 92,
    priority: 85,
  },
  {
    id: "loop-allocations",
    spaceNotation: "O(n)",
    condition: (_p: any, s: any) => s.loopWithAllocation && s.nestedLoops === 1,
    reason:
      "Linear heap growth: memory allocation inside loop creates n new objects",
    impact: "medium",
    confidence: 88,
    priority: 80,
  },
  {
    id: "spread-operator-usage",
    spaceNotation: "O(n)",
    condition: (_p: any, s: any) => s.hasSpreadOperator && s.nestedLoops < 2,
    reason:
      "Linear space: spread/unpack operator creates a shallow copy of input structure",
    impact: "medium",
    confidence: 90,
    priority: 75,
  },
  {
    id: "json-operations-space",
    spaceNotation: "O(n)",
    condition: (_p: any, s: any) => s.hasJSONOperations,
    reason:
      "Linear space: JSON operations create a full in-memory copy of the data structure",
    impact: "medium",
    confidence: 95,
    priority: 78,
  },
  {
    id: "data-structure-usage",
    spaceNotation: "O(n)",
    condition: (_p: any, s: any) =>
      s.usesDataStructures && !s.usesNestedDataStructures,
    reason:
      "Linear auxiliary space: data structure size grows proportionally with input",
    impact: "low",
    confidence: 85,
    priority: 70,
  },
  {
    id: "constant-no-allocations",
    spaceNotation: "O(1)",
    condition: (_p: any, s: any) =>
      s.allocations === 0 && !s.recursion && !s.usesDataStructures,
    reason:
      "Constant space: no dynamic memory allocation, fixed stack variables only",
    impact: "low",
    confidence: 98,
    priority: 50,
  },
  {
    id: "constant-fixed-allocations",
    spaceNotation: "O(1)",
    condition: (_p: any, s: any) =>
      s.allocations > 0 &&
      !s.loopWithAllocation &&
      !s.recursion &&
      !s.hasSpreadOperator,
    reason:
      "Constant space: allocations are fixed-size and independent of input",
    impact: "low",
    confidence: 90,
    priority: 45,
  },
];

// ============================================================================
// RULE MATCHING ENGINE
// Mirrors: matchRules() from paid-tier-reason-v3.ts
// ============================================================================
export function matchRules(
  rules: ReasonRule[],
  profile: ComplexityProfile,
  signals: SignalProfile,
  limit: number = 3
): ReasonRule[] {
  const matches = rules.filter((r) => r.condition(profile, signals));
  matches.sort((a, b) => b.priority - a.priority);
  return matches.slice(0, limit);
}

// ============================================================================
// REASON GENERATOR
// Converts matched rules → ComplexityReason[]
// ============================================================================
export function generateReasons(
  profile: ComplexityProfile,
  signals: SignalProfile,
  extraTimeRules: ReasonRule[] = [],
  extraSpaceRules: ReasonRule[] = []
): ComplexityReason[] {
  const reasons: ComplexityReason[] = [];

  const allTimeRules = [...extraTimeRules, ...SHARED_TIME_RULES];
  const allSpaceRules = [...extraSpaceRules, ...SHARED_SPACE_RULES];

  const timeMatches = matchRules(allTimeRules, profile, signals);
  for (const rule of timeMatches) {
    if (rule.timeNotation) {
      NotationValidator.validate(rule.timeNotation);
    }
    reasons.push({
      type: "time",
      detail: rule.reason,
      impact: rule.impact as Lowercase_RiskLevelType,
      confidence: rule.confidence,
      pattern: rule.id,
    });
  }

  const spaceMatches = matchRules(allSpaceRules, profile, signals);
  for (const rule of spaceMatches) {
    if (rule.spaceNotation) {
      NotationValidator.validate(rule.spaceNotation);
    }
    reasons.push({
      type: "space",
      detail: rule.reason,
      impact: rule.impact as Lowercase_RiskLevelType,
      confidence: rule.confidence,
      pattern: rule.id,
    });
  }

  return reasons;
}
