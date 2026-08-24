// ============================================================================
// SHARED COMPLEXITY UTILITIES
// Ported from shared-complexity-utils.ts.
// LoopDepthAnalyzer accepts optional custom loop keywords per language.
// ============================================================================

import type { ComplexityNotation, ComplexityReason } from "./interfaces.js";

// ============================================================================
// LOOP DEPTH ANALYZER
// ============================================================================
export class LoopDepthAnalyzer {
  /**
   * Default loop keywords (TypeScript / JavaScript).
   * Override per language by passing `customKeywords`.
   */
  private static readonly DEFAULT_LOOP_KEYWORDS = [
    "for",
    "while",
    "do",
    "forEach",
    "map",
    "filter",
    "reduce",
  ];

  /**
   * Estimates loop nesting depth using regex analysis.
   * Used as fallback / confirmation when AST analysis might undercount.
   *
   * @param text          The source text of the function.
   * @param customKeywords Optional language-specific loop keyword list.
   */
  static estimateLoopNestingDepth(
    text: string,
    customKeywords?: string[]
  ): number {
    const keywords = customKeywords ?? this.DEFAULT_LOOP_KEYWORDS;
    const keywordPattern = new RegExp(
      `\\b(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "g"
    );

    let maxDepth = 0;
    let currentDepth = 0;
    const blockStack: boolean[] = []; // true = loop block, false = other block

    const lines = text.split("\n");

    for (let line of lines) {
      line = this.sanitizeLine(line);

      const loopKeywordsInLine = line.match(keywordPattern) || [];
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      for (let i = 0; i < loopKeywordsInLine.length; i++) {
        blockStack.push(true);
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      const nonLoopBlocks = Math.max(0, openBraces - loopKeywordsInLine.length);
      for (let i = 0; i < nonLoopBlocks; i++) {
        blockStack.push(false);
      }

      for (let i = 0; i < closeBraces; i++) {
        const isLoopBlock = blockStack.pop();
        if (isLoopBlock) {
          currentDepth = Math.max(0, currentDepth - 1);
        }
      }
    }

    return maxDepth;
  }

  private static sanitizeLine(line: string): string {
    return line
      .replace(/\/\/.*$/g, "")
      .replace(/\/\*.*?\*\//g, "")
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");
  }
}

// ============================================================================
// CONFIDENCE STRATEGY
// ============================================================================
export class ConfidenceStrategy {
  /**
   * FREE TIER: cap confidence to encourage upgrades.
   * PAID TIER: no artificial caps (pass tier = "paid").
   */
  static applyFreeTierCap(
    baseConfidence: number,
    notation: ComplexityNotation,
    tier: "free" | "paid"
  ): number {
    if (tier === "paid") {
      return baseConfidence;
    }
    if (notation === "O(1)") return Math.min(baseConfidence, 85);
    if (notation === "O(log n)" || notation === "O(n)")
      return Math.min(baseConfidence, 75);
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

// ============================================================================
// NOTATION VALIDATOR
// ============================================================================
export class NotationValidator {
  private static readonly VALID_NOTATIONS: ReadonlySet<ComplexityNotation> =
    new Set<ComplexityNotation>([
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
          `Valid values: ${[...this.VALID_NOTATIONS].join(", ")}`
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
}

// ============================================================================
// INPUT VALIDATOR
// ============================================================================
export class InputValidator {
  static validateLoopDepth(depth: number): number {
    if (!Number.isInteger(depth)) {
      throw new Error(`Loop depth must be integer, got: ${depth}`);
    }
    if (depth < 0) {
      throw new Error(`Loop depth cannot be negative, got: ${depth}`);
    }
    return Math.min(depth, 30);
  }

  static validateFunctionName(
    name: string | null,
    onInvalid?: (message: string) => void
  ): string | null {
    if (name === null || name === undefined) {
      onInvalid?.("Function name not found - skipping recursion detection");
      return null;
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      onInvalid?.("Function name is empty - skipping recursion detection");
      return null;
    }
    return trimmed;
  }
}
