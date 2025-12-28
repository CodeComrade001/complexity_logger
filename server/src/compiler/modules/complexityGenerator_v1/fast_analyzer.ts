
// ============================================================================
// FAST ANALYZER (FREE TIER - REGEX BASED)
// ============================================================================

import { ComplexityReason, ComplexityResult, WEIGHTS } from "../../interfaces/complexityGeneratorInterface";
import { ComplexityCalculator } from "./calculator";
import { ReasonGenerator } from "./paidTierReason";

export class FastAnalyzer {

  /**
   * Quick pattern-based analysis using regex
   * Accuracy: 70-80%, Speed: Very Fast
   */
  static analyze(text: string, name: string, startLine: number): Partial<ComplexityResult> {
    const reasons: ComplexityReason[] = [];
    let timeScore = 0;
    let spaceScore = 0;

    // Count loops
    const loopMatches = text.match(/\b(for|while|do)\s*[\(\{]/g) || [];
    const forEachMatches = text.match(/\.(forEach|map|filter|reduce)\s*\(/g) || [];
    const totalLoops = loopMatches.length + forEachMatches.length;

    // Estimate nesting depth by counting { } balance
    const nestingDepth = this.estimateNestingDepth(text);

    // Detect recursion
    const hasRecursion = name ? text.includes(`${name}(`) : false;

    // Detect sorting
    const hasSorting = /\.sort\s*\(/.test(text);

    // Detect expensive builtins
    const hasJSON = /JSON\.(parse|stringify)/.test(text);
    const hasRegex = /new\s+RegExp|\/.*\/[gimuy]*/.test(text);

    // Detect allocations
    const allocationMatches = text.match(/new\s+(Array|Object|Map|Set)|push\s*\(|concat\s*\(/g) || [];
    const spreadMatches = text.match(/\.{3}|\[\.{3}|\{\.{3}/g) || [];

    // TIME COMPLEXITY ANALYSIS
    if (totalLoops > 0) {
      timeScore += totalLoops * WEIGHTS.LOOP;

      if (nestingDepth >= 2) {
        const nestedLoopScore = (nestingDepth - 1) * WEIGHTS.NESTED_LOOP_FACTOR;
        timeScore += nestedLoopScore;

        reasons.push(ReasonGenerator.generateTimeReason("nested-loop-2", {
          loopDepth: nestingDepth,
          lineNumber: startLine
        }));
      } else {
        reasons.push(ReasonGenerator.generateTimeReason("single-loop", {
          lineNumber: startLine
        }));
      }
    }

    if (hasRecursion) {
      timeScore += WEIGHTS.RECURSION;
      reasons.push(ReasonGenerator.generateTimeReason("recursion-simple", {
        isRecursive: true,
        callName: name,
        lineNumber: startLine
      }));
    }

    if (hasSorting) {
      timeScore += WEIGHTS.SORT;
      reasons.push(ReasonGenerator.generateTimeReason("sort", {
        lineNumber: startLine
      }));
    }

    if (hasJSON) {
      timeScore += WEIGHTS.HIGH_COST_BUILTIN;
      reasons.push(ReasonGenerator.generateTimeReason("json-operations", {
        lineNumber: startLine
      }));
    }

    // SPACE COMPLEXITY ANALYSIS
    if (allocationMatches.length > 0 && totalLoops > 0) {
      spaceScore += allocationMatches.length * WEIGHTS.PUSH_IN_LOOP;
      reasons.push(ReasonGenerator.generateSpaceReason("array-allocation-loop", {
        inLoop: true,
        allocationType: "array/object",
        lineNumber: startLine,
        growthPattern: nestingDepth >= 2 ? "quadratic" : "linear"
      }));
    }

    if (spreadMatches.length > 0) {
      spaceScore += spreadMatches.length * WEIGHTS.SPREAD;
      reasons.push(ReasonGenerator.generateSpaceReason("spread-operator", {
        inLoop: totalLoops > 0,
        lineNumber: startLine
      }));
    }

    if (hasRecursion) {
      spaceScore += WEIGHTS.RECURSION_SPACE;
    }

    // Calculate complexities
    const timeComplexity = ComplexityCalculator.calculateTimeComplexity(
      nestingDepth,
      hasRecursion,
      false, // can't detect binary recursion easily with regex
      hasSorting,
      false
    );

    const spaceComplexity = ComplexityCalculator.calculateSpaceComplexity(
      allocationMatches.length,
      hasRecursion,
      nestingDepth,
      hasJSON,
      allocationMatches.length > 0
    );

    const totalScore = timeScore + spaceScore;
    const riskLevel = ComplexityCalculator.determineRiskLevel(totalScore);
    const confidence = ComplexityCalculator.calculateOverallConfidence(reasons);

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

  private static estimateNestingDepth(text: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of text) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    // Rough heuristic: divide by 2 since not all braces are loops
    return Math.ceil(maxDepth / 2);
  }
}