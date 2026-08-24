import { SyntaxKind } from "ts-morph";
import { fetchUnitPartOfCodeArrayTargets } from "./fetchUnitPartOfCodeProps.js";

export type TierLevel = "free" | "paid";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL PROFILE
// Raw counts extracted from a single AST traversal.
// Every downstream model reads only from this — no re-traversals.
// ─────────────────────────────────────────────────────────────────────────────
// In: interfaces/complexityGeneratorInterface.ts

export interface SignalProfile {
  // ==================== EXISTING PROPERTIES ====================
  loops: number;
  nestedLoops: number;
  conditionals: number;
  recursion: boolean;
  recursionDoubled: boolean;
  hasBreakOrContinue: boolean;
  hasEarlyReturn: boolean;               // ← Added in previous update
  conditionDoubled: boolean;
  isConstantBody: boolean;
  isConstantWithReturn: boolean;
  allocations: number;
  variables: number;
  usesDataStructures: boolean;
  usesNestedDataStructures: boolean;
  loopWithAllocation: boolean;
  recursionWithAllocation: boolean;
  hasLoopInRecursion: boolean;           // ← Added in previous update
  hasFilterOrSlice: boolean;             // ← Added in previous update
  dataSizeHint: "SMALL" | "MEDIUM" | "LARGE";

  // ==================== NEW PROPERTIES (ADD THESE) ====================
  hasLinearSearchInLoop: boolean;        // NEW: .includes/.indexOf in loops
  hasNestedArrayMethods: boolean;        // NEW: nested array method chains
  hasSorting: boolean;                   // NEW: .sort() detection
  hasJSONOperations: boolean;            // NEW: JSON.parse/stringify
  hasSpreadOperator: boolean;            // NEW: spread operator usage
  functionalLoopCount: number;           // NEW: count of functional loops
}
// ─────────────────────────────────────────────────────────────────────────────
// COMPLEXITY PROFILE  (derived from SignalProfile)
// ─────────────────────────────────────────────────────────────────────────────
export interface ComplexityProfile {
  timeNotation: ComplexityNotation;   // Big-O string  e.g. "O(n²)"
  spaceNotation: ComplexityNotation;
  timeScore: number;      // 1-10 severity score
  spaceScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GROWTH PROFILE  (with risk)
// ─────────────────────────────────────────────────────────────────────────────
export interface GrowthProfile {
  time: ComplexityNotation;
  space: ComplexityNotation;
  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: Risk;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOP STATEMENT KINDS  (used in traversal)
// ─────────────────────────────────────────────────────────────────────────────
export const LOOP_KINDS = new Set([
  SyntaxKind.ForStatement,
  SyntaxKind.ForOfStatement,
  SyntaxKind.ForInStatement,
  SyntaxKind.WhileStatement,
  SyntaxKind.DoStatement,
]);

// ─────────────────────────────────────────────────────────────────────────────
// ALLOCATION KINDS  (new X, [], {}, Array(), Map(), Set() calls)
// ─────────────────────────────────────────────────────────────────────────────
export const ALLOCATION_CONSTRUCTOR_NAMES = new Set([
  "Array", "Map", "Set", "WeakMap", "WeakSet", "Object", "Buffer",
]);


export type ComplexityNotation =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n!)"
  | "O(n log n)"
  | "O(n²)"
  | "O(n³)"
  | "O(n^k)"
  | "O(2^n)"
  | "O(2ⁿ)"
  | "O(n!)"      // <--- ADD THIS
  | "O(sqrt n)"  // <--- OPTIONAL BUT PRO
  | "UNKNOWN";


export type UnitTarget = fetchUnitPartOfCodeArrayTargets;
export type Uppercase_RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Lowercase_RiskLevelType = "low" | "medium" | "high" | "critical" | "unknown";
// Signal collection results from AST traversal
export interface ASTSignals {
  /** * Signals O(n^x) where x = depth. 
   * Detected by: Counting nested 'ForStatement', 'WhileStatement', or '.forEach' calls.
   */
  maxLoopDepth: number;

  /** * Signals O(n) or O(n²) Space. 
   * Detected by: 'ArrayExpression' ([]) or 'new Array()' inside a loop block.
   */
  allocationsInLoop: number;

  /** * Signals O(n) or O(2^n) Time/Space. 
   * Detected by: A 'FunctionDeclaration' identifier appearing within its own 'BlockStatement'.
   */
  hasRecursion: boolean;

  /** * Signals O(2^n) Exponential growth. 
   * Detected by: Two or more recursive calls within the same return statement (e.g., fib(n-1) + fib(n-2)).
   */
  isBinaryRecursion: boolean;

  /** * Signals O(n log n) Time. 
   * Detected by: Calls to '.sort()' or implementations of Merge/Quick sort patterns.
   */
  hasSorting: boolean;

  /** * Signals O(n) Time. 
   * Detected by: '.find()', '.indexOf()', '.includes()', or a loop with an 'if (arr[i] === target)'.
   */
  hasLinearSearch: boolean;

  /** * Signals O(n) Space and Time (Hidden). 
   * Detected by: 'JSON.parse(JSON.stringify())' or structuredClone().
   */
  hasDeepClone: boolean;

  /** * Signals O(n) Time. 
   * Detected by: += operators inside loops or '.reduce()' calls.
   */
  hasAccumulation: boolean;

