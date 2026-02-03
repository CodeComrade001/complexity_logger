// ============================================================================
// FREE TIER REASON GENERATOR
// Detailed explanations that are easy to understand
// ============================================================================

import { COMPLEXITY_PATTERNS_FREE, ComplexityReason } from "../../../interfaces/complexityGeneratorInterface";

export class FreeTierReasonGenerator {

  /**
   * Generate detailed explanation for detected complexity patterns
   */
  static generateTimeReason(
    pattern: string,
    context: {
      loopDepth?: number;
      callName?: string;
      lineNumber?: number;
      isRecursive?: boolean;
      nestedWith?: string;
      callCount?: number;        // NEW: For binary recursion detection
      searchMethod?: boolean;    // NEW: For linear search detection
    }
  ): ComplexityReason {
    const complexityPattern = COMPLEXITY_PATTERNS_FREE[pattern];

    if (!complexityPattern) {
      return {
        type: "unknown",
        pattern,
        detail: `We detected a '${pattern}' construct, but it does not match any known complexity pattern. Manual review is recommended.`,
        impact: "unknown",
        confidence: 10,
        lineNumber: context.lineNumber
      };
    }


    let detail = complexityPattern.reason;
    let confidence = 70;
    let impact: ComplexityReason["impact"] = "medium";
    // Context 1: Single loop

    const loopDepth = context.loopDepth;

    if (typeof loopDepth === "number") {
      confidence = 85;

      const impactByDepth: Record<number, ComplexityReason["impact"]> = {
        1: "low",
        2: "medium",
        3: "high",
      };

      impact = impactByDepth[loopDepth] ?? "critical";
    }

    // Context 2: Binary recursion (exponential growth)
    if (context.isRecursive && context.callCount && context.callCount >= 2) {
      confidence = 75; // Lower confidence since regex can't be 100% sure
      impact = "critical";
    }
    // Context 2b: Simple recursion (linear)
    else if (context.isRecursive && context.callName) {
      confidence = 80;
      impact = "medium";
    }

    // Context 3: Linear search in loops (hidden O(n²))
    if (context.searchMethod) {
      confidence = 85;
      impact = "high";
    }

    // Context 4: Method name context
    if (context.callName && !context.isRecursive && !context.searchMethod) {
      confidence = 80;
    }

    // Context 5: Nested with another operation
    if (context.nestedWith) {
      impact = "high";
      confidence = 90;
    }

    return {
      type: "time",
      pattern,
      detail,
      impact,
      confidence,
      lineNumber: context.lineNumber
    };
  }

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
      return {
        type: "unknown",
        pattern,
        detail: `We detected a '${pattern}' construct, but it does not match any known complexity pattern. Manual review is recommended.`,
        impact: "unknown",
        confidence: 10,
        lineNumber: context.lineNumber
      };
    }

    let detail = complexityPattern.reason
    let confidence = 65;
    let impact: ComplexityReason["impact"] = "medium";

    if (context.inLoop) {
      confidence = 85;
      impact = "high";
    }

    if (context.allocationType) {
      confidence = 75;
    }

    if (context.growthPattern === "linear") {
      impact = "medium";
    } else if (context.growthPattern === "quadratic") {
      impact = "critical";
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
}