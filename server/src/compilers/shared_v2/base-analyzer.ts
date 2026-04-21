// ============================================================================
// BASE LANGUAGE ANALYZER
// Every language module extends this class.
// Provides: pipeline execution, result building, summary aggregation.
// Mirrors the structure of EnhancedAnalyzer_v2 from enhanced-analyzer-v3-paid.ts
// ============================================================================

import Parser from "tree-sitter";
import {
  AnalysisPayload,
  AnalysisSummary,
  CalculatorComplexityResult,
  CodeUnitType,
  ComplexityNotation,
  ComplexityReason,
  ComplexityResult,
  GrowthProfile,
  ILanguageAnalyzer,
  SignalProfile,
  SupportedLanguage,
  TierLevel,
} from "./interfaces.js";
import {
  buildComplexityProfile,
  composeGrowth,
  confidenceFromGrowth,
  modelGrowth,
} from "./complexity-calculator.js";
import { generateReasons, ReasonRule } from "./reason-rules.js";
import {
  ConfidenceStrategy,
  NotationValidator,
  RiskCalculator,
} from "./shared-utils.js";

export interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: CodeUnitType;
}

export abstract class BaseLanguageAnalyzer implements ILanguageAnalyzer {
  abstract readonly language: SupportedLanguage;

  // ── Subclasses implement these ───────────────────────────────────────────

  /** Return a fully initialized tree-sitter parser for this language. */
  protected abstract createParser(): Parser;

  /** Extract all top-level code units (functions, methods, etc.) from a source file. */
  protected abstract extractCodeUnits(tree: Parser.Tree, source: string): CodeUnit[];

  /** Extract signal profile from a single code unit node. */
  protected abstract extractSignals(
    node: Parser.SyntaxNode,
    source: string,
    functionName: string | null
  ): SignalProfile;

  /** Language-specific extra time rules (prepended to shared rules). */
  protected extraTimeRules(): ReasonRule[] {
    return [];
  }

  /** Language-specific extra space rules (prepended to shared rules). */
  protected extraSpaceRules(): ReasonRule[] {
    return [];
  }

  // ── Public API ───────────────────────────────────────────────────────────

  async analyze(payload: AnalysisPayload): Promise<AnalysisSummary> {
    const errors: string[] = [];
    const details: ComplexityResult[] = [];

    try {
      const parser = this.createParser();
      const tree = parser.parse(payload.sourceCode);

      const units = this.extractCodeUnits(tree, payload.sourceCode);

      for (const unit of units) {
        try {
          const result = this.analyzeUnit(
            unit,
            payload.sourceCode,
            payload.tier ?? "paid"
          );
          details.push(result);
        } catch (err) {
          errors.push(
            `Failed to analyze ${unit.kind} "${unit.name ?? "anon"}": ${(err as Error).message}`
          );
        }
      }
    } catch (err) {
      errors.push(`Parse error: ${(err as Error).message}`);
    }

    return this.buildSummary(
      payload.filePath,
      details,
      payload.tier ?? "paid",
      errors
    );
  }

  // ── Pipeline (mirrors enhanced-analyzer-v3-paid.ts run()) ────────────────

  protected analyzeUnit(
    unit: CodeUnit,
    source: string,
    tier: TierLevel
  ): ComplexityResult {
    // Step 1: Extract signals
    const signals = this.extractSignals(unit.node, source, unit.name);

    // Step 2: Build complexity profile
    const profile = buildComplexityProfile(signals);

    // Step 3: Generate reasons
    const reasons = generateReasons(
      profile,
      signals,
      this.extraTimeRules(),
      this.extraSpaceRules()
    );

    // Step 4: Model growth
    const growth = modelGrowth(profile);

    // Step 5: Compose (clamp + re-evaluate risk)
    const composed = composeGrowth(growth);

    // Step 6: Build result
    return this.buildResult(unit, signals, reasons, composed, tier);
  }

  protected buildResult(
    unit: CodeUnit,
    signals: SignalProfile,
    reasons: ComplexityReason[],
    data: GrowthProfile,
    tier: TierLevel
  ): ComplexityResult {
    const baseConfidence = ConfidenceStrategy.aggregateConfidence(reasons);
    const confidence = ConfidenceStrategy.applyFreeTierCap(
      baseConfidence,
      data.time,
      tier
    );

    const toCalcResult = (
      notation: ComplexityNotation
    ): CalculatorComplexityResult => ({
      notation,
      confidence,
      flags: [],
    });

    return {
      id: this.generateId(unit),
      kind: unit.kind,
      name: unit.name,
      startLine: unit.node.startPosition.row + 1,
      endLine: unit.node.endPosition.row + 1,
      text: unit.node.text,

      timeComplexity: toCalcResult(data.time),
      spaceComplexity: toCalcResult(data.space),

      timeScore: data.timeScore,
      spaceScore: data.spaceScore,
      totalScore: data.totalScore,
      riskLevel: RiskCalculator.fromScore(data.totalScore),
      confidence,

      reasons,
      matchedKeywords: [],
      signals,

      language: this.language,
      tierUsed: tier,
    };
  }

  protected buildSummary(
    filePath: string,
    details: ComplexityResult[],
    tier: TierLevel,
    errors: string[]
  ): AnalysisSummary {
    const totalScore = details.reduce((s, d) => s + d.totalScore, 0);
    const avgScore = details.length
      ? Math.round(totalScore / details.length)
      : 0;

    const critical = details.filter((d) => d.riskLevel === "CRITICAL").length;
    const high = details.filter((d) => d.riskLevel === "HIGH").length;
    const medium = details.filter((d) => d.riskLevel === "MEDIUM").length;
    const low = details.length - critical - high - medium;

    const avgTimeComplexity = NotationValidator.worstCase(
      details.map((d) => d.timeComplexity.notation)
    );
    const avgSpaceComplexity = NotationValidator.worstCase(
      details.map((d) => d.spaceComplexity.notation)
    );

    return {
      nameOfFile: filePath,
      language: this.language,
      success: errors.length === 0 || details.length > 0,
      generatedAt: new Date().toISOString(),
      tierUsed: tier,
      summary: {
        itemsAnalyzed: details.length,
        totalScore,
        avgScore,
        avgTimeComplexity,
        avgSpaceComplexity,
        criticalRiskCount: critical,
        highRiskCount: high,
        mediumRiskCount: medium,
        lowRiskCount: low,
      },
      details,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private generateId(unit: CodeUnit): string {
    const name = unit.name ?? "anon";
    const line = unit.node.startPosition.row + 1;
    return `${this.language}:${unit.kind}:${name}:${line}`;
  }
}
