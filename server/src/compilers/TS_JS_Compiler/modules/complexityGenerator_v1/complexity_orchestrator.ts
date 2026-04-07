import { Node } from "ts-morph";
import {
  AnalysisSummary,
  ASTSignals,
  ComplexityClassification,
  ComplexityNotation,
  ComplexityResult,
  PaidComplexityReason,
  TierLevel
} from "../../interfaces/complexityGeneratorInterface.js";
import { FastAnalyzer } from "./freeTierResources/fast_analyzer.js";
import { normalizedPayloadData } from "../complexityOrchestratorHelpers/complexityOrchestratorInterface.js";
import { fetchUnitPartOfCodeArrayTargets } from "../../interfaces/fetchUnitPartOfCodeProps.js";
import { EnhancedAnalyzer_v2 } from "./paidTierResources/enhancedAnalyzer_v2.js";
import { tempManualStorage } from "../../../../disposable_files/manual-storge.js";

type UnitTarget = fetchUnitPartOfCodeArrayTargets;

export class ComplexityOrchestrator_v1 {
  private keywordSet: Set<string>;
  private enhancedAnalyzer: EnhancedAnalyzer_v2

  constructor(keywordSet: Set<string>, enhancedAnalyzer: EnhancedAnalyzer_v2) {
    this.keywordSet = keywordSet;
    this.enhancedAnalyzer = enhancedAnalyzer
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
    const resultsByUnit = await this.processUnits(
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
    const resultsByUnit = await this.processUnits(
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
    nameHint?: string,
  ): Promise<ComplexityResult> {
    const name = this.extractNodeName(node, nameHint);
    const startLine = this.getStartLine(node);
    const endLine = this.getEndLine(node);
    const text = this.extractNodeText(node);

    const reasons: PaidComplexityReason[] = [];



    /*//////////////////////////////////////////////////////////////
                          NEW VERSION IMPLEMENTATION
        //////////////////////////////////////////////////////////////*/


    const { success, result: newComplexityEnhancer } = this.enhancedAnalyzer.run(node, name, this.keywordSet)
    if (!success || newComplexityEnhancer == undefined) {
      throw new Error("Paid complexity failed to run")
    }

    return {
      id: `${name || "anon"}:${startLine}`,
      kind,
      name,
      startLine,
      endLine,
      text,
      timeComplexity: newComplexityEnhancer.timeComplexity,
      spaceComplexity: newComplexityEnhancer.spaceComplexity,
      timeScore: Math.round(newComplexityEnhancer.timeScore),
      spaceScore: Math.round(newComplexityEnhancer.spaceScore),
      totalScore: newComplexityEnhancer.totalScore,
      riskLevel: newComplexityEnhancer.riskLevel,
      confidence: newComplexityEnhancer.confidence,
      reasons,
      matchedKeywords: ["No key word added for now"],
      tierUsed: "paid"
    }
  }


  // ========================================
  // HELPER METHODS
  // ========================================



  private async processUnits(
    fetchPartOfCodeResult: normalizedPayloadData,
    analyzeNode: (node: any, unitType: UnitTarget, idx: number) => Promise<ComplexityResult>
  ): Promise<Record<UnitTarget, any[]>> {
    const resultsByUnit: Record<UnitTarget, any[]> = {} as any;

    for (const [unitType, nodes] of Object.entries(fetchPartOfCodeResult)) {
      if (unitType === "nameOfFile") continue;

      const typedUnit = unitType as UnitTarget;
      resultsByUnit[typedUnit] = await Promise.all(
        this.ensureArray(nodes).map((node, idx) =>
          analyzeNode(node, typedUnit, idx)
        )
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