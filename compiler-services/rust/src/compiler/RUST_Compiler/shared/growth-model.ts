// ============================================================================
// GROWTH MODEL & RESULT BUILDER
// Faithful port of steps 4-6 from enhanced-analyzer-v3-paid.ts.
// buildResult() adapted: takes plain params instead of ts-morph Node.
// ============================================================================

import { randomUUID } from "node:crypto";
import type {
  AnalysisSummary,
  ComplexityProfile,
  ComplexityReason,
  ComplexityResult,
  fetchUnitPartOfCodeArrayTargets,
  GrowthProfile,
  Risk,
  Uppercase_RiskLevelType,
} from "./interfaces.js";
import { ConfidenceStrategy } from "./complexity-utils.js";

// ============================================================================
// STEP 4 — MODEL GROWTH
// Weighted combination: time 70%, space 30%.
// ============================================================================
export function modelGrowth(profile: ComplexityProfile): GrowthProfile {
  const totalScore = Math.round(
    profile.timeScore * 0.7 + profile.spaceScore * 0.3
  );

  return {
    time: profile.timeNotation,
    space: profile.spaceNotation,
    timeScore: profile.timeScore,
    spaceScore: profile.spaceScore,
    totalScore,
    riskLevel: scoreToRisk(totalScore),
  };
}

// ============================================================================
// STEP 5 — COMPOSE GROWTH
// Clamp totalScore to [1, 10] and re-derive riskLevel.
// ============================================================================
export function composeGrowth(growth: GrowthProfile): GrowthProfile {
  const totalScore = Math.min(10, Math.max(1, growth.totalScore));
  return { ...growth, totalScore, riskLevel: scoreToRisk(totalScore) };
}

// ============================================================================
// STEP 6 — BUILD RESULT
// Adapted from buildResult() — accepts raw line numbers instead of ts-morph Node.
// ============================================================================

export interface BuildResultParams {
  kind: fetchUnitPartOfCodeArrayTargets;
  name: string | null;
  startLine: number;
  endLine: number;
  text: string;
}

export function buildResult(
  params: BuildResultParams,
  reasons: ComplexityReason[],
  data: GrowthProfile
): ComplexityResult {
  // Confidence — NO artificial cap for paid tier (mirrors "paid" path in original)
  const baseConfidence = ConfidenceStrategy.aggregateConfidence(reasons);
  const confidence = ConfidenceStrategy.applyFreeTierCap(
    baseConfidence,
    data.time,
    "paid"
  );

  return {
    id: randomUUID(),
    kind: params.kind,
    name: params.name,
    startLine: params.startLine,
    endLine: params.endLine,
    text: params.text,
    timeComplexity: {
      notation: data.time,
      confidence: 0,
      flags: ["not implemented"],
    },
    spaceComplexity: {
      notation: data.space,
      confidence: 0,
      flags: ["not implemented"],
    },
    timeScore: data.timeScore,
    spaceScore: data.spaceScore,
    totalScore: data.totalScore,
    riskLevel: data.riskLevel,
    matchedKeywords: [],
    reasons,
    tierUsed: "paid",
    confidence,
  };
}

// ============================================================================
// HELPER — scoreToRisk (mirrors private method in EnhancedAnalyzer_v2)
// ============================================================================
export function scoreToRisk(score: number): Risk {
  if (score <= 3) return "LOW";
  if (score <= 6) return "MEDIUM";
  return "HIGH";
}

// ============================================================================
// ANALYSIS SUMMARY BUILDER
// Aggregates a list of ComplexityResult[] into AnalysisSummary.
// Mirrors the shape produced by ComplexityOrchestrator_v1.executePaidTier().
// ============================================================================
export function buildAnalysisSummary(
  results: ComplexityResult[],
  fileName: string
): AnalysisSummary {
  const details: AnalysisSummary["details"] = {
    methods: [],
    functions: [],
    arrows: [],
    constructors: [],
    getters: [],
    setters: [],
    callbacks: [],
    handlers: [],
    staticBlocks: [],
    topLevelStatements: [],
  };

  for (const r of results) {
    details[r.kind].push(r);
  }

  const itemsAnalyzed = results.length;

  if (itemsAnalyzed === 0) {
    return {
      nameOfFile: fileName,
      success: false,
      generatedAt: new Date().toISOString(),
      tierUsed: "paid",
      summary: {
        itemsAnalyzed: 0,
        totalScore: 0,
        avgScore: 0,
        avgTimeComplexity: "O(1)",
        avgSpaceComplexity: "O(1)",
        criticalRiskCount: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      },
      details,
    };
  }

  const totalScore = results.reduce((acc, r) => acc + r.totalScore, 0);
  const avgScore = Math.round((totalScore / itemsAnalyzed) * 100) / 100;

  // Modal (most frequent) time and space complexity for summary strings
  const timeFreq = frequency(results.map((r) => r.timeComplexity.notation));
  const spaceFreq = frequency(results.map((r) => r.spaceComplexity.notation));
  const avgTimeComplexity = topKey(timeFreq);
  const avgSpaceComplexity = topKey(spaceFreq);

  const riskCounts = riskBuckets(results);

  return {
    nameOfFile: fileName,
    success: true,
    generatedAt: new Date().toISOString(),
    tierUsed: "paid",
    summary: {
      itemsAnalyzed,
      totalScore,
      avgScore,
      avgTimeComplexity,
      avgSpaceComplexity,
      criticalRiskCount: riskCounts.CRITICAL,
      highRiskCount: riskCounts.HIGH,
      mediumRiskCount: riskCounts.MEDIUM,
      lowRiskCount: riskCounts.LOW,
    },
    details,
  };
}

// ── private helpers ──────────────────────────────────────────────────────────

function frequency<T extends string>(items: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

function topKey<T extends string>(map: Map<T, number>): T | string {
  let best: T | undefined;
  let bestCount = -1;
  for (const [key, count] of map) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best ?? "O(1)";
}

function riskBuckets(
  results: ComplexityResult[]
): Record<Uppercase_RiskLevelType, number> {
  const counts: Record<Uppercase_RiskLevelType, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  for (const r of results) {
    counts[r.riskLevel]++;
  }
  return counts;
}