  /** * Raw metadata for debugging. 
   * Stores specific strings like "push", "slice", "splice", "concat".
   */
  matchedKeywords: string[];
}

// Scoring results from signal analysis
export interface ComplexityScores {
  timeScore: number;
  spaceScore: number;
  totalScore: number;
}

// Classification results
export interface ComplexityClassification {
  timeComplexity: CalculatorComplexityResult;
  spaceComplexity: CalculatorComplexityResult;
  riskLevel: Uppercase_RiskLevelType;
  confidence: number
}


export interface ComplexityReason {
  type: "time" | "space" | "unknown";
  detail: string;
  impact: Lowercase_RiskLevelType;
  pattern?: string;
  confidence: number; // 0-100
  lineNumber?: number;
}

export interface PaidComplexityReason {
  type: "time" | "space" | "unknown";
  timeComplexity: ComplexityNotation;
  spaceComplexity: ComplexityNotation;
  pattern: string;
  detail: string;
  impact: Lowercase_RiskLevelType;
  confidence: number; // 0-100
  lineNumber?: number;
  codeSnippet?: string;
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

  confidence?: number; // overall confidence 0-100

  reasons: ComplexityReason[];
  matchedKeywords: string[];

  tierUsed: TierLevel;
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

// ============================================================================
// COMPLEXITY PATTERN DEFINITIONS
// ============================================================================

export interface ComplexityPattern {
  time: ComplexityNotation;
  space: ComplexityNotation;
  reason: string;
  category: "loop" | "recursion" | "builtin" | "allocation" | "nested" | "unclassified";
}

export interface PaidComplexityPattern {
  time: ComplexityNotation;
  space: ComplexityNotation;
  category: "loop" | "recursion" | "builtin" | "allocation" | "nested" | "unclassified";
}

export interface CalculatorComplexityResult {
  notation: ComplexityNotation;
  confidence: number;        // 0–100
  flags: string[];           // why we think this
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
    // Investor Tip: Don't use UNKNOWN. O(n^k) looks smarter.
    // Represents O(n^4), O(n^5), etc.
    time: "O(n^k)",
    space: "O(1)",
    reason: "Deeply nested or excessive loop structures (O(n⁴) or higher)",
    category: "unclassified"
  },

  "hash-lookup": {
    time: "O(1)",
    // Senior Dev Fix: A lookup is O(1) space. The Map itself is O(n), 
    // but the logic of 'looking up' doesn't grow memory.
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
    space: "O(n)", // Conservative O(n) for JS Array.sort() overhead
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
    // Senior Dev Fix: Clarified that this refers to NESTING, not chaining.
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
    time: "O(n²)", // Senior Dev Fix: Allocation + Loop is often O(n^2) for the engine
    space: "O(n)",
    reason: "Repeated memory allocation inside a loop structure",
    category: "allocation"
  }
};


// ============================================================================
// PAID USER VERSION - Detailed Professional Explanations
// ============================================================================
// export const COMPLEXITY_PATTERNS_PAID: Record<string, PaidComplexityPattern> = {
//   "single-loop": {
//     time: "O(n)",
//     space: "O(1)",
//     category: "loop"
//   },

//   "nested-loop-2": {
//     time: "O(n²)",  // FIXED
//     space: "O(1)",
//     category: "nested"
//   },

//   "nested-loop-3": {
//     time: "O(n³)",  // FIXED
//     space: "O(1)",
//     category: "nested"
//   },
//   "many-loops": {
//     time: "UNKNOWN",  // FIXED
//     space: "UNKNOWN",
//     category: "unclassified"
//   },

//   "sort": {
//     time: "O(n log n)",
//     space: "O(log n)",
//     category: "builtin"
//   },

//   "recursion-simple": {
//     time: "O(n)",
//     space: "O(n)",
//     category: "recursion"
//   },

//   "recursion-binary": {
//     time: "O(2^n)",
//     space: "O(n)",
//     category: "recursion"
//   },

//   "divide-conquer": {
//     time: "O(n log n)",
//     space: "O(log n)",
//     category: "recursion"
//   },

//   "array-allocation-loop": {
//     time: "O(n)",
//     space: "O(n)",
//     category: "allocation"
//   },

//   "json-operations": {
//     time: "O(n)",
//     space: "O(n)",
//     category: "builtin"
//   },

//   "array-methods": {
//     time: "O(n)",
//     space: "O(1)",
//     category: "builtin"
//   },

//   "spread-operator": {
//     time: "O(n)",
//     space: "O(n)",
//     category: "allocation"
//   },

//   "includes-indexof": {
//     time: "O(n)",
//     space: "O(1)",
//     category: "builtin"
//   },

//   "nested-array-methods": {
//     time: "O(n²)",  // FIXED
//     space: "O(n²)",  // FIXED - can create intermediate arrays
//     category: "nested"
//   },

//   "constant": {
//     time: "O(1)",
//     space: "O(1)",
//     category: "builtin"
//   },

//   "hash-lookup": {
//     time: "O(1)",
//     space: "O(n)",
//     category: "builtin"
//   },

//   "binary-search": {
//     time: "O(log n)",
//     space: "O(1)",
//     category: "builtin"
//   },

//   "loop-with-includes": {
//     time: "O(n²)",
//     space: "O(1)",
//     category: "nested"
//   }
// };

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
  ASYNC_AWAIT: 2,
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
