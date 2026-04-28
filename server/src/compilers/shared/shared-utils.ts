// ============================================================================
// SHARED UTILITIES - Multi-Language Complexity Analyzer
// Mirrors: shared-complexity-utils.ts from TS project
// Used by: ALL language modules (free + paid tiers)
// ============================================================================

import {
  ComplexityNotation,
  ComplexityReason,
  SignalProfile,
  Uppercase_RiskLevelType,
  RISK_THRESHOLDS,
} from "./interfaces.js";

// ============================================================================
// LOOP DEPTH ANALYZER
// Eliminates DRY violation — one implementation for all languages.
// Language-specific loop keywords are injected via parameter.
// ============================================================================
export class LoopDepthAnalyzer {
  /**
   * Estimates loop nesting depth using line-by-line regex analysis.
   *
   * Strategy:
   * 1. Sanitize each line (remove comments + strings)
   * 2. Detect loop keywords (language-specific via param)
   * 3. Maintain a brace stack that tracks loop vs non-loop blocks
   * 4. Return maximum depth reached
   *
   * @param text           - Full source text of the code unit
   * @param loopKeywords   - Language-specific loop keyword list
   * @param commentPattern - Single-line comment prefix (e.g. "//", "#", "--")
   * @param braceStyle     - "curly" | "indent" | "do-end"
   */
  static estimateLoopNestingDepth(
    text: string,
    loopKeywords: string[] = ["for", "while", "do", "forEach", "map", "filter", "reduce"],
    commentPattern: string = "//",
    braceStyle: "curly" | "indent" = "curly"
  ): number {
    if (braceStyle === "indent") {
      return this.estimateIndentNestingDepth(text, loopKeywords);
    }

    let maxDepth = 0;
    let currentDepth = 0;
    const blockStack: boolean[] = []; // true = loop block

    const lines = text.split("\n");

    for (let line of lines) {
      line = this.sanitizeLine(line, commentPattern);

      const loopPattern = new RegExp(
        `\\b(${loopKeywords.join("|")})\\b`,
        "g"
      );
      const loopMatches = line.match(loopPattern) || [];
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      // Push loop block markers
      for (let i = 0; i < loopMatches.length; i++) {
        blockStack.push(true);
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      // Push non-loop block markers for extra braces
      const nonLoopBlocks = Math.max(0, openBraces - loopMatches.length);
      for (let i = 0; i < nonLoopBlocks; i++) {
        blockStack.push(false);
      }

      // Close blocks
      for (let i = 0; i < closeBraces; i++) {
        const isLoopBlock = blockStack.pop();
        if (isLoopBlock) {
          currentDepth = Math.max(0, currentDepth - 1);
        }
      }
    }

    return maxDepth;
  }

  /**
   * Indent-based nesting depth (Python, Haskell-style)
   * Tracks indentation levels where loop keywords appear.
   */
  static estimateIndentNestingDepth(
    text: string,
    loopKeywords: string[]
  ): number {
    let maxDepth = 0;
    const loopIndentStack: number[] = [];

    const lines = text.split("\n");
    const loopPattern = new RegExp(`^\\s*(${loopKeywords.join("|")})\\b`);

    for (const line of lines) {
      if (!line.trim()) continue;

      const indent = line.length - line.trimStart().length;

      // Pop loop stack entries with deeper indentation (dedent)
      while (
        loopIndentStack.length > 0 &&
        loopIndentStack[loopIndentStack.length - 1] >= indent
      ) {
        loopIndentStack.pop();
      }

      if (loopPattern.test(line)) {
        loopIndentStack.push(indent);
        maxDepth = Math.max(maxDepth, loopIndentStack.length);
      }
    }

    return maxDepth;
  }

  /**
   * Remove comments and string literals from a single line
   * to avoid false-positive keyword matches.
   */
  static sanitizeLine(line: string, commentPrefix: string = "//"): string {
    // Remove single-line comments
    const commentIdx = line.indexOf(commentPrefix);
    if (commentIdx >= 0) {
      line = line.substring(0, commentIdx);
    }

    // Remove double-quoted strings
    line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    // Remove single-quoted strings
    line = line.replace(/'(?:[^'\\]|\\.)*'/g, "''");
    // Remove backtick strings
    line = line.replace(/`(?:[^`\\]|\\.)*`/g, "``");

    return line;
  }

  /**
   * Detect functional loop patterns (map/filter/reduce chains).
   * Language-configurable via the functionalPatterns param.
   */
  static countFunctionalLoops(
    text: string,
    functionalPatterns: string[] = ["forEach", "map", "filter", "reduce", "flatMap"]
  ): number {
    const pattern = new RegExp(
      `\\.(?:${functionalPatterns.join("|")})\\s*[\\(\\{]`,
      "g"
    );
    return (text.match(pattern) || []).length;
  }

  /**
   * Detect linear search patterns (includes, indexOf, find, etc.)
   */
  static hasLinearSearchMethod(
    text: string,
    searchMethods: string[] = ["includes", "indexOf", "find", "findIndex", "contains", "search"]
  ): boolean {
    const pattern = new RegExp(
      `\\.(?:${searchMethods.join("|")})\\s*\\(`,
      "g"
    );
    return pattern.test(text);
  }
}

// ============================================================================
// CONFIDENCE STRATEGY
// Mirrors: ConfidenceStrategy from shared-complexity-utils.ts
// ============================================================================
export class ConfidenceStrategy {
  /**
   * FREE TIER BUSINESS LOGIC:
   * - Cap confidence to 70% for complex patterns (encourage upgrades)
   * - Allow high confidence for trivially-provable O(1) cases
   *
   * PAID TIER: No artificial caps.
   */
  static applyFreeTierCap(
    baseConfidence: number,
    notation: ComplexityNotation,
    tier: TierLevel
  ): number {
    if (tier === "paid") return baseConfidence;

    if (notation === "O(1)") return Math.min(baseConfidence, 85);
    if (notation === "O(log n)" || notation === "O(n)") {
      return Math.min(baseConfidence, 75);
    }
    return Math.min(baseConfidence, 70);
  }

  /**
   * Aggregate multiple confidence signals.
   * Strategy: Take the STRONGEST signal (max), not average.
   */
  static aggregateConfidence(reasons: ComplexityReason[]): number {
    if (reasons.length === 0) return 50;
    return Math.max(...reasons.map((r) => r.confidence));
  }
}

// For ConfidenceStrategy.applyFreeTierCap — re-export TierLevel locally
type TierLevel = "free" | "paid";

// ============================================================================
// NOTATION VALIDATOR
// Mirrors: NotationValidator from shared-complexity-utils.ts
// ============================================================================
export class NotationValidator {
  private static readonly VALID_NOTATIONS = new Set<ComplexityNotation>([
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(n³)",
    "O(n^k)",
    "O(2^n)",
    "O(2ⁿ)",
    "O(n!)",
    "O(sqrt n)",
    "UNKNOWN",
  ]);

  static validate(notation: ComplexityNotation): void {
    if (!this.VALID_NOTATIONS.has(notation)) {
      throw new Error(
        `Invalid ComplexityNotation: "${notation}". ` +
          `Valid: ${Array.from(this.VALID_NOTATIONS).join(", ")}`
      );
    }
  }

  static scoreToNotation(score: number): ComplexityNotation {
    if (score <= 1) return "O(1)";
    if (score <= 2) return "O(log n)";
    if (score <= 4) return "O(n)";
    if (score <= 5) return "O(n log n)";
    if (score <= 7) return "O(n²)";
    if (score <= 8) return "O(n³)";
    if (score <= 9) return "O(2ⁿ)";
    return "O(n!)";
  }

  static notationToScore(notation: ComplexityNotation): number {
    const map: Record<ComplexityNotation, number> = {
      "O(1)": 1,
      "O(log n)": 2,
      "O(sqrt n)": 3,
      "O(n)": 4,
      "O(n log n)": 5,
      "O(n²)": 7,
      "O(n³)": 8,
      "O(n^k)": 8,
      "O(2^n)": 9,
      "O(2ⁿ)": 9,
      "O(n!)": 10,
      UNKNOWN: 5,
    };
    return map[notation] ?? 5;
  }

  /**
   * Given a list of notations, return the worst-case (highest scoring) one.
   * Used for file-level summary aggregation.
   */
  static worstCase(notations: ComplexityNotation[]): ComplexityNotation {
    if (notations.length === 0) return "O(1)";

    const ORDER: ComplexityNotation[] = [
      "O(1)",
      "O(log n)",
      "O(sqrt n)",
      "O(n)",
      "O(n log n)",
      "O(n²)",
      "O(n³)",
      "O(n^k)",
      "O(2^n)",
      "O(2ⁿ)",
      "O(n!)",
      "UNKNOWN",
    ];

    let maxIdx = 0;
    for (const n of notations) {
      const idx = ORDER.indexOf(n);
      if (idx > maxIdx) maxIdx = idx;
    }
    return ORDER[maxIdx];
  }
}

// ============================================================================
// INPUT VALIDATOR
// Mirrors: InputValidator from shared-complexity-utils.ts
// ============================================================================
export class InputValidator {
  static validateLoopDepth(depth: number): number {
    if (!Number.isFinite(depth) || depth < 0) return 0;
    return Math.min(Math.floor(depth), 30);
  }

  static validateFunctionName(
    name: string | null | undefined,
    onInvalid?: (msg: string) => void
  ): string | null {
    if (name == null) {
      onInvalid?.("Function name is null — skipping recursion detection");
      return null;
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      onInvalid?.("Function name is empty — skipping recursion detection");
      return null;
    }
    return trimmed;
  }

  static escapeRegex(name: string): string {
    return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

// ============================================================================
// RISK CALCULATOR
// ============================================================================
export class RiskCalculator {
  static fromScore(totalScore: number): Uppercase_RiskLevelType {
    if (totalScore >= RISK_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (totalScore >= RISK_THRESHOLDS.HIGH) return "HIGH";
    if (totalScore >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  static scoreToRisk(score: number): import("./interfaces.js").Risk {
    if (score <= 3) return "LOW";
    if (score <= 6) return "MEDIUM";
    return "HIGH";
  }
}

// ============================================================================
// SIGNAL PROFILE FACTORY
// Creates a blank SignalProfile with safe defaults
// ============================================================================
export function createBlankSignalProfile(): SignalProfile {
  return {
    loops: 0,
    nestedLoops: 0,
    conditionals: 0,
    recursion: false,
    recursionDoubled: false,
    recursionCallCount: 0,
    hasBreakOrContinue: false,
    hasEarlyReturn: false,
    conditionDoubled: false,
    isConstantBody: false,
    isConstantWithReturn: false,
    allocations: 0,
    variables: 0,
    usesDataStructures: false,
    usesNestedDataStructures: false,
    loopWithAllocation: false,
    recursionWithAllocation: false,
    hasLoopInRecursion: false,
    hasFilterOrSlice: false,
    hasLinearSearchInLoop: false,
    hasNestedArrayMethods: false,
    hasSorting: false,
    hasJSONOperations: false,
    hasSpreadOperator: false,
    functionalLoopCount: 0,
    dataSizeHint: "MEDIUM",
    languageSpecific: {},
  };
}
