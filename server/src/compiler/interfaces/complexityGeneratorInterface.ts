export type TierLevel = "free" | "paid";

export type ComplexityNotation =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n²)"
  | "O(n³)"
  | "O(2^n)"
  | "O(n!)";

export interface ComplexityReason {
  type: "time" | "space";
  pattern: string;
  detail: string;
  impact: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-100
  lineNumber?: number;
  codeSnippet?: string;
}

export interface ComplexityResult {
  id: string;
  kind: "method" | "function" | "arrow";
  name: string | null;
  startLine: number;
  endLine?: number;
  text: string;

  timeComplexity: ComplexityNotation;
  spaceComplexity: ComplexityNotation;

  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  confidence: number; // overall confidence 0-100

  reasons: ComplexityReason[];
  matchedKeywords: string[];

  tierUsed: TierLevel;
}

export interface AnalysisSummary {
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
    arrows: ComplexityResult[];
    functions: ComplexityResult[];
  };
}

// ============================================================================
// COMPLEXITY PATTERN DEFINITIONS
// ============================================================================

export interface ComplexityPattern {
  time: ComplexityNotation;
  space?: ComplexityNotation;
  reason: string;
  category: "loop" | "recursion" | "builtin" | "allocation" | "nested";
}

export const COMPLEXITY_PATTERNS: Record<string, ComplexityPattern> = {
  "single-loop": {
    time: "O(n)",
    space: "O(1)",
    reason: "Single loop iterates through n elements once, performing constant work per iteration",
    category: "loop"
  },

  "nested-loop-2": {
    time: "O(n²)",
    space: "O(1)",
    reason: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations",
    category: "nested"
  },

  "nested-loop-3": {
    time: "O(n³)",
    space: "O(1)",
    reason: "Triple nested loop: each level multiplies the iteration count, resulting in n × n × n = n³ operations",
    category: "nested"
  },

  "sort": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Comparison-based sorting algorithms (like quicksort, mergesort) have a theoretical lower bound of O(n log n) time complexity",
    category: "builtin"
  },

  "recursion-simple": {
    time: "O(n)",
    space: "O(n)",
    reason: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space",
    category: "recursion"
  },

  "recursion-binary": {
    time: "O(2^n)",
    space: "O(n)",
    reason: "Binary recursion (like naive fibonacci) branches twice per call, creating exponential time complexity 2^n, with stack depth of n",
    category: "recursion"
  },

  "divide-conquer": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Divide and conquer approach (binary search pattern) divides problem size by 2 each step, resulting in O(log n) divisions with O(n) work per level",
    category: "recursion"
  },

  "array-allocation-loop": {
    time: "O(n)",
    space: "O(n)",
    reason: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size",
    category: "allocation"
  },

  "json-operations": {
    time: "O(n)",
    space: "O(n)",
    reason: "JSON.parse/stringify operations traverse entire object structure, creating both time and space overhead proportional to data size",
    category: "builtin"
  },

  "array-methods": {
    time: "O(n)",
    space: "O(1)",
    reason: "Array iteration methods (forEach, map, filter) process each element once, resulting in linear time complexity",
    category: "builtin"
  },

  "spread-operator": {
    time: "O(n)",
    space: "O(n)",
    reason: "Spread operator creates a shallow copy of the entire array/object, requiring both time and space proportional to size",
    category: "allocation"
  },

  "includes-indexof": {
    time: "O(n)",
    space: "O(1)",
    reason: "Array.includes() and indexOf() perform linear search through array elements, checking each one sequentially",
    category: "builtin"
  },

  "nested-array-methods": {
    time: "O(n²)",
    space: "O(n)",
    reason: "Calling array methods inside other array methods (e.g., map inside map) creates nested iterations, multiplying complexity",
    category: "nested"
  },

  "constant": {
    time: "O(1)",
    space: "O(1)",
    reason: "Direct variable access, arithmetic operations, or simple assignments execute in constant time",
    category: "builtin"
  }
};

// ============================================================================
// ENHANCED WEIGHTS FOR SCORING
// ============================================================================

export const WEIGHTS = {
  // Time complexity weights
  LOOP: 5,
  NESTED_LOOP_FACTOR: 8, // multiplied by nesting depth
  CALL_IN_LOOP: 6,
  RECURSION: 15,
  BINARY_RECURSION: 30, // exponential complexity
  ASYNC_AWAIT: 3,
  HIGH_COST_BUILTIN: 8,
  ARRAY_METHOD: 4,
  SORT: 10,
  SEARCH_LINEAR: 5,

  // Space complexity weights
  ALLOCATION: 4,
  SPREAD: 5,
  PUSH_IN_LOOP: 6,
  DEEP_CLONE: 8,
  RECURSION_SPACE: 10,
  ACCUMULATOR: 5,

  // General
  KEYWORD_HIT: 1,
  BRANCH: 1
};

export const RISK_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 100
};