// ============================================================================
// PAID TIER REASON GENERATOR (Version 2.0 - Production Grade)
// Target: 100% correctness, comprehensive edge case handling
// ============================================================================

import {
  ComplexityProfile,
  SignalProfile,
  ComplexityReason,
  ComplexityNotation,
  Lowercase_RiskLevelType,
} from "../../../interfaces/complexityGeneratorInterface.js";
import { NotationValidator } from "../utils/shared-complexity-utils.js";

// ============================================================================
// REASON RULE SYSTEM - Data-Driven Pattern Matching
// ============================================================================

interface ReasonRule {
  id: string;
  timeNotation?: ComplexityNotation;
  spaceNotation?: ComplexityNotation;
  condition: (profile: ComplexityProfile, signals: SignalProfile) => boolean;
  reason: string;
  impact: Lowercase_RiskLevelType;
  confidence: number;
  priority: number; // Higher = more specific/important
}

export class PaidTierReasonGenerator {
  private static readonly TIME_RULES: ReasonRule[] = [
    // ========================================================================
    // EXPONENTIAL & FACTORIAL (Priority 100+)
    // ========================================================================
    {
      id: "factorial-pattern",
      timeNotation: "O(n!)",
      condition: (p, s) =>
        s.recursion && s.hasLoopInRecursion && s.hasFilterOrSlice,
      reason:
        "Factorial time complexity: recursion generates all permutations/combinations by filtering remaining elements in each recursive call",
      impact: "critical",
      confidence: 90,
      priority: 110,
    },
    {
      id: "binary-recursion-exponential",
      timeNotation: "O(2ⁿ)",
      condition: (p, s) => s.recursionDoubled,
      reason:
        "Exponential growth: each recursive call spawns two more calls, creating a binary tree of computation (e.g., naive Fibonacci)",
      impact: "critical",
      confidence: 92,
      priority: 105,
    },

    // ========================================================================
    // POLYNOMIAL (Priority 80-99)
    // ========================================================================
    {
      id: "cubic-nested-loops",
      timeNotation: "O(n³)",
      condition: (p, s) => s.nestedLoops >= 3 && !s.recursion,
      reason:
        "Cubic time: three nested loops create n × n × n iterations as input grows",
      impact: "critical",
      confidence: 95,
      priority: 95,
    },
    {
      id: "quadratic-nested-loops",
      timeNotation: "O(n²)",
      condition: (p, s) => s.nestedLoops === 2 && !s.recursion,
      reason:
        "Quadratic time: nested loops create n × n iterations as input size grows",
      impact: "high",
      confidence: 95,
      priority: 90,
    },
    {
      id: "quadratic-linear-search-in-loop",
      timeNotation: "O(n²)",
      condition: (p, s) => s.hasLinearSearchInLoop,
      reason:
        "Hidden quadratic complexity: linear search methods (.includes, .indexOf) inside loops create nested iteration",
      impact: "high",
      confidence: 90,
      priority: 92,
    },
    {
      id: "quadratic-nested-array-methods",
      timeNotation: "O(n²)",
      condition: (p, s) => s.hasNestedArrayMethods,
      reason:
        "Nested array method calls: array iteration inside another array iteration callback",
      impact: "high",
      confidence: 88,
      priority: 91,
    },
    {
      id: "quadratic-recursion-with-loop",
      timeNotation: "O(n²)",
      condition: (p, s) => s.recursion && s.hasLoopInRecursion && !s.hasFilterOrSlice,
      reason:
        "Quadratic complexity: each recursive level performs linear iteration",
      impact: "high",
      confidence: 85,
      priority: 89,
    },

    // ========================================================================
    // SUPERLINEAR (Priority 70-79)
    // ========================================================================
    {
      id: "merge-sort-pattern",
      timeNotation: "O(n log n)",
      condition: (p, s) =>
        s.recursion && s.allocations > 0 && (s.hasFilterOrSlice || s.hasSpreadOperator),
      reason:
        "Divide-and-conquer with allocation: recursive problem splitting with array slicing (e.g., merge sort)",
      impact: "medium",
      confidence: 88,
      priority: 78,
    },
    {
      id: "builtin-sorting",
      timeNotation: "O(n log n)",
      condition: (p, s) => s.hasSorting,
      reason:
        "Sorting operation: built-in .sort() uses optimized comparison-based algorithm",
      impact: "medium",
      confidence: 95,
      priority: 75,
    },

    // ========================================================================
    // LINEAR (Priority 50-69)
    // ========================================================================
    {
      id: "simple-recursion",
      timeNotation: "O(n)",
      condition: (p, s) => s.recursion && !s.recursionDoubled && !s.hasLoopInRecursion,
      reason:
        "Linear recursion: single recursive call per frame, depth proportional to input size",
      impact: "medium",
      confidence: 90,
      priority: 65,
    },
    {
      id: "single-loop",
      timeNotation: "O(n)",
      condition: (p, s) => s.loops > 0 && s.nestedLoops === 1 && !s.recursion,
      reason:
        "Linear iteration: single pass through input elements",
      impact: "low",
      confidence: 95,
      priority: 60,
    },
    {
      id: "functional-loops",
      timeNotation: "O(n)",
      condition: (p, s) => s.functionalLoopCount > 0 && s.nestedLoops === 1,
      reason:
        "Functional iteration: .map, .filter, .reduce, or .forEach performs single linear pass",
      impact: "low",
      confidence: 92,
      priority: 62,
    },
    {
      id: "json-operations",
      timeNotation: "O(n)",
      condition: (p, s) => s.hasJSONOperations,
      reason:
        "JSON serialization/parsing: traverses entire object structure linearly",
      impact: "medium",
      confidence: 95,
      priority: 58,
    },

    // ========================================================================
    // LOGARITHMIC (Priority 30-49)
    // ========================================================================
    {
      id: "binary-search-pattern",
      timeNotation: "O(log n)",
      condition: (p, s) =>
        s.loops === 1 &&
        s.conditionals > 0 &&
        (s.hasBreakOrContinue || s.hasEarlyReturn),
      reason:
        "Logarithmic search: repeatedly halves the search space (binary search pattern)",
      impact: "low",
      confidence: 80,
      priority: 45,
    },

    // ========================================================================
    // CONSTANT (Priority 0-29)
    // ========================================================================
    {
      id: "constant-no-loops",
      timeNotation: "O(1)",
      condition: (p, s) => s.isConstantBody && !s.recursion,
      reason:
        "Constant time: fixed number of operations regardless of input size",
      impact: "low",
      confidence: 98,
      priority: 20,
    },
    {
      id: "constant-with-conditionals",
      timeNotation: "O(1)",
      condition: (p, s) =>
        s.isConstantWithReturn || (s.conditionals > 0 && s.loops === 0 && !s.recursion),
      reason:
        "Constant time: branching logic only, no iteration or recursion",
      impact: "low",
      confidence: 95,
      priority: 15,
    },
  ];

