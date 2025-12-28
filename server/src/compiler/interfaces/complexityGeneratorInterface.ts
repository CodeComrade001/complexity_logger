import { fetchUnitPartOfCodeArrayTargets } from "./fetchUnitPartOfCodeProps";

export type TierLevel = "free" | "paid";

export type ComplexityNotation =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n^k)"      // unknown polynomial
  | "O(2^n)"
  | "UNKNOWN";

export type UnitTarget = fetchUnitPartOfCodeArrayTargets;
export type Uppercase_RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Lowercase_RiskLevelType = "low" | "medium" | "high" | "critical";
// Signal collection results from AST traversal
export interface ASTSignals {
  maxLoopDepth: number;
  allocationsInLoop: number;
  hasRecursion: boolean;
  isBinaryRecursion: boolean;
  hasSorting: boolean;
  hasLinearSearch: boolean;
  hasDeepClone: boolean;
  hasAccumulation: boolean;
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
  confidence: number;
}


export interface ComplexityReason {
  type: "time" | "space";
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

  confidence: number; // overall confidence 0-100

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


export interface CalculatorComplexityResult {
  notation: ComplexityNotation;
  confidence: number;        // 0–100
  flags: string[];           // why we think this
}


// ============================================================================
// FREE USER VERSION - Simple, Clear Explanations
// ============================================================================

export const COMPLEXITY_PATTERNS_FREE: Record<string, ComplexityPattern> = {
  "single-loop": {
    time: "O(n)",
    space: "O(1)",
    reason: "One loop through all items",
    category: "loop"
  },

  "nested-loop-2": {
    time: "O(n)",
    space: "O(1)",
    reason: "Loop inside another loop",
    category: "nested"
  },

  "nested-loop-3": {
    time: "O(n)",
    space: "O(1)",
    reason: "Three loops nested together",
    category: "nested"
  },

  "sort": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Efficient sorting algorithms like quicksort",
    category: "builtin"
  },

  "recursion-simple": {
    time: "O(n)",
    space: "O(n)",
    reason: "Function calls itself n times",
    category: "recursion"
  },

  "recursion-binary": {
    time: "O(2^n)",
    space: "O(n)",
    reason: "Function splits into two calls each time",
    category: "recursion"
  },

  "divide-conquer": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Splits problem in half repeatedly",
    category: "recursion"
  },

  "array-allocation-loop": {
    time: "O(n)",
    space: "O(n)",
    reason: "Creating new arrays inside a loop",
    category: "allocation"
  },

  "json-operations": {
    time: "O(n)",
    space: "O(n)",
    reason: "Converting objects to/from JSON strings",
    category: "builtin"
  },

  "array-methods": {
    time: "O(n)",
    space: "O(1)",
    reason: "Processing each array element once",
    category: "builtin"
  },

  "spread-operator": {
    time: "O(n)",
    space: "O(n)",
    reason: "Copying all array/object elements",
    category: "allocation"
  },

  "includes-indexof": {
    time: "O(n)",
    space: "O(1)",
    reason: "Searching through array one item at a time",
    category: "builtin"
  },

  "nested-array-methods": {
    time: "O(n)",
    space: "O(n)",
    reason: "Array method called inside another array method",
    category: "nested"
  },

  "constant": {
    time: "O(1)",
    space: "O(1)",
    reason: "Single operation, no loops or recursion",
    category: "builtin"
  }
};

// ============================================================================
// PAID USER VERSION - Detailed Professional Explanations
// ============================================================================

