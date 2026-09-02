export interface CompilerPayload {
  event: string;
  jobId: string;
  language: string;
  files: compilerPayloadFiles[];
}

interface compilerPayloadFiles {
  name: string;
  language: string;
  content: string;
}

export interface CompilerResult {
  success: boolean;
  fileName: string;
  result?: unknown;
  error?: string;
}

export interface Compiler {
  execute(
    sourceCode: string,
    fileName: string
  ): Promise<unknown>;
}

// ============================================================================
// SHARED INTERFACES
// Ported from interfaces-v2.ts — ts-morph dependency removed.
// LOOP_KINDS and ALLOCATION_CONSTRUCTOR_NAMES moved to per-language configs.
// ============================================================================

export type TierLevel = "free" | "paid";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

// ============================================================================
// COMPLEXITY NOTATION
// ============================================================================
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

// ============================================================================
// SIGNAL PROFILE — Raw counts from AST + regex analysis.
// Every downstream model reads only from this — no re-traversals.
// ============================================================================
export interface SignalProfile {
  // Core loop / recursion signals
  loops: number;
  nestedLoops: number;           // max loop nesting depth (maxLoopDepth)
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

  // Regex-based signals
  hasLinearSearchInLoop: boolean;
  hasNestedArrayMethods: boolean;
  recursionCallCount: number;
  hasSorting: boolean;
  hasJSONOperations: boolean;
  hasSpreadOperator: boolean;
  functionalLoopCount: number;

  // Language-specific signals (avoid casting — store raw)
  languageSpecific: LanguageSpecificSignals;
}

// ============================================================================
// COMPLEXITY PROFILE  (derived from SignalProfile)
// ============================================================================
export interface ComplexityProfile {
  timeNotation: ComplexityNotation;
  spaceNotation: ComplexityNotation;
  timeScore: number;    // 1-10
  spaceScore: number;   // 1-10
}

// ============================================================================
// GROWTH PROFILE  (with risk)
// ============================================================================
export interface GrowthProfile {
  time: ComplexityNotation;
  space: ComplexityNotation;
  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: Risk;
}

// ============================================================================
// RESULT TYPES
// ============================================================================
export type fetchUnitPartOfCodeArrayTargets =
  | "functions"
  | "arrows"
  | "methods"
  | "constructors"
  | "getters"
  | "setters"
  | "callbacks"
  | "handlers"
  | "staticBlocks"
  | "topLevelStatements";

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

export interface CalculatorComplexityResult {
  notation: ComplexityNotation;
  confidence: number;
  flags: string[];
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
// WEIGHTS  (unchanged from source)
// ============================================================================
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
  BRANCH: 1,
} as const;

export const RISK_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE-SPECIFIC SIGNAL EXTENSIONS
// Each language gets its own typed bucket.
// ─────────────────────────────────────────────────────────────────────────────
export interface LanguageSpecificSignals {
  // C#
  hasLinqQuery?: boolean;
  hasAsyncAwait?: boolean;
  hasParallelOperations?: boolean;

  // Go
  hasGoroutine?: boolean;
  hasChannel?: boolean;
  hasDefer?: boolean;
  hasSliceOperation?: boolean;

  // Haskell
  hasLazyEvaluation?: boolean;
  hasListComprehension?: boolean;
  hasFoldOperation?: boolean;
  hasPatternMatch?: boolean;
  hasGuards?: boolean;
  hasWhereClause?: boolean;
  hasInfiniteList?: boolean;

  // Java
  hasStreamOperation?: boolean;
  hasCollectionOperation?: boolean;
  hasReflection?: boolean;
  hasGenericBounds?: boolean;

  // Kotlin
  hasCoroutine?: boolean;
  hasSequence?: boolean;
  hasExtensionFunction?: boolean;
  hasDataClass?: boolean;

  // Python
  hasGeneratorExpression?: boolean;
  hasDecorator?: boolean;
  hasAsyncFor?: boolean;
  hasDunderMethod?: boolean;

  // Rust
  hasIteratorChain?: boolean;
  hasBoxAllocation?: boolean;
  hasUnsafeBlock?: boolean;
  hasLifetimeAnnotation?: boolean;
  hasCollect?: boolean;
  hasClone?: boolean;
  hasArcMutex?: boolean;

  // Swift
  hasOptionalChain?: boolean;
  hasClosure?: boolean;
  hasHigherOrderFunction?: boolean;
  hasProtocolConformance?: boolean;

  // Zig
  hasComptime?: boolean;
  hasArenaAllocator?: boolean;
  hasSliceOp?: boolean;
  hasErrorUnion?: boolean;
}

export interface ReasonRule {
  id: string;
  timeNotation?: ComplexityNotation;
  spaceNotation?: ComplexityNotation;
  condition: (profile: ComplexityProfile, signals: SignalProfile) => boolean;
  reason: string;
  impact: Lowercase_RiskLevelType;
  confidence: number;
  priority: number;
}