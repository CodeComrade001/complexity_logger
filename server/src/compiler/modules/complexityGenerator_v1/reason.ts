// ============================================================================
// REASON GENERATOR
// ============================================================================

import { COMPLEXITY_PATTERNS, ComplexityReason } from "../../interfaces/complexityGeneratorInterface";

export class ReasonGenerator {

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
    }
  ): ComplexityReason {
    const complexityPattern = COMPLEXITY_PATTERNS[pattern];

    if (!complexityPattern) {
      return {
        type: "time",
        pattern,
        detail: `Pattern '${pattern}' detected in code`,
        impact: "medium",
        confidence: 50,
        lineNumber: context.lineNumber
      };
    }

    let detail = complexityPattern.reason;
    let confidence = 70;
    let impact: ComplexityReason["impact"] = "medium";

    // Enhance based on context
    if (context.loopDepth && context.loopDepth > 1) {
      detail += `. Nesting depth of ${context.loopDepth} multiplies the complexity.`;
      confidence = 85;
      impact = context.loopDepth >= 3 ? "critical" : "high";
    }

    if (context.callName) {
      detail += ` The method '${context.callName}' is the source of this complexity.`;
      confidence = 80;
    }

    if (context.nestedWith) {
      detail += ` This pattern is nested with ${context.nestedWith}, compounding the complexity.`;
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
    const complexityPattern = COMPLEXITY_PATTERNS[pattern];

    let detail = complexityPattern?.reason || `Space allocation detected: ${pattern}`;
    let confidence = 65;
    let impact: ComplexityReason["impact"] = "medium";

    if (context.inLoop) {
      detail += " This allocation occurs inside a loop, causing memory to grow with each iteration.";
      confidence = 85;
      impact = "high";
    }

    if (context.allocationType) {
      detail += ` Allocation type: ${context.allocationType}.`;
      confidence = 75;
    }

    if (context.growthPattern === "linear") {
      detail += " Memory grows linearly with input size.";
      impact = "medium";
    } else if (context.growthPattern === "quadratic") {
      detail += " Memory grows quadratically - this can cause significant memory pressure with large inputs.";
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