
// ============================================================================
// FAST ANALYZER (FREE TIER - REGEX BASED)
// ============================================================================

import { ComplexityReason, ComplexityResult, WEIGHTS } from "../../interfaces/complexityGeneratorInterface";
import { ComplexityCalculator } from "./calculator";
import { FreeTierReasonGenerator } from "./freeTierReason";

export class FastAnalyzer {

  /**
   * Quick pattern-based analysis using regex
   * Accuracy: 70-80%, Speed: Very Fast
   */
  static analyze(text: string, name: string, startLine: number): Partial<ComplexityResult> {
    const reasons: ComplexityReason[] = [];
    let timeScore = 0;
    let spaceScore = 0;

    // Count loops (traditional and functional)
    const loopMatches = text.match(/\b(for|while|do)\s*[\(\{]/g) || [];
    const forEachMatches = text.match(/\.(forEach|map|filter|reduce)\s*\(/g) || [];
    const totalLoops = loopMatches.length + forEachMatches.length;

    // IMPROVED: Better nesting detection - only count loop-related nesting
    const nestingDepth = this.estimateLoopNestingDepth(text);

    // Detect recursion
    const hasRecursion = name ? text.includes(`${name}(`) : false;

    // NEW: Try to detect binary recursion (multiple recursive calls)
    const recursionCallCount = name
      ? (text.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length
      : 0;
    const likelyBinaryRecursion = recursionCallCount >= 2;

    // Detect sorting
    const hasSorting = /\.sort\s*\(/.test(text);

    // Detect expensive builtins
    const hasJSON = /JSON\.(parse|stringify)/.test(text);

    // NEW: Detect linear search methods
    const hasLinearSearch = /\.(includes|indexOf|find|findIndex)\s*\(/.test(text);

    // NEW: Critical pattern - linear search INSIDE loops (O(n²) killer!)
    const hasLinearSearchInLoop = totalLoops > 0 && hasLinearSearch;

    // NEW: Detect nested array methods (map inside map, etc)
    const hasNestedArrayMethods = /\.(map|filter|forEach|reduce)\s*\([^)]*\.(map|filter|includes|indexOf|find)/.test(text);

    // Detect allocations
    const allocationMatches = text.match(/new\s+(Array|Object|Map|Set)|\.push\s*\(|\.concat\s*\(/g) || [];
    const spreadMatches = text.match(/\.\.\.|spread/g) || [];

    // ===================
    // TIME COMPLEXITY
    // ===================

    // Pattern 1: Nested loops (most critical for time)
    if (nestingDepth >= 2) {
      const nestedLoopScore = Math.pow(nestingDepth, 2) * WEIGHTS.NESTED_LOOP_FACTOR;
      timeScore += nestedLoopScore;

      const patternKey = nestingDepth === 2 ? "nested-loop-2" : "nested-loop-3";
      reasons.push(FreeTierReasonGenerator.generateTimeReason(patternKey, {
        loopDepth: nestingDepth,
        lineNumber: startLine
      }));

    } else if (totalLoops > 0) {
      // Single loop - O(n)
      timeScore += totalLoops * WEIGHTS.LOOP;
      reasons.push(FreeTierReasonGenerator.generateTimeReason("single-loop", {
        lineNumber: startLine
      }));
    }

    // Pattern 2: Linear search in loops (hidden O(n²))
    if (hasLinearSearchInLoop) {
      timeScore += WEIGHTS.NESTED_LOOP_FACTOR * 1.5; // High penalty
      reasons.push(FreeTierReasonGenerator.generateTimeReason("loop-with-includes", {
        lineNumber: startLine,
        searchMethod: hasLinearSearch
      }));
    }

    // Pattern 3: Nested array methods
    if (hasNestedArrayMethods) {
      timeScore += WEIGHTS.NESTED_LOOP_FACTOR;
      reasons.push(FreeTierReasonGenerator.generateTimeReason("nested-array-methods", {
        lineNumber: startLine
      }));
    }

    // Pattern 4: Recursion
    if (hasRecursion) {
      if (likelyBinaryRecursion) {
        timeScore += WEIGHTS.RECURSION * 3; // Higher penalty for exponential
        reasons.push(FreeTierReasonGenerator.generateTimeReason("recursion-binary", {
          isRecursive: true,
          callName: name,
          callCount: recursionCallCount,
          lineNumber: startLine
        }));
      } else {
        timeScore += WEIGHTS.RECURSION;
        reasons.push(FreeTierReasonGenerator.generateTimeReason("recursion-simple", {
          isRecursive: true,
          callName: name,
          lineNumber: startLine
        }));
      }
    }

    // Pattern 5: Sorting
    if (hasSorting) {
      timeScore += WEIGHTS.SORT;
      reasons.push(FreeTierReasonGenerator.generateTimeReason("sort", {
        lineNumber: startLine
      }));
    }

    // Pattern 6: JSON operations
    if (hasJSON) {
      timeScore += WEIGHTS.HIGH_COST_BUILTIN;
      reasons.push(FreeTierReasonGenerator.generateTimeReason("json-operations", {
        lineNumber: startLine
      }));
    }

    // Pattern 7: Simple linear search (without loop)
    if (hasLinearSearch && !hasLinearSearchInLoop && totalLoops === 0) {
      reasons.push(FreeTierReasonGenerator.generateTimeReason("includes-indexof", {
        lineNumber: startLine
      }));
    }

    // ===================
    // SPACE COMPLEXITY
    // ===================

    // Pattern 1: Allocations in loops
    if (allocationMatches.length > 0 && totalLoops > 0) {
      spaceScore += allocationMatches.length * WEIGHTS.PUSH_IN_LOOP;
      reasons.push(FreeTierReasonGenerator.generateSpaceReason("array-allocation-loop", {
        inLoop: true,
        allocationType: "array/object",
        lineNumber: startLine,
        growthPattern: nestingDepth >= 2 ? "quadratic" : "linear"
      }));
    }

    // Pattern 2: Spread operator
    if (spreadMatches.length > 0) {
      const spreadPenalty = totalLoops > 0
        ? spreadMatches.length * WEIGHTS.SPREAD * 2  // Higher penalty in loops
        : spreadMatches.length * WEIGHTS.SPREAD;

      spaceScore += spreadPenalty;
      reasons.push(FreeTierReasonGenerator.generateSpaceReason("spread-operator", {
        inLoop: totalLoops > 0,
        lineNumber: startLine
      }));
    }

    // Pattern 3: Recursion stack space
    if (hasRecursion) {
      spaceScore += WEIGHTS.RECURSION_SPACE;
    }

    // Pattern 4: JSON creates full copy
    if (hasJSON) {
      spaceScore += WEIGHTS.HIGH_COST_BUILTIN * 0.5; // JSON uses O(n) space
    }

    // Calculate final complexities
    const timeComplexity = ComplexityCalculator.calculateTimeComplexity(
      nestingDepth,
      hasRecursion,
      likelyBinaryRecursion,
      hasSorting,
      hasLinearSearchInLoop || hasNestedArrayMethods
    );

    const spaceComplexity = ComplexityCalculator.calculateSpaceComplexity(
      allocationMatches.length,
      hasRecursion,
      nestingDepth,
      hasJSON,
      allocationMatches.length > 0 && totalLoops > 0
    );

    const totalScore = timeScore + spaceScore;
    const riskLevel = ComplexityCalculator.determineRiskLevel(totalScore);

    // REDUCED confidence for free tier since it's regex-based estimates
    const baseConfidence = ComplexityCalculator.calculateOverallConfidence(reasons);
    const confidence = Math.min(baseConfidence * 0.75, 0.70); // Cap at 70% for free tier

    return {
      timeComplexity,
      spaceComplexity,
      timeScore,
      spaceScore,
      totalScore,
      riskLevel,
      reasons,
      confidence,
      tierUsed: "free"
    };
  }

  /**
   * NEW: Better nesting detection - focuses on loop keywords, not all braces
   */
  private static estimateLoopNestingDepth(text: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    // Split by lines and track loop nesting only
    const lines = text.split('\n');

    for (const line of lines) {
      // Increment depth when we see loop keywords
      if (/\b(for|while|do|forEach|map|filter|reduce)\b/.test(line)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      // Decrement depth on closing braces (rough estimate)
      // Only count braces that likely close loop blocks
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      // Simple heuristic: if more close braces, we're exiting blocks
      if (closeBraces > openBraces) {
        currentDepth = Math.max(0, currentDepth - (closeBraces - openBraces));
      }
    }

    return maxDepth;
  }


}