import { Node } from "ts-morph";
import {
  AnalysisSummary,
  ComplexityNotation,
  ComplexityReason,
  ComplexityResult,
  PaidComplexityReason,
  TierLevel
} from "../../interfaces/complexityGeneratorInterface.js";
import { FastAnalyzer } from "./freeTierResources/fast_analyzer.js";
import { EnhancedAnalyzer } from "./paidTierResources/enhanced_analyzer.js";
import { dataSets } from "../../utils/datasets.js";
import { normalizedPayloadData } from "../complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { fetchUnitPartOfCodeArrayTargets } from "../../interfaces/fetchUnitPartOfCodeProps.js";

type UnitTarget = fetchUnitPartOfCodeArrayTargets;

export class ComplexityOrchestrator_v1 {
  private keywordSet: Set<string>;

  constructor(keywordSet?: Set<string>) {
    this.keywordSet = keywordSet || this.buildKeywordSet();
  }

  // ========================================
  // PUBLIC API - TIER SELECTION
  // ========================================

  public async executePaidTier(fetchPartOfCodeResult: normalizedPayloadData): Promise<AnalysisSummary> {
    return this.analyzeDeep(fetchPartOfCodeResult);
  }

  public async executeFreeTier(fetchPartOfCodeResult: normalizedPayloadData): Promise<AnalysisSummary> {
    return this.analyzeFast(fetchPartOfCodeResult);
  }

  // ========================================
  // TIER-SPECIFIC ANALYSIS
  // ========================================

  private async analyzeFast(
    fetchPartOfCodeResult: normalizedPayloadData
  ): Promise<AnalysisSummary> {
    const resultsByUnit = this.processUnits(
      fetchPartOfCodeResult,
      async (node, unitType, idx) => await this.analyzeFastNode(node, unitType, `${unitType}_${idx}`)
    );

    return this.buildSummary(
      fetchPartOfCodeResult.nameOfFile,
      resultsByUnit,
      "free"
    );
  }

  private async analyzeDeep(
    fetchPartOfCodeResult: normalizedPayloadData
  ): Promise<AnalysisSummary> {
    const resultsByUnit = this.processUnits(
      fetchPartOfCodeResult,
      async (node, unitType, idx) => await this.analyzeDeepNode(node, unitType, `${unitType}_${idx}`)
    );

    return this.buildSummary(
      fetchPartOfCodeResult.nameOfFile,
      resultsByUnit,
      "paid"
    );
  }

  // ========================================
  // FAST ANALYSIS (FREE TIER)
  // ========================================

  private async analyzeFastNode(
    node: any,
    kind: fetchUnitPartOfCodeArrayTargets,
    nameHint?: string
  ): Promise<ComplexityResult> {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    const fastResult = await FastAnalyzer.analyze(text, name || "", startLine);
    const matchedKeywords = await this.findKeywordMatches(text);

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

  // ========================================
  // DEEP ANALYSIS (PAID TIER)
  // ========================================

  private async analyzeDeepNode(
    node: Node,
    kind: fetchUnitPartOfCodeArrayTargets,
    nameHint?: string
  ): Promise<ComplexityResult> {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    const reasons: PaidComplexityReason[] = [];

    // Phase 1: Collect AST signals using EnhancedAnalyzer
    const asyncWeight = await EnhancedAnalyzer.detectAsyncPattern(node, startLine, reasons);
    const signals = await EnhancedAnalyzer.collectASTSignals(node, name, this.keywordSet);

    // Phase 2: Calculate scores from signals
    const scores = await EnhancedAnalyzer.calculateScores(signals, asyncWeight, startLine);

    // Phase 3: Classify complexity
    const classification = await EnhancedAnalyzer.classifyComplexity(signals, scores);

    const uniqueKeywords = Array.from(new Set(signals.matchedKeywords)) as string[];
    const aiReason = await EnhancedAnalyzer.generateAIReason(
      classification,
      signals)
    reasons.push(aiReason);

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
  // CLASSIFICATION LOGIC
  // ========================================


  // ========================================
  // HELPER METHODS
  // ========================================

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

  private processUnits(
    fetchPartOfCodeResult: normalizedPayloadData,
    analyzeNode: (node: any, unitType: UnitTarget, idx: number) => Promise<ComplexityResult>
  ): Record<UnitTarget, any[]> {
    const resultsByUnit: Record<UnitTarget, any[]> = {} as any;

    for (const [unitType, nodes] of Object.entries(fetchPartOfCodeResult)) {
      if (unitType === "nameOfFile") continue;

      const typedUnit = unitType as UnitTarget;
      resultsByUnit[typedUnit] = this.ensureArray(nodes).map(async (node: any, idx: number) =>
        await analyzeNode(node, typedUnit, idx)
      );
    }

    return resultsByUnit;
  }

  private extractNodeName(node: any, nameHint?: string): string | null {
    return nameHint || (node.getName ? node.getName() : null);
  }

  private extractNodeText(node: any): string {
    return node.getText ? node.getText() : (node.text || "");
  }

  private getStartLine(node: Node): number {
    try {
      return (node as any).getStartLineNumber ? (node as any).getStartLineNumber() : 0;
    } catch {
      return 0;
    }
  }

  private getEndLine(node: Node): number {
    try {
      return (node as any).getEndLineNumber ? (node as any).getEndLineNumber() : 0;
    } catch {
      return 0;
    }
  }

  private ensureArray(x: any): any[] {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    return [x];
  }

  private findKeywordMatches(text: string): string[] {
    const tokens = text.split(/[^A-Za-z0-9_$\.]+/).filter(Boolean);
    return tokens.filter(t => this.keywordSet.has(t));
  }

  private buildSummary(
    fileName: string,
    allCodeUnitResult: Record<UnitTarget, any[]>,
    tier: TierLevel
  ): AnalysisSummary {
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

  private calculateAverageComplexity(complexities: ComplexityNotation[]): string {
    if (complexities.length === 0) return "O(1).js";

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