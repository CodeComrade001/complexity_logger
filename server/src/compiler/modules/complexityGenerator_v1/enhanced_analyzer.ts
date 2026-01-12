import { Node, SyntaxKind } from "ts-morph";
import {
  ASTSignals,
  ComplexityClassification,
  ComplexityReason,
  ComplexityScores,
  WEIGHTS
} from "../../interfaces/complexityGeneratorInterface";
import { PaidTierReasonGenerator } from "./paidTierReason";
import { ComplexityCalculator } from "./calculator";

/**
 * Enhanced (Paid Tier) AST-based analysis logic
 * Extracted for modularity
 */
export class EnhancedAnalyzer {

  /**
   * Collects all complexity signals from AST traversal
   */
  static collectASTSignals(
    node: Node,
    functionName: string | null,
    keywordSet: Set<string>
  ): ASTSignals {
    const signals: ASTSignals = {
      maxLoopDepth: 0,
      allocationsInLoop: 0,
      hasRecursion: false,
      isBinaryRecursion: false,
      hasSorting: false,
      hasLinearSearch: false,
      hasDeepClone: false,
      hasAccumulation: false,
      matchedKeywords: []
    };

    let currentLoopDepth = 0;

    const visit = (n: Node) => {
      const kind = n.getKind();

      // Loop detection and depth tracking
      if (this.isLoopNode(kind)) {
        currentLoopDepth++;
        if (currentLoopDepth > signals.maxLoopDepth) {
          signals.maxLoopDepth = currentLoopDepth;
        }
        n.forEachChild(visit);
        currentLoopDepth--;
        return;
      }

      // Call expression analysis
      if (kind === SyntaxKind.CallExpression) {
        this.analyzeCallExpression(n, functionName, currentLoopDepth, signals);
      }

      // Allocation detection
      if (kind === SyntaxKind.NewExpression) {
        if (currentLoopDepth > 0) {
          signals.allocationsInLoop++;
        }
      }

      if (kind === SyntaxKind.ArrayLiteralExpression || kind === SyntaxKind.ObjectLiteralExpression) {
        if (currentLoopDepth > 0) {
          signals.allocationsInLoop++;
        }
      }

      // Spread operator detection
      if (kind === SyntaxKind.SpreadElement || kind === SyntaxKind.SpreadAssignment) {
        // Spread detected (scoring happens in Phase 2)
      }

      // Array mutation detection
      if (kind === SyntaxKind.PropertyAccessExpression) {
        const propText = n.getText();
        if (this.isAccumulationMethod(propText) && currentLoopDepth > 0) {
          signals.hasAccumulation = true;
        }
      }

      // Keyword matching
      if (kind === SyntaxKind.Identifier) {
        const tokenText = n.getText();
        if (keywordSet.has(tokenText)) {
          signals.matchedKeywords.push(tokenText);
        }
      }

      // Continue traversal
      n.forEachChild(visit);
    };

    // Start traversal
    this.traverseNodeBody(node, visit);

    return signals;
  }

  /**
   * Analyzes call expressions for complexity patterns
   */
  private static analyzeCallExpression(
    node: Node,
    functionName: string | null,
    currentLoopDepth: number,
    signals: ASTSignals
  ): void {
    const callText = (node as any).getExpression?.()?.getText?.() || "";

    // Array method detection
    if (/\.(forEach|map|filter|reduce)$/.test(callText)) {
      // Detected (scoring happens in Phase 2)
    }

    // Sorting detection
    if (/\.sort$/.test(callText)) {
      signals.hasSorting = true;
    }

    // Linear search detection
    if (/\.(includes|indexOf|find|findIndex)$/.test(callText)) {
      signals.hasLinearSearch = true;
    }

    // JSON operations (deep clone detection)
    if (callText.includes("JSON.stringify") || callText.includes("JSON.parse")) {
      signals.hasDeepClone = true;
    }

    // Recursion detection
    if (functionName && node.getText().includes(`${functionName}(`)) {
      signals.hasRecursion = true;

      // Binary recursion check (two or more recursive calls)
      const recursiveCalls = (node.getText().match(new RegExp(`${functionName}\\(`, "g")) || []).length;
      if (recursiveCalls >= 2) {
        signals.isBinaryRecursion = true;
      }
    }
  }

  /**
   * Detects async pattern and returns weight
   */
  static detectAsyncPattern(node: Node, startLine: number, reasons: ComplexityReason[]): number {
    const isAsync = (node as any).isAsync ? (node as any).isAsync() : false;

    if (isAsync) {
      reasons.push({
        type: "time",
        pattern: "async-await",
        detail: "Async function detected. While async/await doesn't directly increase algorithmic complexity, it adds overhead for promise resolution and may mask performance issues.",
        impact: "low",
        confidence: 95,
        lineNumber: startLine
      });
      return WEIGHTS.ASYNC_AWAIT;
    }

    return 0;
  }

  /**
   * Calculates time and space scores from collected signals
   */
  static calculateScores(
    signals: ASTSignals,
    asyncWeight: number,
    startLine: number,
    reasons: ComplexityReason[]
  ): ComplexityScores {
    let timeScore = asyncWeight;
    let spaceScore = 0;

    // Time scoring
    timeScore += this.calculateTimeScore(signals, startLine, reasons);

    // Space scoring
    spaceScore += this.calculateSpaceScore(signals, startLine, reasons);

    const totalScore = Math.round(timeScore + spaceScore);

    return { timeScore, spaceScore, totalScore };
  }

