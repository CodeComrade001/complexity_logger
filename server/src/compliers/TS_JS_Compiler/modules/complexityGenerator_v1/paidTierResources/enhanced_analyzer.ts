import { Node, SyntaxKind } from "ts-morph";
import {
  ASTSignals,
  ComplexityClassification,
  ComplexityReason,
  ComplexityScores,
  PaidComplexityReason,
  WEIGHTS
} from "../../../interfaces/complexityGeneratorInterface";
import { PaidTierComplexityCalculator } from "./paidTierComplexityCalculator";
import { AIComplexityExplainer } from "./aI_ReasonGenerator";

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
    keywordSet: Set<string>,
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
      if (this.isLoopNode(n)) {
        currentLoopDepth = this.estimateLoopNestingDepth(n)
        return currentLoopDepth;
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
        if (this.isAccumulationMethod(n) && currentLoopDepth > 0) {
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

  private static estimateLoopNestingDepth(node: Node): number {
    let maxDepth = 0;

    // Recursive function to walk the tree
    const walk = (currentNode: Node, currentDepth: number) => {
      // 1. Identify if this specific node is a loop construct
      const isLoop = this.isLoopNode(currentNode);

      // 2. If it's a loop, increment depth for this branch
      const depthAtNode = isLoop ? currentDepth + 1 : currentDepth;
      maxDepth = Math.max(maxDepth, depthAtNode);

      // 3. Continue walking down to children
      currentNode.forEachChild(child => walk(child, depthAtNode));
    };

    walk(node, 0);
    return maxDepth;
  }

  /**
   * Checks if node is a loop construct
   */


  private static isLoopNode(node: Node): boolean {
    // Check for native syntax loops (for, while, do-while)
    const loopKinds = [
      SyntaxKind.ForStatement,
      SyntaxKind.ForInStatement,
      SyntaxKind.ForOfStatement,
      SyntaxKind.WhileStatement,
      SyntaxKind.DoStatement
    ];

    if (loopKinds.includes(node.getKind())) {
      return true;
    }

    // Detect functional loops: array.forEach, .map, .filter, etc.
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      if (Node.isPropertyAccessExpression(expression)) {
        const methodName = expression.getName();
        const functionalLoops = ['forEach', 'map', 'filter', 'reduce', 'some', 'every'];
        return functionalLoops.includes(methodName);
      }
    }

    return false;
  }

  // ========================================
  // PHASE 4 — AI EXPLANATION (PAID ONLY)
  // ========================================

  static async generateAIReason(
    classification: ComplexityClassification,
    signals: ASTSignals
  ): Promise<PaidComplexityReason> {
    const ai = new AIComplexityExplainer();

    const signalList = [
      signals.maxLoopDepth > 1 && "nested loops",
      signals.hasRecursion && "recursion",
      signals.isBinaryRecursion && "binary recursion",
      signals.hasSorting && "sorting",
      signals.hasLinearSearch && "linear search",
      signals.allocationsInLoop > 0 && "allocations in loops",
      signals.hasDeepClone && "deep clone"
    ].filter(Boolean) as string[];

    const explanation = await ai.explainComplexity(
      { time: classification.timeComplexity.notation, space: classification.spaceComplexity.notation },
      signalList
    );

    return {
      type: "time",
      timeComplexity: classification.timeComplexity.notation,
      spaceComplexity: classification.spaceComplexity.notation,
      pattern: "ai-summary",
      detail: explanation,
      impact: classification.riskLevel.toLowerCase() as any,
      confidence: classification.confidence
    };
  }


  /**
   * Analyzes call expressions for complexity patterns
   */
  private static analyzeCallExpression(
    node: Node,
    functionName: string | null,
    _currentLoopDepth: number,
    signals: ASTSignals
  ): void {
    // Ensure we are actually dealing with a CallExpression
    if (!Node.isCallExpression(node)) return;

    const expression = node.getExpression();
    let methodName = "";

    // Get the method name safely without text parsing
    if (Node.isPropertyAccessExpression(expression)) {
      methodName = expression.getName();
    } else if (Node.isIdentifier(expression)) {
      methodName = expression.getText();
    }

    // 1. Array method & Logic detection
    const arrayMethods = ["forEach", "map", "filter", "reduce"];
    const searchMethods = ["includes", "indexOf", "find", "findIndex"];

    if (arrayMethods.includes(methodName)) {
      // Logic for Phase 2 scoring
    }

    if (methodName === "sort") {
      signals.hasSorting = true;
    }

    if (searchMethods.includes(methodName)) {
      signals.hasLinearSearch = true;
    }

    // 2. JSON operations (Checks for JSON.parse or JSON.stringify)
    if (Node.isPropertyAccessExpression(expression)) {
      const obj = expression.getExpression();
      if (Node.isIdentifier(obj) && obj.getText() === "JSON") {
        if (methodName === "parse" || methodName === "stringify") {
          signals.hasDeepClone = true;
        }
      }
    }

    // 3. Robust Recursion Detection
    if (functionName && methodName === functionName) {
      signals.hasRecursion = true;

      // Check for Binary Recursion (count recursive calls within the same statement/expression)
      // We look for descendants of the current node's parent that call the same function name
      const parent = node.getParent();
      if (parent) {
        const recursiveCalls = parent
          .getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => {
            const expr = c.getExpression();
            return Node.isIdentifier(expr) && expr.getText() === functionName;
          }).length;

        if (recursiveCalls >= 2) {
          signals.isBinaryRecursion = true;
        }
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
  ): ComplexityScores {
    let timeScore = asyncWeight;
    let spaceScore = 0;

    // Time scoring
    timeScore += this.calculateTimeScore(signals, startLine);

    // Space scoring
    spaceScore += this.calculateSpaceScore(signals, startLine);

    const totalScore = Math.round(timeScore + spaceScore);

    return { timeScore, spaceScore, totalScore };
  }

  /**
   * Calculates time complexity score
   */
  private static calculateTimeScore(
    signals: ASTSignals,
    startLine: number,
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


    }

    // Recursion scoring
    if (signals.hasRecursion && !signals.isBinaryRecursion) {
      score += WEIGHTS.RECURSION;
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
    _startLine: number,
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
 * Checks if the node is an accumulation method call.
 * Instead of string suffix matching, we check the actual property name.
 */
  private static isAccumulationMethod(node: Node): boolean {
    // Ensure we are looking at a property access (e.g., array.push)
    if (!Node.isPropertyAccessExpression(node)) {
      return false;
    }

    const methodName = node.getName(); // Returns exactly "push", "concat", etc.
    const accumulationMethods = ["push", "concat", "unshift"];

    return accumulationMethods.includes(methodName);
  }
  // ========================================
  // CLASSIFICATION LOGIC
  // ========================================

  static classifyComplexity(
    signals: ASTSignals,
    scores: any,
  ): ComplexityClassification {
    const timeComplexityResult = PaidTierComplexityCalculator.calculateTimeComplexity(
      signals.maxLoopDepth,
      signals.hasRecursion,
      signals.isBinaryRecursion,
      signals.hasSorting,
      signals.hasLinearSearch,
      signals.hasDeepClone,
      signals.hasAccumulation,
    );

    const spaceComplexityResult = PaidTierComplexityCalculator.calculateSpaceComplexity(
      signals.maxLoopDepth,
      signals.allocationsInLoop,
      signals.hasRecursion,
      signals.hasSorting,
      signals.hasDeepClone,
      signals.hasAccumulation,
    );

    const riskLevel = PaidTierComplexityCalculator.determineRiskLevel(scores.totalScore);
    const confidence = PaidTierComplexityCalculator.calculateOverallConfidence(signals, riskLevel);

    return {
      timeComplexity: timeComplexityResult,
      spaceComplexity: spaceComplexityResult,
      riskLevel,
      confidence
    };
  }

}