// ============================================================================
// SHARED INTERFACES - Multi-Language Complexity Analyzer
// Mirrors: complexityGeneratorInterface.ts + interfaces-v2.ts from TS project
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE TYPES
// ─────────────────────────────────────────────────────────────────────────────

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
  | "UNKNOWN";

export type TierLevel = "free" | "paid";
export type Risk = "LOW" | "MEDIUM" | "HIGH";
export type Uppercase_RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Lowercase_RiskLevelType =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type SupportedLanguage =
  | "csharp"
  | "go"
  | "haskell"
  | "java"
  | "kotlin"
  | "python"
  | "rust"
  | "swift"
  | "zig";

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL PROFILE
// Raw counts extracted from a single AST traversal per code unit.
// Every downstream model reads ONLY from this — no re-traversals.
// ─────────────────────────────────────────────────────────────────────────────
export interface SignalProfile {
  // Core loop/iteration signals
  loops: number;
  nestedLoops: number; // maxLoopDepth
  conditionals: number;

  // Recursion signals
  recursion: boolean;
  recursionDoubled: boolean; // binary recursion (fib pattern)
  recursionCallCount: number;

  // Control flow
  hasBreakOrContinue: boolean;
  hasEarlyReturn: boolean;
  conditionDoubled: boolean; // && || in conditions

  // Body shape
  isConstantBody: boolean;
  isConstantWithReturn: boolean;

  // Memory signals
  allocations: number;
  variables: number;
  usesDataStructures: boolean;
  usesNestedDataStructures: boolean;
  loopWithAllocation: boolean;
  recursionWithAllocation: boolean;

  // Advanced pattern signals
  hasLoopInRecursion: boolean;
  hasFilterOrSlice: boolean;
  hasLinearSearchInLoop: boolean;
  hasNestedArrayMethods: boolean; // map inside map, etc.
  hasSorting: boolean;
  hasJSONOperations: boolean;
  hasSpreadOperator: boolean;
  functionalLoopCount: number; // .map .filter .reduce counts

  // Data size hint
  dataSizeHint: "SMALL" | "MEDIUM" | "LARGE";

  // Language-specific signals (avoid casting — store raw)
  languageSpecific: LanguageSpecificSignals;
}

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
  hasListComprehension?: boolean;
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
  hasAsyncAwait?: boolean;

  // Zig
  hasComptime?: boolean;
  hasArenaAllocator?: boolean;
  hasSliceOp?: boolean;
  hasErrorUnion?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLEXITY PROFILE  (derived from SignalProfile)
// ─────────────────────────────────────────────────────────────────────────────
export interface ComplexityProfile {
  timeNotation: ComplexityNotation;
  spaceNotation: ComplexityNotation;
  timeScore: number; // 1–10
  spaceScore: number; // 1–10
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
// COMPLEXITY REASON  (human-readable explanation)
// ─────────────────────────────────────────────────────────────────────────────
export interface ComplexityReason {
  type: "time" | "space" | "unknown";
  detail: string;
  impact: Lowercase_RiskLevelType;
  pattern?: string;
  confidence: number; // 0–100
  lineNumber?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR COMPLEXITY RESULT
// ─────────────────────────────────────────────────────────────────────────────
export interface CalculatorComplexityResult {
  notation: ComplexityNotation;
  confidence: number;
  flags: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE UNIT TYPE  (what we extracted)
// ─────────────────────────────────────────────────────────────────────────────
export type CodeUnitType =
  | "function"
  | "method"
  | "constructor"
  | "lambda"
  | "closure"
  | "arrow"
  | "topLevel"
  | "unknown";

// ─────────────────────────────────────────────────────────────────────────────
// COMPLEXITY RESULT  (per code unit)
// ─────────────────────────────────────────────────────────────────────────────
export interface ComplexityResult {
  id: string;
  kind: CodeUnitType;
  name: string | null;
  startLine: number;
  endLine: number;
  text: string;

  timeComplexity: CalculatorComplexityResult;
  spaceComplexity: CalculatorComplexityResult;

  timeScore: number;
  spaceScore: number;
  totalScore: number;
  riskLevel: Uppercase_RiskLevelType;
  confidence: number;

  reasons: ComplexityReason[];
  matchedKeywords: string[];
  signals: SignalProfile;

  language: SupportedLanguage;
  tierUsed: TierLevel;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS SUMMARY  (per file)
// ─────────────────────────────────────────────────────────────────────────────
export interface AnalysisSummary {
  nameOfFile: string;
  language: SupportedLanguage;
  success: boolean;
  generatedAt: string;
  tierUsed: TierLevel;
  summary: {
    itemsAnalyzed: number;
    totalScore: number;
    avgScore: number;
    avgTimeComplexity: ComplexityNotation;
    avgSpaceComplexity: ComplexityNotation;
    criticalRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
  details: ComplexityResult[];
  errors?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────
export interface AnalysisPayload {
  filePath: string;
  sourceCode: string;
  language: SupportedLanguage;
  tier?: TierLevel;
  functionName?: string | null; // optional filter
}

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHTS  (scoring constants — mirrors original project)
// ─────────────────────────────────────────────────────────────────────────────
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
// REASON RULE  (data-driven pattern matching)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYZER CONTRACT
// Every language module must implement this interface.
// ─────────────────────────────────────────────────────────────────────────────
export interface ILanguageAnalyzer {
  readonly language: SupportedLanguage;
  analyze(payload: AnalysisPayload): Promise<AnalysisSummary>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL EXTRACTOR CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
export interface ISignalExtractor {
  readonly language: SupportedLanguage;
  extract(
    sourceCode: string,
    functionName: string | null
  ): SignalProfile;
}
