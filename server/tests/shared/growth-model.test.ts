import { describe, it, expect, jest } from "@jest/globals";
import {
  modelGrowth,
  composeGrowth,
  buildResult,
  buildAnalysisSummary,
  scoreToRisk,
} from "../../src/compilers/shared/growth-model.js";
import type {
  ComplexityProfile,
  ComplexityReason,
  ComplexityResult,
  GrowthProfile,
} from "../../src/compilers/shared/interfaces.js";

// Mock crypto.randomUUID
jest.mock("node:crypto", () => ({
  randomUUID: jest.fn().mockReturnValue("test-uuid-123"),
}));

describe("growth-model", () => {
  describe("modelGrowth", () => {
    it("should calculate weighted total score (70% time + 30% space)", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n)",
        spaceNotation: "O(1)",
        timeScore: 4,
        spaceScore: 1,
      };
      const growth = modelGrowth(profile);
      // 4 * 0.7 + 1 * 0.3 = 2.8 + 0.3 = 3.1 → rounded to 3
      expect(growth.totalScore).toBe(3);
      expect(growth.time).toBe("O(n)");
      expect(growth.space).toBe("O(1)");
      expect(growth.timeScore).toBe(4);
      expect(growth.spaceScore).toBe(1);
    });

    it("should classify LOW risk for score ≤3", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const growth = modelGrowth(profile);
      expect(growth.riskLevel).toBe("LOW");
    });

    it("should classify MEDIUM risk for score 4-6", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n)",
        spaceNotation: "O(n)",
        timeScore: 4,
        spaceScore: 4,
      };
      const growth = modelGrowth(profile);
      expect(growth.riskLevel).toBe("MEDIUM");
    });

    it("should classify HIGH risk for score >6", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n²)",
        spaceNotation: "O(n²)",
        timeScore: 7,
        spaceScore: 7,
      };
      const growth = modelGrowth(profile);
      expect(growth.riskLevel).toBe("HIGH");
    });

    it("should handle edge case scores correctly", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n log n)",
        spaceNotation: "O(n)",
        timeScore: 5,
        spaceScore: 4,
      };
      const growth = modelGrowth(profile);
      // 5 * 0.7 + 4 * 0.3 = 3.5 + 1.2 = 4.7 → rounded to 5
      expect(growth.totalScore).toBe(5);
      expect(growth.riskLevel).toBe("MEDIUM");
    });
  });

  describe("composeGrowth", () => {
    it("should clamp totalScore to minimum 1", () => {
      const growth: GrowthProfile = {
        time: "O(1)",
        space: "O(1)",
        timeScore: 0,
        spaceScore: 0,
        totalScore: 0,
        riskLevel: "LOW",
      };
      const composed = composeGrowth(growth);
      expect(composed.totalScore).toBe(1);
      expect(composed.riskLevel).toBe("LOW");
    });

    it("should clamp totalScore to maximum 10", () => {
      const growth: GrowthProfile = {
        time: "O(n!)",
        space: "O(n²)",
        timeScore: 15,
        spaceScore: 15,
        totalScore: 15,
        riskLevel: "HIGH",
      };
      const composed = composeGrowth(growth);
      expect(composed.totalScore).toBe(10);
      expect(composed.riskLevel).toBe("HIGH");
    });

    it("should preserve other fields when clamping", () => {
      const growth: GrowthProfile = {
        time: "O(n)",
        space: "O(n)",
        timeScore: 4,
        spaceScore: 4,
        totalScore: 4,
        riskLevel: "MEDIUM",
      };
      const composed = composeGrowth(growth);
      expect(composed.time).toBe("O(n)");
      expect(composed.space).toBe("O(n)");
      expect(composed.timeScore).toBe(4);
      expect(composed.spaceScore).toBe(4);
    });

    it("should re-evaluate risk after clamping down", () => {
      const growth: GrowthProfile = {
        time: "O(1)",
        space: "O(1)",
        timeScore: 1,
        spaceScore: 1,
        totalScore: 0,
        riskLevel: "HIGH",
      };
      const composed = composeGrowth(growth);
      expect(composed.riskLevel).toBe("LOW");
    });
  });

  describe("buildResult", () => {
    it("should build a complete ComplexityResult", () => {
      const params = {
        kind: "functions" as const,
        name: "testFunction",
        startLine: 10,
        endLine: 20,
        text: "function testFunction() { return 1; }",
      };
      const reasons: ComplexityReason[] = [
        {
          type: "time",
          detail: "Constant time operation",
          impact: "low",
          confidence: 95,
        },
      ];
      const data: GrowthProfile = {
        time: "O(1)",
        space: "O(1)",
        timeScore: 1,
        spaceScore: 1,
        totalScore: 1,
        riskLevel: "LOW",
      };

      const result = buildResult(params, reasons, data);

      expect(result.id).toBe("test-uuid-123");
      expect(result.kind).toBe("functions");
      expect(result.name).toBe("testFunction");
      expect(result.startLine).toBe(10);
      expect(result.endLine).toBe(20);
      expect(result.text).toBe("function testFunction() { return 1; }");
      expect(result.timeComplexity.notation).toBe("O(1)");
      expect(result.spaceComplexity.notation).toBe("O(1)");
      expect(result.timeScore).toBe(1);
      expect(result.spaceScore).toBe(1);
      expect(result.totalScore).toBe(1);
      expect(result.riskLevel).toBe("LOW");
      expect(result.confidence).toBe(95);
      expect(result.reasons).toEqual(reasons);
      expect(result.tierUsed).toBe("paid");
      expect(result.matchedKeywords).toEqual([]);
    });

    it("should apply free tier cap when appropriate", () => {
      const params = {
        kind: "methods" as const,
        name: "loopFunc",
        startLine: 1,
        endLine: 5,
        text: "for (let i = 0; i < n; i++) {}",
      };
      const reasons: ComplexityReason[] = [
        {
          type: "time",
          detail: "Linear iteration",
          impact: "low",
          confidence: 95,
        },
      ];
      const data: GrowthProfile = {
        time: "O(n)",
        space: "O(1)",
        timeScore: 4,
        spaceScore: 1,
        totalScore: 3,
        riskLevel: "LOW",
      };

      const result = buildResult(params, reasons, data);
      expect(result.confidence).toBe(95);
    });

    it("should handle null function name", () => {
      const params = {
        kind: "arrows" as const,
        name: null,
        startLine: 1,
        endLine: 3,
        text: "() => 1",
      };
      const reasons: ComplexityReason[] = [];
      const data: GrowthProfile = {
        time: "O(1)",
        space: "O(1)",
        timeScore: 1,
        spaceScore: 1,
        totalScore: 1,
        riskLevel: "LOW",
      };

      const result = buildResult(params, reasons, data);
      expect(result.name).toBeNull();
    });
  });

  describe("buildAnalysisSummary", () => {
    it("should build summary with empty results", () => {
      const summary = buildAnalysisSummary([], "test.ts");

      expect(summary.nameOfFile).toBe("test.ts");
      expect(summary.success).toBe(false);
      expect(summary.summary.itemsAnalyzed).toBe(0);
      expect(summary.summary.totalScore).toBe(0);
      expect(summary.summary.avgScore).toBe(0);
    });

    it("should aggregate results by kind", () => {
      const results: ComplexityResult[] = [
        {
          id: "1",
          kind: "functions",
          name: "func1",
          startLine: 1,
          endLine: 5,
          text: "function func1() {}",
          timeComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          timeScore: 1,
          spaceScore: 1,
          totalScore: 1,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "2",
          kind: "methods",
          name: "method1",
          startLine: 10,
          endLine: 15,
          text: "method1() {}",
          timeComplexity: { notation: "O(n)", confidence: 80, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 80, flags: [] },
          timeScore: 4,
          spaceScore: 1,
          totalScore: 3,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
      ];

      const summary = buildAnalysisSummary(results, "test.ts");

      expect(summary.success).toBe(true);
      expect(summary.summary.itemsAnalyzed).toBe(2);
      expect(summary.summary.totalScore).toBe(4);
      expect(summary.summary.avgScore).toBe(2);
      expect(summary.details.functions.length).toBe(1);
      expect(summary.details.methods.length).toBe(1);
    });

    it("should count risk levels correctly", () => {
      const results: ComplexityResult[] = [
        {
          id: "1",
          kind: "functions",
          name: "low",
          startLine: 1,
          endLine: 2,
          text: "",
          timeComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          timeScore: 1,
          spaceScore: 1,
          totalScore: 1,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "2",
          kind: "functions",
          name: "medium",
          startLine: 3,
          endLine: 4,
          text: "",
          timeComplexity: { notation: "O(n)", confidence: 80, flags: [] },
          spaceComplexity: { notation: "O(n)", confidence: 80, flags: [] },
          timeScore: 4,
          spaceScore: 4,
          totalScore: 4,
          riskLevel: "MEDIUM",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "3",
          kind: "functions",
          name: "high",
          startLine: 5,
          endLine: 6,
          text: "",
          timeComplexity: { notation: "O(n²)", confidence: 70, flags: [] },
          spaceComplexity: { notation: "O(n²)", confidence: 70, flags: [] },
          timeScore: 7,
          spaceScore: 7,
          totalScore: 7,
          riskLevel: "HIGH",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "4",
          kind: "functions",
          name: "critical",
          startLine: 7,
          endLine: 8,
          text: "",
          timeComplexity: { notation: "O(n!)", confidence: 60, flags: [] },
          spaceComplexity: { notation: "O(n²)", confidence: 60, flags: [] },
          timeScore: 10,
          spaceScore: 7,
          totalScore: 9,
          riskLevel: "CRITICAL",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
      ];

      const summary = buildAnalysisSummary(results, "test.ts");

      expect(summary.summary.lowRiskCount).toBe(1);
      expect(summary.summary.mediumRiskCount).toBe(1);
      expect(summary.summary.highRiskCount).toBe(1);
      expect(summary.summary.criticalRiskCount).toBe(1);
    });

    it("should calculate modal average complexities", () => {
      const results: ComplexityResult[] = [
        {
          id: "1",
          kind: "functions",
          name: "f1",
          startLine: 1,
          endLine: 2,
          text: "",
          timeComplexity: { notation: "O(n)", confidence: 80, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          timeScore: 4,
          spaceScore: 1,
          totalScore: 3,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "2",
          kind: "functions",
          name: "f2",
          startLine: 3,
          endLine: 4,
          text: "",
          timeComplexity: { notation: "O(n)", confidence: 80, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          timeScore: 4,
          spaceScore: 1,
          totalScore: 3,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
        {
          id: "3",
          kind: "functions",
          name: "f3",
          startLine: 5,
          endLine: 6,
          text: "",
          timeComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          spaceComplexity: { notation: "O(1)", confidence: 90, flags: [] },
          timeScore: 1,
          spaceScore: 1,
          totalScore: 1,
          riskLevel: "LOW",
          reasons: [],
          matchedKeywords: [],
          tierUsed: "paid",
        },
      ];

      const summary = buildAnalysisSummary(results, "test.ts");

      expect(summary.summary.avgTimeComplexity).toBe("O(n)");
      expect(summary.summary.avgSpaceComplexity).toBe("O(1)");
    });

    it("should include generated timestamp", () => {
      const before = new Date().toISOString();
      const summary = buildAnalysisSummary([], "test.ts");
      const after = new Date().toISOString();

      expect(summary.generatedAt >= before).toBe(true);
      expect(summary.generatedAt <= after).toBe(true);
    });
  });

  describe("scoreToRisk", () => {
    it("should return LOW for score ≤3", () => {
      expect(scoreToRisk(1)).toBe("LOW");
      expect(scoreToRisk(3)).toBe("LOW");
    });

    it("should return MEDIUM for score 4-6", () => {
      expect(scoreToRisk(4)).toBe("MEDIUM");
      expect(scoreToRisk(6)).toBe("MEDIUM");
    });

    it("should return HIGH for score >6", () => {
      expect(scoreToRisk(7)).toBe("HIGH");
      expect(scoreToRisk(10)).toBe("HIGH");
    });
  });
});