export const COMPLEXITY_PATTERNS_PAID: Record<string, ComplexityPattern> = {
  "single-loop": {
    time: "O(n)",
    space: "O(1)",
    reason: "Single iteration over n elements with constant auxiliary space. Each element is visited exactly once, performing O(1) operations per iteration. No additional data structures scale with input size, maintaining constant space overhead regardless of n.",
    category: "loop"
  },

  "nested-loop-2": {
    time: "O(n)",
    space: "O(1)",
    reason: "Quadratic time due to dependent nested iterations. Outer loop executes n times; for each outer iteration, inner loop executes n times, yielding n × n = n² total operations. Common in comparison-based algorithms (bubble sort, selection sort) and matrix operations. Space remains constant as no auxiliary structures grow with input.",
    category: "nested"
  },

  "nested-loop-3": {
    time: "O(n)",
    space: "O(1)",
    reason: "Cubic complexity from three-level nesting. Each nesting level multiplies iteration count: n × n × n = n³ operations. Typically seen in naive matrix multiplication, triple-sum problems, or three-way comparisons. Performance degrades rapidly—1000 elements = 1 billion operations. Constant space assumes no auxiliary data structures scale with n.",
    category: "nested"
  },

  "sort": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Optimal comparison-based sorting lower bound proven by decision tree analysis. Modern algorithms (quicksort, mergesort, heapsort) achieve this by dividing input (log n levels) and performing linear work (n) per level. Space complexity O(log n) represents recursion stack depth for in-place variants (quicksort) or O(n) for merge sort's auxiliary arrays. This complexity class represents a sweet spot between linear and quadratic—highly scalable for real-world datasets.",
    category: "builtin"
  },

  "recursion-simple": {
    time: "O(n)",
    space: "O(n)",
    reason: "Linear recursion with depth-first call chain. Each recursive call adds a stack frame containing local variables, return address, and parameters. Maximum call stack depth reaches n before unwinding, consuming O(n) space. Time complexity is linear as each level performs constant work and there are n levels. Risk of stack overflow for large n in languages without tail-call optimization.",
    category: "recursion"
  },

  "recursion-binary": {
    time: "O(2^n)",
    space: "O(n)",
    reason: "Exponential time complexity from binary branching recursion tree (e.g., naive Fibonacci: fib(n) = fib(n-1) + fib(n-2)). Each call spawns two subcalls, creating 2^n nodes in the recursion tree. Space is O(n) because maximum stack depth is n (longest path from root to leaf), despite having exponential nodes total. Critical to recognize and optimize via memoization/dynamic programming to reduce to O(n) time. Unusable for n > 30-40 without optimization.",
    category: "recursion"
  },

  "divide-conquer": {
    time: "O(n log n)",
    space: "O(log n)",
    reason: "Divide-and-conquer recurrence: T(n) = 2T(n/2) + O(n), solved via Master Theorem. Problem splits into two half-sized subproblems (log n levels of recursion) with linear merge work per level (n operations). Total work: n operations × log n levels = O(n log n). Space is O(log n) for recursion stack depth in balanced division. Examples: merge sort, quicksort (average case), efficient tree operations. Highly parallelizable due to independent subproblems.",
    category: "recursion"
  },

  "array-allocation-loop": {
    time: "O(n)",
    space: "O(n)",
    reason: "Dynamic memory allocation within iteration creates accumulating space overhead. If allocating k-sized structure per iteration over n items, space grows to O(nk). Even single allocations per iteration sum to O(n) total allocated memory. Time is O(n) assuming O(1) allocation cost per iteration. Common antipattern: growing arrays inside loops—consider pre-allocating or using data structures with amortized O(1) append. Watch for hidden allocations in string concatenation or intermediate array transformations.",
    category: "allocation"
  },

  "json-operations": {
    time: "O(n)",
    space: "O(n)",
    reason: "JSON serialization/deserialization requires full traversal of object graph. For nested structures with n total nodes (primitives, objects, arrays), both JSON.stringify and JSON.parse visit each node exactly once—O(n) time. Space complexity O(n) accounts for output string (stringify) or reconstructed object (parse). Deep cloning via JSON roundtrip is convenient but expensive: 2n traversals + temporary string storage. Consider structure cloning API or manual deep copy for performance-critical paths.",
    category: "builtin"
  },

  "array-methods": {
    time: "O(n)",
    space: "O(1)",
    reason: "Higher-order array methods (forEach, map, filter, reduce) iterate elements exactly once with callback invoked per element. Time is O(n) assuming O(1) callback cost. Space is O(1) for iteration state (index, accumulator) excluding output arrays. Note: map/filter create new O(n) arrays—account separately. These methods provide functional style with minimal overhead vs manual loops. JIT compilers optimize hot paths effectively. Prefer over manual indexing for readability unless micro-optimizing.",
    category: "builtin"
  },

  "spread-operator": {
    time: "O(n)",
    space: "O(n)",
    reason: "Spread syntax (...arr, ...obj) performs shallow copy, iterating all n elements and allocating new structure. Arrays: copies references/primitives to new memory location—O(n) time and space. Objects: iterates own enumerable properties. Nested spreads inside loops create hidden quadratic behavior: spreading n-element array in n iterations = O(n²). Useful for immutability patterns but expensive in hot paths. Consider Object.assign, Array.prototype.slice, or structural sharing (immutable data structures) for better performance.",
    category: "allocation"
  },

  "includes-indexof": {
    time: "O(n)",
    space: "O(1)",
    reason: "Linear search algorithms checking element membership via sequential comparison. Worst case examines all n elements (element absent or at end). Average case still O(n). No auxiliary space required beyond iteration index—O(1) space. For frequent lookups, convert to Set/Map for O(1) average-case lookups via hashing, trading O(n) initialization cost for repeated O(1) queries. Sorted arrays enable binary search for O(log n) lookup without additional space.",
    category: "builtin"
  },

  "nested-array-methods": {
    time: "O(n)",
    space: "O(n)",
    reason: "Composing array methods creates implicit nested iteration. Pattern: arr.map(x => arr.filter(...)) executes inner O(n) operation for each of n outer iterations—O(n²) time. Common in cartesian products, pairwise comparisons, or nested transformations. Space complexity varies: filter/map create intermediate arrays, potentially O(n) per iteration = O(n²) peak memory. Optimize by: (1) single-pass algorithms, (2) breaking into separate steps with early termination, (3) algorithmic improvements (e.g., hash-based joins vs nested loops). Profile before optimizing—readability often trumps marginal gains.",
    category: "nested"
  },

  "constant": {
    time: "O(1)",
    space: "O(1)",
    reason: "Constant time operations independent of input size: arithmetic, logical operations, array/object access by index/key (amortized for hash tables), variable assignment, conditional checks. Represents baseline efficiency—no scaling concerns. Hash table lookups are amortized O(1) assuming quality hash function and load factor management. Object property access in JavaScript is typically O(1) via hidden classes and inline caching. Be aware: seemingly constant operations may hide linear complexity (string concatenation creates new strings—O(n) in string length).",
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