  /**
   * Calculates time complexity score
   */
  private static calculateTimeScore(
    signals: ASTSignals,
    startLine: number,
    reasons: ComplexityReason[]
  ): number {
    let score = 0;

    // Loop scoring
    const depth = signals.maxLoopDepth;

    // Base cost: any loop present
    if (depth >= 1) {
      score += WEIGHTS.LOOP;

      // Nested loop penalty grows with depth
      if (depth > 1) {
        score += (depth - 1) * WEIGHTS.NESTED_LOOP_FACTOR;
      }

      // Reason selection
      const reasonKey =
        depth === 1
          ? "single-loop"
          : depth === 2
            ? "nested-loop-2"
            : depth === 3
              ? "nested-loop-3"
              : "many-loops";

      reasons.push(
        PaidTierReasonGenerator.generateTimeReason(reasonKey, {
          loopDepth: depth,
          lineNumber: startLine,
        })
      );
    }

    // Recursion scoring
    if (signals.hasRecursion && !signals.isBinaryRecursion) {
      score += WEIGHTS.RECURSION;

      const pattern = signals.maxLoopDepth > 0 ? "divide-conquer" : "recursion-simple";
      reasons.push(PaidTierReasonGenerator.generateTimeReason(pattern, {
        isRecursive: true,
        lineNumber: startLine
      }));
    }

    // Binary recursion scoring
    if (signals.isBinaryRecursion) {
      score += WEIGHTS.BINARY_RECURSION;
    }

    // Sorting scoring
    if (signals.hasSorting) {
      score += WEIGHTS.SORT;
    }

    // Linear search scoring
    if (signals.hasLinearSearch) {
      score += WEIGHTS.SEARCH_LINEAR;
    }

    // Deep clone time penalty
    if (signals.hasDeepClone) {
      score += WEIGHTS.HIGH_COST_BUILTIN;
    }

    // Keyword scoring
    score += signals.matchedKeywords.length * WEIGHTS.KEYWORD_HIT;

    return score;
  }

  /**
   * Calculates space complexity score
   */
  private static calculateSpaceScore(
    signals: ASTSignals,
    startLine: number,
    reasons: ComplexityReason[]
  ): number {
    let score = 0;

    // Allocations in loops
    if (signals.allocationsInLoop > 0) {
      score += signals.allocationsInLoop * WEIGHTS.ALLOCATION;
      score += signals.allocationsInLoop * WEIGHTS.PUSH_IN_LOOP;
    }

    // Recursion space cost
    if (signals.hasRecursion) {
      score += WEIGHTS.RECURSION_SPACE;
    }

    // Deep clone space cost
    if (signals.hasDeepClone) {
      score += WEIGHTS.DEEP_CLONE;
    }

    // Accumulation pattern
    if (signals.hasAccumulation) {
      score += WEIGHTS.ACCUMULATOR;
    }

    return score;
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Traverses node body or node itself
   */
  private static traverseNodeBody(node: Node, visitor: (n: Node) => void): void {
    try {
      const body = (node as any).getBody ? (node as any).getBody() : null;
      if (body && body.forEachChild) {
        body.forEachChild(visitor);
      } else {
        node.forEachChild(visitor);
      }
    } catch (err) {
      console.error("AST traversal error:", err);
    }
  }

  /**
   * Checks if node is a loop construct
   */
  private static isLoopNode(kind: SyntaxKind): boolean {
    return (
      kind === SyntaxKind.ForStatement ||
      kind === SyntaxKind.ForOfStatement ||
      kind === SyntaxKind.ForInStatement ||
      kind === SyntaxKind.WhileStatement ||
      kind === SyntaxKind.DoStatement
    );
  }

  /**
   * Checks if property is an accumulation method
   */
  private static isAccumulationMethod(propText: string): boolean {
    return (
      propText.endsWith(".push") ||
      propText.endsWith(".concat") ||
      propText.endsWith(".unshift")
    );
  }
  // ========================================
  // CLASSIFICATION LOGIC
  // ========================================

  static classifyComplexity(
    signals: any,
    scores: any,
    reasons: ComplexityReason[]
  ): ComplexityClassification {
    const timeComplexityResult = ComplexityCalculator.calculateTimeComplexity(
      signals.maxLoopDepth,
      signals.hasRecursion,
      signals.isBinaryRecursion,
      signals.hasSorting,
      signals.hasLinearSearch
    );

    const spaceComplexityResult = ComplexityCalculator.calculateSpaceComplexity(
      signals.allocationsInLoop,
      signals.hasRecursion,
      signals.maxLoopDepth,
      signals.hasDeepClone,
      signals.hasAccumulation
    );

    const riskLevel = ComplexityCalculator.determineRiskLevel(scores.totalScore);
    const confidence = ComplexityCalculator.calculateOverallConfidence(reasons);

    return {
      timeComplexity: timeComplexityResult,
      spaceComplexity: spaceComplexityResult,
      riskLevel,
      confidence
    };
  }

}