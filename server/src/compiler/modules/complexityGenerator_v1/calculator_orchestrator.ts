import { Node } from "ts-morph";
import {
  AnalysisSummary,
  ComplexityNotation,
  ComplexityReason,
  ComplexityResult,
  TierLevel
} from "../../interfaces/complexityGeneratorInterface";
import { FastAnalyzer } from "./fast_analyzer";
import { EnhancedAnalyzer } from "./enhanced_analyzer";
import { dataSets } from "../../utils/datasets";
import { normalizedPayloadData } from "../complexityOrchestratorHelpers/complexityOrchestratorInterface";
import { fetchUnitPartOfCodeArrayTargets } from "../../interfaces/fetchUnitPartOfCodeProps";

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
      (node, unitType, idx) => this.analyzeFastNode(node, unitType, `${unitType}_${idx}`)
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
      (node, unitType, idx) => this.analyzeDeepNode(node, unitType, `${unitType}_${idx}`)
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

  private analyzeFastNode(
    node: any,
    kind: fetchUnitPartOfCodeArrayTargets,
    nameHint?: string
  ): ComplexityResult {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    const fastResult = FastAnalyzer.analyze(text, name || "", startLine);
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

  // ========================================
  // DEEP ANALYSIS (PAID TIER)
  // ========================================

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

    // Phase 1: Collect AST signals using EnhancedAnalyzer
    const asyncWeight = EnhancedAnalyzer.detectAsyncPattern(node, startLine, reasons);
    const signals = EnhancedAnalyzer.collectASTSignals(node, name, this.keywordSet);

    // Phase 2: Calculate scores from signals
    const scores = EnhancedAnalyzer.calculateScores(signals, asyncWeight, startLine, reasons);

    // Phase 3: Classify complexity
    const classification = EnhancedAnalyzer.classifyComplexity(signals, scores, reasons);

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
    if (complexities.length === 0) return "O(1)";

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