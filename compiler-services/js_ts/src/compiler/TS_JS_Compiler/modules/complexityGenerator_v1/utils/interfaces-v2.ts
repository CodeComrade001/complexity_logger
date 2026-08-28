// ============================================================================
// UPDATED INTERFACES (Version 2.0)
// Added: UNKNOWN to ComplexityNotation, new signal properties
// ============================================================================

import { SyntaxKind } from "ts-morph";
import { fetchUnitPartOfCodeArrayTargets } from "../../../interfaces/fetchUnitPartOfCodeProps.js";

export type TierLevel = "free" | "paid";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

// ============================================================================
// COMPLEXITY NOTATION - UPDATED TO INCLUDE UNKNOWN
// ============================================================================
export type ComplexityNotation =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n²)"
  | "O(n³)"
  | "O(n^k)"
  | "O(2^n)"
  | "O(2ⁿ)"
  | "O(n!)"
  | "O(sqrt n)"
  | "UNKNOWN";  // <--- ADDED: For cases where complexity cannot be determined

// ============================================================================
// SIGNAL PROFILE - Raw counts from AST/regex analysis
// ============================================================================
export interface SignalProfile {
  // Core loop/recursion signals
  loops: number;
  nestedLoops: number;
  conditionals: number;
  recursion: boolean;
  recursionDoubled: boolean;
  hasBreakOrContinue: boolean;
  hasEarlyReturn: boolean;
  conditionDoubled: boolean;
  isConstantBody: boolean;
  isConstantWithReturn: boolean;

  // Memory allocation signals
  allocations: number;
  variables: number;
  usesDataStructures: boolean;
  usesNestedDataStructures: boolean;
  loopWithAllocation: boolean;
  recursionWithAllocation: boolean;

  // Advanced pattern signals
  hasLoopInRecursion: boolean;
  hasFilterOrSlice: boolean;
  dataSizeHint: "SMALL" | "MEDIUM" | "LARGE";

  // NEW: Enhanced regex-based signals
  hasLinearSearchInLoop: boolean;
  hasNestedArrayMethods: boolean;
  hasSorting: boolean;
  hasJSONOperations: boolean;
  hasSpreadOperator: boolean;
  functionalLoopCount: number;
}

// ============================================================================
// OTHER TYPES
// ============================================================================
export interface ComplexityProfile {
  timeNotation: ComplexityNotation;
  spaceNotation: ComplexityNotation;
  timeScore: number;      // 1-10
  spaceScore: number;     // 1-10
}

export interface GrowthProfile {
  time: ComplexityNotation;
  space: ComplexityNotation;
  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: Risk;
}

export const LOOP_KINDS = new Set([
  SyntaxKind.ForStatement,
  SyntaxKind.ForOfStatement,
  SyntaxKind.ForInStatement,
  SyntaxKind.WhileStatement,
  SyntaxKind.DoStatement,
]);

export const ALLOCATION_CONSTRUCTOR_NAMES = new Set([
  "Array", "Map", "Set", "WeakMap", "WeakSet", "Object", "Buffer",
]);

export type UnitTarget = fetchUnitPartOfCodeArrayTargets;
export type Uppercase_RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Lowercase_RiskLevelType = "low" | "medium" | "high" | "critical" | "unknown";

export interface ComplexityReason {
  type: "time" | "space" | "unknown";
  detail: string;
  impact: Lowercase_RiskLevelType;
  pattern?: string;
  confidence: number; // 0-100
  lineNumber?: number;
}

export interface ComplexityResult {
  id: string;
  kind: fetchUnitPartOfCodeArrayTargets;
  name: string | null;
  startLine: number;
  endLine?: number;
  text: string;

  timeComplexity: CalculatorComplexityResult;
  spaceComplexity: CalculatorComplexityResult;

  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: Uppercase_RiskLevelType;

  confidence?: number;

  reasons: ComplexityReason[];
  matchedKeywords: string[];

  tierUsed: TierLevel;
}

export interface CalculatorComplexityResult {
  notation: ComplexityNotation;
  confidence: number;
  flags: string[];
}

