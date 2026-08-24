// ============================================================================
// SHARED UTILITIES - Used by both Free and Paid tiers
// ============================================================================

import { ComplexityNotation, ComplexityReason } from "./interfaces-v2.js";

// ============================================================================
// LOOP DEPTH ANALYZER - Eliminates DRY violation
// ============================================================================
export class LoopDepthAnalyzer {
  /**
   * Estimates loop nesting depth using regex analysis.
   * Used as fallback when AST analysis might undercount nesting.
   * 
   * Algorithm:
   * 1. Remove comments and strings to avoid false positives
   * 2. Track loop keywords and braces separately
   * 3. Maintain stack to distinguish loop blocks from other blocks
   * 4. Return maximum depth observed
   */
  static estimateLoopNestingDepth(text: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    const blockStack: boolean[] = []; // true = loop block, false = other block

    const lines = text.split('\n');

    for (let line of lines) {
      // CRITICAL: Remove code that could confuse pattern matching
      line = this.sanitizeLine(line);

      // Count loop constructs
      const loopKeywords = line.match(/\b(for|while|do|forEach|map|filter|reduce)\b/g) || [];
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      // Process loop keywords
      for (let i = 0; i < loopKeywords.length; i++) {
        blockStack.push(true);
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      // Track non-loop blocks
      const nonLoopBlocks = Math.max(0, openBraces - loopKeywords.length);
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
   * Remove comments and strings that could contain false-positive patterns
   */
  private static sanitizeLine(line: string): string {
    return line
      .replace(/\/\/.*$/g, '')              // Single-line comments
      .replace(/\/\*.*?\*\//g, '')          // Block comments (single line)
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, ''); // String literals
  }
}

// ============================================================================
// CONFIDENCE STRATEGY - Smart business logic for free tier
// ============================================================================
export class ConfidenceStrategy {
  /**
   * FREE TIER BUSINESS LOGIC:
   * - Cap confidence to 70% for most patterns (encourage upgrades)
   * - BUT allow high confidence for trivial/provable cases
   * - Don't punish users for O(1) constant-time code
   * 
   * PAID TIER: No artificial caps
   */
  static applyFreeTierCap(
    baseConfidence: number,
    notation: ComplexityNotation,
    tier: "free" | "paid"
  ): number {
    if (tier === "paid") {
      return baseConfidence; // No caps for paying customers
    }

    // Free tier: Smart capping based on pattern complexity
    if (notation === "O(1)") {
      // Provably constant → allow high confidence (don't penalize correct code)
      return Math.min(baseConfidence, 85);
    }

    if (notation === "O(log n)" || notation === "O(n)") {
      // Simple linear patterns → moderate cap
      return Math.min(baseConfidence, 75);
    }

    // Complex patterns (O(n²), O(2^n), etc.) → strict cap to encourage upgrade
    return Math.min(baseConfidence, 70);
  }

  /**
   * Aggregate multiple confidence signals.
   * Strategy: Take the STRONGEST signal (max), not average.
   * Rationale: If we're 90% sure about ONE pattern, that's more valuable
   * than being 50% sure about five patterns.
   */
  static aggregateConfidence(reasons: ComplexityReason[]): number {
    if (reasons.length === 0) return 50; // Default for unknown

    return Math.max(...reasons.map(r => r.confidence));
  }
}

// ============================================================================
// NOTATION VALIDATOR - Runtime type safety
// ============================================================================
export class NotationValidator {
  private static readonly VALID_NOTATIONS: Set<ComplexityNotation> = new Set([
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
    "UNKNOWN"
  ]);

  /**
   * Ensures notation is valid at runtime
   * Throws if invalid (fail-fast for debugging)
   */
  static validate(notation: ComplexityNotation): void {
    if (!this.VALID_NOTATIONS.has(notation)) {
      throw new Error(
        `Invalid ComplexityNotation: "${notation}". ` +
        `Valid values: ${Array.from(this.VALID_NOTATIONS).join(', ')}`
      );
    }
  }

  /**
   * Convert score (1-10) to Big-O notation
   * Used for consistency across tiers
   */
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

  /**
   * Convert Big-O notation to score (1-10)
   * Inverse of scoreToNotation
   */
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
      "UNKNOWN": 5 // Conservative middle ground
    };

    return map[notation] ?? 5;
  }
}

// ============================================================================
// INPUT VALIDATOR - Defensive programming
// ============================================================================
export class InputValidator {
  /**
   * Validate numeric inputs to prevent garbage-in-garbage-out
   */
  static validateLoopDepth(depth: number): number {
    if (!Number.isInteger(depth)) {
      throw new Error(`Loop depth must be integer, got: ${depth}`);
    }
    if (depth < 0) {
      throw new Error(`Loop depth cannot be negative, got: ${depth}`);
    }
    // Cap at reasonable maximum (30 nested loops is insane)
    return Math.min(depth, 30);
  }

  /**
   * Validate function name for recursion detection
   * Returns null if invalid, with optional logging
   */
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
