// ============================================================================
// FAST ANALYZER (FREE TIER - Version 2.0 Refactored)
// Pattern-based analysis using regex
// Target: ~80% correctness, Fast execution
// ============================================================================

import {
  ComplexityReason,
  ComplexityResult,
  WEIGHTS
} from "../../../interfaces/complexityGeneratorInterface.js";
import { FreeTierComplexityCalculator } from "./free-tier-calculator-v2.js";
import { FreeTierReasonGenerator } from "./free-tier-reason-v2.js";
import { LoopDepthAnalyzer, InputValidator } from "../utils/shared-complexity-utils.js";

export class FastAnalyzer {

  /**
   * Quick pattern-based analysis using regex
   * Accuracy: ~80%, Speed: Very Fast
   * 
   * NEW: Handles null names gracefully, uses shared utilities
   */
  static analyze(
    text: string,
    name: string | null,
    startLine: number
  ): Partial<ComplexityResult> {
    const reasons: ComplexityReason[] = [];
    let timeScore = 0;
    let spaceScore = 0;

    // Validate and sanitize function name
    const validatedName = InputValidator.validateFunctionName(
      name,
      (message) => {
        // Log warning about missing name
        console.warn(`[FastAnalyzer] Line ${startLine}: ${message}`);
      }
    );

    // ========================================================================
    // PATTERN DETECTION
    // ========================================================================

    // Count loops (traditional and functional)
    const loopMatches = text.match(/\b(for|while|do)\s*[\(\{]/g) || [];
    const forEachMatches = text.match(/\.(forEach|map|filter|reduce)\s*\(/g) || [];
    const totalLoops = loopMatches.length + forEachMatches.length;

    // Use shared utility for nesting depth
    const nestingDepth = LoopDepthAnalyzer.estimateLoopNestingDepth(text);

    // Recursion detection (ONLY if name is valid)
    let hasRecursion = false;
    let recursionCallCount = 0;
    let likelyBinaryRecursion = false;

    if (validatedName) {
      // Escape special regex characters in function name
      const escapedName = validatedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const recursiveCallPattern = new RegExp(`\\b${escapedName}\\s*\\(`, 'g');

      const matches = text.match(recursiveCallPattern);
      if (matches) {
        recursionCallCount = matches.length;
        hasRecursion = recursionCallCount > 0;

        // Binary recursion: multiple calls in return statements
        const binaryPattern = /return[^;]*(\+|\*)[^;]*/g;
        const returnStatements = text.match(binaryPattern) || [];

        for (const stmt of returnStatements) {
          const callsInReturn = (stmt.match(recursiveCallPattern) || []).length;
          if (callsInReturn >= 2) {
            likelyBinaryRecursion = true;
            break;
          }
        }
      }
    }

    // Detect sorting
    const hasSorting = /\.sort\s*\(/.test(text);

    // Detect expensive builtins
    const hasJSON = /JSON\.(parse|stringify)/.test(text);

    // Detect linear search methods
    const hasLinearSearch = /\.(includes|indexOf|find|findIndex)\s*\(/.test(text);

    // CRITICAL: Linear search INSIDE loops (O(n²))
    const hasLinearSearchInLoop = totalLoops > 0 && hasLinearSearch;

    // Nested array methods
    const hasNestedArrayMethods = /\.(map|filter|forEach|reduce)\s*\([^)]*\.(map|filter|includes|indexOf|find)/.test(text);

    // Allocations
    const allocationMatches = text.match(/new\s+(Array|Object|Map|Set)|\.push\s*\(|\.concat\s*\(/g) || [];
    const spreadMatches = text.match(/\.\.\.|\bspread\b/g) || [];

    // ========================================================================
    // TIME COMPLEXITY SCORING
    // ========================================================================

    // Pattern 1: Nested loops (highest priority)
    if (nestingDepth > 1) {
      const nestedLoopScore = Math.pow(nestingDepth, 2) * WEIGHTS.NESTED_LOOP_FACTOR;
      timeScore += nestedLoopScore;

      const patternKey = `nested-loop-${Math.min(nestingDepth, 3)}`;
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason(patternKey, {
          loopDepth: nestingDepth,
          lineNumber: startLine,
        })
      );
    } else if (totalLoops > 0) {
      timeScore += totalLoops * WEIGHTS.LOOP;

      const patternKey = totalLoops === 1 ? "single-loop" : "many-loops";
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason(patternKey, {
          loopDepth: totalLoops,
          lineNumber: startLine,
        })
      );
    }

    // Pattern 2: Linear search in loops (hidden O(n²))
    if (hasLinearSearchInLoop) {
      timeScore += WEIGHTS.NESTED_LOOP_FACTOR * 1.5;
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason("loop-with-includes", {
          lineNumber: startLine,
          searchMethod: true,
        })
      );
    }

    // Pattern 3: Nested array methods
    if (hasNestedArrayMethods) {
      timeScore += WEIGHTS.NESTED_LOOP_FACTOR;
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason("nested-array-methods", {
          lineNumber: startLine,
        })
      );
    }

    // Pattern 4: Recursion
    if (hasRecursion) {
      if (likelyBinaryRecursion) {
        timeScore += WEIGHTS.BINARY_RECURSION;
        reasons.push(
          FreeTierReasonGenerator.generateTimeReason("recursion-binary", {
            isRecursive: true,
            callName: validatedName!,
            callCount: recursionCallCount,
            lineNumber: startLine,
          })
        );
      } else {
        timeScore += WEIGHTS.RECURSION;
        reasons.push(
          FreeTierReasonGenerator.generateTimeReason("recursion-simple", {
            isRecursive: true,
            callName: validatedName!,
            lineNumber: startLine,
          })
        );
      }
    }

    // Pattern 5: Sorting
    if (hasSorting) {
      timeScore += WEIGHTS.SORT;
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason("sort", {
          lineNumber: startLine,
        })
      );
    }

    // Pattern 6: JSON operations
    if (hasJSON) {
      timeScore += WEIGHTS.HIGH_COST_BUILTIN;
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason("json-operations", {
          lineNumber: startLine,
        })
      );
    }

    // Pattern 7: Simple linear search (no loop)
    if (hasLinearSearch && !hasLinearSearchInLoop && totalLoops === 0) {
      reasons.push(
        FreeTierReasonGenerator.generateTimeReason("includes-indexof", {
          lineNumber: startLine,
        })
      );
    }

    // ========================================================================
    // SPACE COMPLEXITY SCORING
    // ========================================================================

    // Pattern 1: Allocations in loops
    if (allocationMatches.length > 0 && totalLoops > 0) {
      spaceScore += allocationMatches.length * WEIGHTS.PUSH_IN_LOOP;
      reasons.push(
        FreeTierReasonGenerator.generateSpaceReason("array-allocation-loop", {
          inLoop: true,
          allocationType: "array/object",
          lineNumber: startLine,
          growthPattern: nestingDepth >= 2 ? "quadratic" : "linear",
        })
      );
    }

    // Pattern 2: Spread operator
    if (spreadMatches.length > 0) {
      const spreadPenalty =
        totalLoops > 0
          ? spreadMatches.length * WEIGHTS.SPREAD * 2
          : spreadMatches.length * WEIGHTS.SPREAD;

      spaceScore += spreadPenalty;
      reasons.push(
        FreeTierReasonGenerator.generateSpaceReason("spread-operator", {
          inLoop: totalLoops > 0,
          lineNumber: startLine,
        })
      );
    }

    // Pattern 3: Recursion stack space
    if (hasRecursion) {
      spaceScore += WEIGHTS.RECURSION_SPACE;
    }

    // Pattern 4: JSON creates full copy
    if (hasJSON) {
      spaceScore += WEIGHTS.HIGH_COST_BUILTIN * 0.5;
    }

    // ========================================================================
    // CALCULATE FINAL RESULTS
    // ========================================================================

    const timeComplexity = FreeTierComplexityCalculator.calculateTimeComplexity(
      nestingDepth,
      hasRecursion,
      likelyBinaryRecursion,
      hasSorting,
      hasLinearSearchInLoop || hasNestedArrayMethods
    );

    const spaceComplexity = FreeTierComplexityCalculator.calculateSpaceComplexity(
      allocationMatches.length,
      hasRecursion,
      nestingDepth,
      hasJSON,
      allocationMatches.length > 0 && totalLoops > 0
    );

    const totalScore = timeScore + spaceScore;
    const riskLevel = FreeTierComplexityCalculator.determineRiskLevel(totalScore);

    // Aggregate confidence (uses max strategy)
    const confidence = FreeTierComplexityCalculator.calculateOverallConfidence(reasons);

    return {
      timeComplexity,
      spaceComplexity,
      timeScore,
      spaceScore,
      totalScore,
      riskLevel,
      reasons,
      confidence,
      tierUsed: "free",
    };
  }
}