export interface AnalysisSummary {
  nameOfFile: string;
  success: boolean;
  generatedAt: string;
  tierUsed: TierLevel;
  summary: {
    itemsAnalyzed: number;
    totalScore: number;
    avgScore: number;
    avgTimeComplexity: string;
    avgSpaceComplexity: string;
    criticalRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
  details: {
    methods: ComplexityResult[];
    functions: ComplexityResult[];
    arrows: ComplexityResult[];
    constructors: ComplexityResult[];
    getters: ComplexityResult[];
    setters: ComplexityResult[];
    callbacks: ComplexityResult[];
    handlers: ComplexityResult[];
    staticBlocks: ComplexityResult[];
    topLevelStatements: ComplexityResult[];
  };
}

// Weights and thresholds
export const WEIGHTS = {
  LOOP: 5,
  NESTED_LOOP_FACTOR: 8,
  CALL_IN_LOOP: 6,
  RECURSION: 15,
  BINARY_RECURSION: 30,
  ASYNC_AWAIT: 2,
  HIGH_COST_BUILTIN: 8,
  ARRAY_METHOD: 4,
  SORT: 10,
  SEARCH_LINEAR: 5,
  ALLOCATION: 4,
  SPREAD: 5,
  PUSH_IN_LOOP: 6,
  DEEP_CLONE: 8,
  RECURSION_SPACE: 10,
  ACCUMULATOR: 5,
  KEYWORD_HIT: 1,
  BRANCH: 1
};

export const RISK_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 100
};

// Complexity patterns for free tier
export interface ComplexityPattern {
  time: ComplexityNotation;
  space: ComplexityNotation;
  reason: string;
  category: "loop" | "recursion" | "builtin" | "allocation" | "nested" | "unclassified";
}

export const COMPLEXITY_PATTERNS_FREE: Record<string, ComplexityPattern> = {
  "constant": {
    time: "O(1)",
    space: "O(1)",
    reason: "Single operation regardless of input size",
    category: "builtin"
  },
  "single-loop": {
    time: "O(n)",
    space: "O(1)",
    reason: "One pass through all items",
    category: "loop"
  },
  "nested-loop-2": {
    time: "O(n²)",
    space: "O(1)",
    reason: "Standard nested loop (quadratic growth)",
    category: "nested"
  },
  "nested-loop-3": {
    time: "O(n³)",
    space: "O(1)",
    reason: "Three levels of nesting detected",
    category: "nested"
  },
  "many-loops": {
    time: "O(n^k)",
    space: "O(1)",
    reason: "Deeply nested or excessive loop structures (O(n⁴) or higher)",
    category: "unclassified"
  },
  "hash-lookup": {
    time: "O(1)",
    space: "O(1)",
    reason: "Map/Set/Object property access is constant time",
    category: "builtin"
  },
  "binary-search": {
    time: "O(log n)",
    space: "O(1)",
    reason: "Logarithmic search pattern detected (halving search space)",
    category: "builtin"
  },
  "sort": {
    time: "O(n log n)",
    space: "O(n)",
    reason: "Standard sorting algorithm performance",
    category: "builtin"
  },
  "includes-indexof": {
    time: "O(n)",
    space: "O(1)",
    reason: "Linear search requires checking elements one by one",
    category: "builtin"
  },
  "loop-with-includes": {
    time: "O(n²)",
    space: "O(1)",
    reason: "Linear search (.includes/.indexOf) inside a loop creates quadratic time",
    category: "nested"
  },
  "array-methods": {
    time: "O(n)",
    space: "O(1)",
    reason: "Single pass functional iteration (forEach/map/filter)",
    category: "builtin"
  },
  "nested-array-methods": {
    time: "O(n²)",
    space: "O(n)",
    reason: "Array method called inside the callback of another array method",
    category: "nested"
  },
  "recursion-simple": {
    time: "O(n)",
    space: "O(n)",
    reason: "Linear recursion depth consumes stack space",
    category: "recursion"
  },
  "recursion-binary": {
    time: "O(2^n)",
    space: "O(n)",
    reason: "Exponential growth (tree recursion) with linear stack depth",
    category: "recursion"
  },
  "divide-conquer": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Recursive problem splitting (e.g., merge/quick sort)",
    category: "recursion"
  },
  "spread-operator": {
    time: "O(n)",
    space: "O(n)",
    reason: "Shallow copy creates new allocations proportional to input size",
    category: "allocation"
  },
  "array-allocation-loop": {
    time: "O(n²)",
    space: "O(n)",
    reason: "Repeated memory allocation inside a loop structure",
    category: "allocation"
  },
  "json-operations": {
    time: "O(n)",
    space: "O(n)",
    reason: "JSON operations traverse and copy entire data structure",
    category: "builtin"
  }
};
