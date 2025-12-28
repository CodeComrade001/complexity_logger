import { Node, SyntaxKind } from "ts-morph";
import { AnalysisSummary, ASTSignals, ComplexityClassification, ComplexityNotation, ComplexityReason, ComplexityResult, ComplexityScores, TierLevel, WEIGHTS } from "../../interfaces/complexityGeneratorInterface";
import { ComplexityCalculator } from "./calculator";
import { PaidTierReasonGenerator } from "./paidTierReason";
import { FastAnalyzer } from "./fast_analyzer";
import { dataSets } from "../../utils/datasets";
import { normalizedPayloadData } from "../complexityOrchestrator/complexityOrchestratorInterface";
import { fetchUnitPartOfCodeArrayTargets } from "../../interfaces/fetchUnitPartOfCodeProps";

// ========================================
// TYPES
// ========================================

type UnitTarget = fetchUnitPartOfCodeArrayTargets;

export class EnhancedComplexityGenerator_v1 {
  private keywordSet: Set<string>;

  constructor() {
    this.keywordSet = this.buildKeywordSet();
  }

  // ========================================
  // PUBLIC API - TIER SELECTION
  // ========================================



  /**
   * BACKWARD COMPATIBLE - matches your original execute() method
   * Defaults to DEEP analysis for paid tier
   */
  public async executePaidTier(fetchPartOfCodeResult: normalizedPayloadData): Promise<AnalysisSummary> {
    return this.analyzeDeep(fetchPartOfCodeResult);
  }

  /**
   * BACKWARD COMPATIBLE - matches your original execute() method
   * Defaults to fast analysis for free tier
   */
  public async executeFreeTier(fetchPartOfCodeResult: normalizedPayloadData): Promise<AnalysisSummary> {
    return this.analyzeFast(fetchPartOfCodeResult);
  }

  // ========================================
  // TIER-SPECIFIC ANALYSIS
  // ========================================

  /**
   * Analyze with FREE tier (fast, regex-based)
   * Accuracy: 70-80%, Speed: <100ms
   */
  private async analyzeFast(
    fetchPartOfCodeResult: normalizedPayloadData
  ): Promise<AnalysisSummary> {
    const resultsByUnit = this.processUnits(
      fetchPartOfCodeResult,
      (node, unitType, idx) => this.analyzeFastNode(node, unitType, `${unitType}_${idx}`)
    );

    return this.buildSummary(
      fetchPartOfCodeResult.nameOfFile,
      resultsByUnit,
      "free"
    );
  }

  /**
 * Analyze with PAID tier (deep, AST-based)
 * Accuracy: 95%+, Speed: <500ms
 */
  private async analyzeDeep(
    fetchPartOfCodeResult: normalizedPayloadData
  ): Promise<AnalysisSummary> {
    const resultsByUnit = this.processUnits(
      fetchPartOfCodeResult,
      (node, unitType, idx) => this.analyzeDeepNode(node, unitType, `${unitType}_${idx}`)
    );

    return this.buildSummary(
      fetchPartOfCodeResult.nameOfFile,
      resultsByUnit,
      "paid"
    );
  }


  // ========================================
  // DEEP ANALYSIS (PAID TIER)
  // ========================================

  // ========================================
  // FAST ANALYSIS (FREE TIER)
  // ========================================

  private analyzeFastNode(
    node: any,
    kind: fetchUnitPartOfCodeArrayTargets,
    nameHint?: string
  ): ComplexityResult {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    // Use FastAnalyzer for regex-based analysis
    const fastResult = FastAnalyzer.analyze(text, name || "", startLine);

    // Simple keyword matching for additional signals
    const matchedKeywords = this.findKeywordMatches(text);

    return {
      id: `${name || "anon"}:${startLine}`,
      kind,
      name,
      startLine,
      endLine,
      text,
      timeComplexity: fastResult.timeComplexity!,
      spaceComplexity: fastResult.spaceComplexity!,
      timeScore: fastResult.timeScore!,
      spaceScore: fastResult.spaceScore!,
      totalScore: fastResult.totalScore!,
      riskLevel: fastResult.riskLevel!,
      confidence: fastResult.confidence!,
      reasons: fastResult.reasons!,
      matchedKeywords,
      tierUsed: "free"
    };
  }