  private static readonly SPACE_RULES: ReasonRule[] = [
    // ========================================================================
    // QUADRATIC SPACE (Priority 90+)
    // ========================================================================
    {
      id: "nested-data-structures",
      spaceNotation: "O(n²)",
      condition: (p, s) => s.usesNestedDataStructures,
      reason:
        "Quadratic space: nested data structures (e.g., array of arrays, map of maps) grow with n²",
      impact: "critical",
      confidence: 92,
      priority: 95,
    },
    {
      id: "spread-in-nested-loops",
      spaceNotation: "O(n²)",
      condition: (p, s) => s.hasSpreadOperator && s.nestedLoops >= 2,
      reason:
        "Quadratic memory allocation: spread operator creates copies in nested loop structure",
      impact: "critical",
      confidence: 85,
      priority: 92,
    },

    // ========================================================================
    // LINEAR SPACE (Priority 60-89)
    // ========================================================================
    {
      id: "recursion-stack",
      spaceNotation: "O(n)",
      condition: (p, s) => s.recursion,
      reason:
        "Linear stack space: recursion depth creates call stack frames proportional to input size",
      impact: "medium",
      confidence: 92,
      priority: 85,
    },
    {
      id: "loop-allocations",
      spaceNotation: "O(n)",
      condition: (p, s) => s.loopWithAllocation && s.nestedLoops === 1,
      reason:
        "Linear heap growth: memory allocation inside loop creates n new objects/arrays",
      impact: "medium",
      confidence: 88,
      priority: 80,
    },
    {
      id: "spread-operator-usage",
      spaceNotation: "O(n)",
      condition: (p, s) => s.hasSpreadOperator && s.nestedLoops < 2,
      reason:
        "Linear space: spread operator creates shallow copy of input structure",
      impact: "medium",
      confidence: 90,
      priority: 75,
    },
    {
      id: "json-operations-space",
      spaceNotation: "O(n)",
      condition: (p, s) => s.hasJSONOperations,
      reason:
        "Linear space: JSON operations create full copy of data structure in memory",
      impact: "medium",
      confidence: 95,
      priority: 78,
    },
    {
      id: "data-structure-usage",
      spaceNotation: "O(n)",
      condition: (p, s) => s.usesDataStructures && !s.usesNestedDataStructures,
      reason:
        "Linear auxiliary space: data structure size grows proportionally with input",
      impact: "low",
      confidence: 85,
      priority: 70,
    },

    // ========================================================================
    // CONSTANT SPACE (Priority 0-59)
    // ========================================================================
    {
      id: "constant-no-allocations",
      spaceNotation: "O(1)",
      condition: (p, s) =>
        s.allocations === 0 && !s.recursion && !s.usesDataStructures,
      reason:
        "Constant space: no dynamic memory allocation, fixed variables only",
      impact: "low",
      confidence: 98,
      priority: 50,
    },
    {
      id: "constant-fixed-allocations",
      spaceNotation: "O(1)",
      condition: (p, s) =>
        s.allocations > 0 &&
        !s.loopWithAllocation &&
        !s.recursion &&
        !s.hasSpreadOperator,
      reason:
        "Constant space: fixed-size allocations independent of input size",
      impact: "low",
      confidence: 90,
      priority: 45,
    },
  ];

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Generate comprehensive breakdown of complexity with multiple reasons
   * Uses rule-based system for consistent, explainable results
   */
  static getDetailedBreakdown(
    profile: ComplexityProfile,
    signals: SignalProfile
  ): {
    time: { reasons: string[] };
    space: { reasons: string[] };
  } {
    const timeReasons = this.matchRules(this.TIME_RULES, profile, signals)
      .map((rule) => rule.reason);

    const spaceReasons = this.matchRules(this.SPACE_RULES, profile, signals)
      .map((rule) => rule.reason);

    return {
      time: { reasons: timeReasons.length > 0 ? timeReasons : ["No specific time complexity pattern detected"] },
      space: { reasons: spaceReasons.length > 0 ? spaceReasons : ["No specific space complexity pattern detected"] },
    };
  }

