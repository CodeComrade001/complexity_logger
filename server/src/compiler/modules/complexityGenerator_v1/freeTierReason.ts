// ============================================================================
// FREE TIER REASON GENERATOR
// Detailed explanations that are easy to understand
// ============================================================================

import { COMPLEXITY_PATTERNS_FREE, ComplexityReason } from "../../interfaces/complexityGeneratorInterface";

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
        type: "time",
        pattern,
        detail: `We found a '${pattern}' pattern in your code. This affects how long your code takes to run as the input size grows.`,
        impact: "medium",
        confidence: 50,
        lineNumber: context.lineNumber
      };
    }

    let detail = complexityPattern.reason;
    let confidence = 70;
    let impact: ComplexityReason["impact"] = "medium";

    // Context 1: Nested loops
    if (context.loopDepth && context.loopDepth > 1) {
      detail += ` You have ${context.loopDepth} loops nested together, which means the inner loops run repeatedly for each iteration of the outer loops. This multiplies the total number of operations.`;
      confidence = 85;
      impact = context.loopDepth >= 3 ? "critical" : "high";
    }

    // Context 2: Binary recursion (exponential growth)
    if (context.isRecursive && context.callCount && context.callCount >= 2) {
      detail += ` The '${context.callName}' function calls itself ${context.callCount} times per execution. This creates exponential growth - each call branches into ${context.callCount} more calls, forming a tree that doubles in size at each level. With 10 inputs you get ~1,000 operations, with 20 inputs you get ~1 million operations!`;
      confidence = 75; // Lower confidence since regex can't be 100% sure
      impact = "critical";
    }
    // Context 2b: Simple recursion (linear)
    else if (context.isRecursive && context.callName) {
      detail += ` The '${context.callName}' function calls itself once per execution, creating a chain of calls. Each call adds to the stack, so processing 1,000 items creates 1,000 nested function calls.`;
      confidence = 80;
      impact = "medium";
    }

    // Context 3: Linear search in loops (hidden O(n²))
    if (context.searchMethod) {
      detail += ` You're using a search method (includes/indexOf/find) inside a loop. Each search checks items one-by-one, and since it's in a loop, this creates a hidden nested loop pattern. If you loop through 100 items and search through another 100 items each time, that's 10,000 operations total! Consider using a Set or Map for O(1) lookups instead.`;
      confidence = 85;
      impact = "high";
    }

    // Context 4: Method name context
    if (context.callName && !context.isRecursive && !context.searchMethod) {
      detail += ` The '${context.callName}' method is where this complexity comes from. This method processes data in a way that increases runtime as input grows.`;
      confidence = 80;
    }

    // Context 5: Nested with another operation
    if (context.nestedWith) {
      detail += ` This operation is happening inside ${context.nestedWith}, which means both operations run together. This compounds the complexity - like having a loop inside another loop.`;
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

    let detail = complexityPattern?.reason || `Your code is allocating memory here with pattern: ${pattern}. This means new data is being created and stored.`;
    let confidence = 65;
    let impact: ComplexityReason["impact"] = "medium";

    if (context.inLoop) {
      detail += " This memory allocation happens inside a loop, which means new memory is being created on every iteration. The total memory used grows with each loop cycle.";
      confidence = 85;
      impact = "high";
    }

    if (context.allocationType) {
      detail += ` You're creating a ${context.allocationType} here, which adds to your program's memory footprint.`;
      confidence = 75;
    }

    if (context.growthPattern === "linear") {
      detail += " The amount of memory used grows at the same rate as your input size. If you double the input, you'll double the memory usage.";
      impact = "medium";
    } else if (context.growthPattern === "quadratic") {
      detail += " The memory usage grows much faster than your input size - it grows quadratically. If you double the input, memory usage increases by 4 times. This can quickly use up a lot of memory with large inputs.";
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