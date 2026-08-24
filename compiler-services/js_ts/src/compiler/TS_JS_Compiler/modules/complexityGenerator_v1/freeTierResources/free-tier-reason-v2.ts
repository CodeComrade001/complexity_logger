// ============================================================================
// FREE TIER REASON GENERATOR (Version 2.0 - Refactored)
// Target: ~80% correctness, simplified logic
// ============================================================================

import {
  COMPLEXITY_PATTERNS_FREE,
  ComplexityReason,
  ComplexityNotation
} from "../../../interfaces/complexityGeneratorInterface.js";
import { ConfidenceStrategy, InputValidator } from "../utils/shared-complexity-utils.js";

export class FreeTierReasonGenerator {

  /**
   * Generate time complexity explanation
   * FREE VERSION: Simplified confidence composition
   */
  static generateTimeReason(
    pattern: string,
    context: {
      loopDepth?: number;
      callName?: string;
      lineNumber?: number;
      isRecursive?: boolean;
      nestedWith?: string;
      callCount?: number;
      searchMethod?: boolean;
    }
  ): ComplexityReason {
    const complexityPattern = COMPLEXITY_PATTERNS_FREE[pattern];

    // Handle unknown patterns gracefully
    if (!complexityPattern) {
      return this.createUnknownReason(pattern, "time", context.lineNumber);
    }

    // Start with base values from pattern
    let detail = complexityPattern.reason;
    let confidence = 70; // Free tier baseline
    let impact: ComplexityReason["impact"] = "medium";

    // Apply context-based adjustments
    confidence = this.calculateTimeConfidence(context, confidence);
    impact = this.calculateTimeImpact(context);

    return {
      type: "time",
      pattern,
      detail,
      impact,
      confidence,
      lineNumber: context.lineNumber
    };
  }

  /**
   * Generate space complexity explanation
   * FREE VERSION: Basic logic
   */
  static generateSpaceReason(
    pattern: string,
    context: {
      allocationType?: string;
      inLoop?: boolean;
      lineNumber?: number;
      growthPattern?: string;
    }
  ): ComplexityReason {
    const complexityPattern = COMPLEXITY_PATTERNS_FREE[pattern];

    if (!complexityPattern) {
      return this.createUnknownReason(pattern, "space", context.lineNumber);
    }

    let detail = complexityPattern.reason;
    let confidence = 65; // Lower baseline for space (harder to detect accurately)
    let impact: ComplexityReason["impact"] = "medium";

    // Apply context
    if (context.inLoop) {
      confidence = 80;
      impact = "high";
    }

    if (context.growthPattern === "quadratic") {
      impact = "critical";
      confidence = 75;
    }

    return {
      type: "space",
      pattern,
      detail,
      impact,
      confidence,
      lineNumber: context.lineNumber
    };
  }

  // ========================================================================
  // PRIVATE HELPERS (Simplified for Free Tier)
  // ========================================================================

  private static calculateTimeConfidence(
    context: {
      loopDepth?: number;
      isRecursive?: boolean;
      callCount?: number;
      searchMethod?: boolean;
      nestedWith?: string;
    },
    baseConfidence: number
  ): number {
    let confidence = baseConfidence;

    // Loop depth boosts confidence
    if (typeof context.loopDepth === "number" && context.loopDepth > 0) {
      confidence = 85;
    }

    // Binary recursion is less certain (regex-based)
    if (context.isRecursive && context.callCount && context.callCount >= 2) {
      confidence = 75;
    }
    // Simple recursion is more certain
    else if (context.isRecursive) {
      confidence = 80;
    }

    // Linear search detection is reliable
    if (context.searchMethod) {
      confidence = 85;
    }

    // Nested patterns are very certain
    if (context.nestedWith) {
      confidence = 90;
    }

    return confidence;
  }

  private static calculateTimeImpact(
    context: {
      loopDepth?: number;
      isRecursive?: boolean;
      callCount?: number;
      searchMethod?: boolean;
      nestedWith?: string;
    }
  ): ComplexityReason["impact"] {
    // Binary recursion = critical
    if (context.isRecursive && context.callCount && context.callCount >= 2) {
      return "critical";
    }

    // Nested patterns = high
    if (context.nestedWith || context.searchMethod) {
      return "high";
    }

    // Loop depth mapping
    if (typeof context.loopDepth === "number") {
      const depthSafe = InputValidator.validateLoopDepth(context.loopDepth);
      if (depthSafe === 1) return "low";
      if (depthSafe === 2) return "medium";
      if (depthSafe >= 3) return "high";
    }

    return "medium";
  }

  private static createUnknownReason(
    pattern: string,
    type: "time" | "space",
    lineNumber?: number
  ): ComplexityReason {
    return {
      type: "unknown",
      pattern,
      detail: `Detected '${pattern}' pattern but it doesn't match known complexity signatures. Manual review recommended.`,
      impact: "unknown",
      confidence: 10,
      lineNumber
    };
  }
}