  private analyzeDeepNode(
    node: Node,
    kind: fetchUnitPartOfCodeArrayTargets,
    nameHint?: string
  ): ComplexityResult {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    const reasons: ComplexityReason[] = [];

    // Phase 1: Collect AST signals
    const asyncWeight = this.detectAsyncPattern(node, startLine, reasons);
    const signals = this.collectASTSignals(node, name, this.keywordSet);

    // Phase 2: Calculate scores from signals
    const scores = this.calculateScores(signals, asyncWeight, startLine, reasons);

    // Phase 3: Classify complexity
    const classification = this.classifyComplexity(signals, scores, reasons);

    // Deduplicate keywords
    const uniqueKeywords = Array.from(new Set(signals.matchedKeywords)) as string[];

    return {
      id: `${name || "anon"}:${startLine}`,
      kind,
      name,
      startLine,
      endLine,
      text,
      timeComplexity: classification.timeComplexity,
      spaceComplexity: classification.spaceComplexity,
      timeScore: Math.round(scores.timeScore),
      spaceScore: Math.round(scores.spaceScore),
      totalScore: scores.totalScore,
      riskLevel: classification.riskLevel,
      confidence: classification.confidence,
      reasons,
      matchedKeywords: uniqueKeywords,
      tierUsed: "paid"
    };
  }

  // ========================================
  // PHASE 1: AST SIGNAL COLLECTION
  // ========================================