  /**
   * Generate structured ComplexityReason objects for paid tier
   */
  static generateReasons(
    profile: ComplexityProfile,
    signals: SignalProfile
  ): ComplexityReason[] {
    const reasons: ComplexityReason[] = [];

    // Match time complexity rules
    const timeMatches = this.matchRules(this.TIME_RULES, profile, signals);
    for (const rule of timeMatches) {
      NotationValidator.validate(rule.timeNotation!);
      reasons.push({
        type: "time",
        detail: rule.reason,
        impact: rule.impact,
        confidence: rule.confidence,
        pattern: rule.id,
      });
    }

    // Match space complexity rules
    const spaceMatches = this.matchRules(this.SPACE_RULES, profile, signals);
    for (const rule of spaceMatches) {
      NotationValidator.validate(rule.spaceNotation!);
      reasons.push({
        type: "space",
        detail: rule.reason,
        impact: rule.impact,
        confidence: rule.confidence,
        pattern: rule.id,
      });
    }

    return reasons;
  }

  // ========================================================================
  // PRIVATE RULE MATCHING ENGINE
  // ========================================================================

  private static matchRules(
    rules: ReasonRule[],
    profile: ComplexityProfile,
    signals: SignalProfile
  ): ReasonRule[] {
    // Find all matching rules
    const matches = rules.filter((rule) => rule.condition(profile, signals));

    // Sort by priority (highest first)
    matches.sort((a, b) => b.priority - a.priority);

    // Return top matches (limit to 3 most relevant)
    return matches.slice(0, 3);
  }
}