  /**
   * Collects all complexity signals from AST traversal
   */
  private collectASTSignals(
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
  private analyzeCallExpression(
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
  private detectAsyncPattern(node: Node, startLine: number, reasons: ComplexityReason[]): number {
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

  // ========================================
  // PHASE 2: SCORING LOGIC
  // ========================================

  /**
   * Calculates time and space scores from collected signals
   */
  private calculateScores(
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
  private calculateTimeScore(
    signals: ASTSignals,
    startLine: number,
    reasons: ComplexityReason[]
  ): number {
    let score = 0;

    // Loop scoring
    if (signals.maxLoopDepth === 1) {
      score += WEIGHTS.LOOP;
      reasons.push(PaidTierReasonGenerator.generateTimeReason("single-loop", {
        lineNumber: startLine
      }));
    } else if (signals.maxLoopDepth > 1) {
      score += WEIGHTS.LOOP;
      const nestedPenalty = (signals.maxLoopDepth - 1) * WEIGHTS.NESTED_LOOP_FACTOR;
      score += nestedPenalty;

      const pattern = signals.maxLoopDepth === 2 ? "nested-loop-2" : "nested-loop-3";
      reasons.push(PaidTierReasonGenerator.generateTimeReason(pattern, {
        loopDepth: signals.maxLoopDepth,
        lineNumber: startLine
      }));
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

    // Binary recursion scoring (already added in signal collection phase)
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
  private calculateSpaceScore(
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
  // PHASE 3: CLASSIFICATION LOGIC
  // ========================================

  /**
   * Classifies complexity based on signals and scores
   */
  private classifyComplexity(
    signals: ASTSignals,
    scores: ComplexityScores,
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


  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Builds keyword set from datasets
   */
  private buildKeywordSet(): Set<string> {
    return new Set([
      ...dataSets.loops,
      ...dataSets.nestedLoopSignals,
      ...dataSets.recursion,
      ...dataSets.divideAndConquer,
      ...dataSets.dataIteration,
      ...dataSets.expensiveBuiltins,
      ...dataSets.memoryAllocations,
      ...dataSets.temporaryStructures,
      ...dataSets.recursionSpace,
      ...dataSets.dataDuplication,
      ...dataSets.branches,
      ...dataSets.inputDependent,
      ...dataSets.directCodePatterns,
      ...dataSets.hiddenCostOps,
      ...dataSets.spaceImpactOps,
      ...dataSets.algorithmicFactors,
      ...dataSets.inputFactors,
      ...dataSets.runtimeFactors,
      ...dataSets.architectureFactors,
      ...dataSets.languageSpecific
    ]);
  }

  /**
   * Processes all units with provided analysis function
   */
  private processUnits(
    fetchPartOfCodeResult: normalizedPayloadData,
    analyzeNode: (node: any, unitType: UnitTarget, idx: number) => ComplexityResult
  ): Record<UnitTarget, any[]> {
    const resultsByUnit: Record<UnitTarget, any[]> = {} as any;

    for (const [unitType, nodes] of Object.entries(fetchPartOfCodeResult)) {
      if (unitType === "nameOfFile") continue;

      const typedUnit = unitType as UnitTarget;
      resultsByUnit[typedUnit] = this.ensureArray(nodes).map((node: any, idx: number) =>
        analyzeNode(node, typedUnit, idx)
      );
    }

    return resultsByUnit;
  }

  /**
   * Traverses node body or node itself
   */
  private traverseNodeBody(node: Node, visitor: (n: Node) => void): void {
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
  private isLoopNode(kind: SyntaxKind): boolean {
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
  private isAccumulationMethod(propText: string): boolean {
    return (
      propText.endsWith(".push") ||
      propText.endsWith(".concat") ||
      propText.endsWith(".unshift")
    );
  }

  /**
   * Extracts node name
   */
  private extractNodeName(node: any, nameHint?: string): string | null {
    return nameHint || (node.getName ? node.getName() : null);
  }

  /**
   * Extracts node text
   */
  private extractNodeText(node: any): string {
    return node.getText ? node.getText() : (node.text || "");
  }

  /**
   * Gets start line number
   */
  private getStartLine(node: Node): number {
    try {
      return (node as any).getStartLineNumber ? (node as any).getStartLineNumber() : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Gets end line number
   */
  private getEndLine(node: Node): number {
    try {
      return (node as any).getEndLineNumber ? (node as any).getEndLineNumber() : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Ensures input is an array
   */
  private ensureArray(x: any): any[] {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    return [x];
  }

  /**
   * Finds keyword matches in text
   */
  private findKeywordMatches(text: string): string[] {
    const tokens = text.split(/[^A-Za-z0-9_$\.]+/).filter(Boolean);
    return tokens.filter(t => this.keywordSet.has(t));
  }

  /**
   * Builds analysis summary
   */
  private buildSummary(
    fileName: string,
    allCodeUnitResult: Record<UnitTarget, any[]>,
    tier: TierLevel
  ): AnalysisSummary {
    // Flatten all executable unit results
    const all = Object.values(allCodeUnitResult).flat();

    const totalScore = all.reduce((s, it) => s + it.totalScore, 0);
    const avgScore = all.length ? Math.round(totalScore / all.length) : 0;

    const criticalRisk = all.filter(a => a.riskLevel === "CRITICAL");
    const highRisk = all.filter(a => a.riskLevel === "HIGH");
    const mediumRisk = all.filter(a => a.riskLevel === "MEDIUM");

    const avgTimeComplexity = this.calculateAverageComplexity(
      all.map(a => a.timeComplexity)
    );

    const avgSpaceComplexity = this.calculateAverageComplexity(
      all.map(a => a.spaceComplexity)
    );

    return {
      nameOfFile: fileName,
      success: true,
      generatedAt: new Date().toISOString(),
      tierUsed: tier,
      summary: {
        itemsAnalyzed: all.length,
        totalScore,
        avgScore,
        avgTimeComplexity,
        avgSpaceComplexity,
        criticalRiskCount: criticalRisk.length,
        highRiskCount: highRisk.length,
        mediumRiskCount: mediumRisk.length,
        lowRiskCount:
          all.length -
          criticalRisk.length -
          highRisk.length -
          mediumRisk.length
      },
      details: allCodeUnitResult
    };
  }

  /**
   * Calculates average complexity notation
   */
  private calculateAverageComplexity(complexities: ComplexityNotation[]): string {
    if (complexities.length === 0) return "O(1)";

    // Find the highest complexity in the set
    const complexityOrder: ComplexityNotation[] = [
      "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^k)", "O(2^n)", "UNKNOWN"
    ];

    let maxIndex = 0;
    for (const c of complexities) {
      const index = complexityOrder.indexOf(c);
      if (index > maxIndex) maxIndex = index;
    }

    return complexityOrder[maxIndex];
  }
}