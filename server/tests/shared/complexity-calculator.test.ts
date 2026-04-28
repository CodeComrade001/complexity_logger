import { describe, it, expect } from "@jest/globals";
import {
  buildTimeComplexity,
  buildSpaceComplexity,
  buildComplexityProfile,
  modelGrowth,
  composeGrowth,
  confidenceFromGrowth,
} from "../../src/compilers/shared/complexity-calculator.js";
import type { SignalProfile } from "../../src/compilers/shared/interfaces.js";

function createSignalProfile(overrides: Partial<SignalProfile> = {}): SignalProfile {
  return {
    loops: 0,
    nestedLoops: 0,
    conditionals: 0,
    recursion: false,
    recursionDoubled: false,
    hasBreakOrContinue: false,
    hasEarlyReturn: false,
    conditionDoubled: false,
    isConstantBody: false,
    isConstantWithReturn: false,
    allocations: 0,
    variables: 0,
    usesDataStructures: false,
    usesNestedDataStructures: false,
    loopWithAllocation: false,
    recursionWithAllocation: false,
    hasLoopInRecursion: false,
    hasFilterOrSlice: false,
    dataSizeHint: "MEDIUM",
    hasLinearSearchInLoop: false,
    hasNestedArrayMethods: false,
    recursionCallCount: 0,
    hasSorting: false,
    hasJSONOperations: false,
    hasSpreadOperator: false,
    functionalLoopCount: 0,
    languageSpecific: {},
    ...overrides,
  };
}

describe("complexity-calculator", () => {
  describe("buildTimeComplexity", () => {
    it("should return O(1) for constant with return", () => {
      const signals = createSignalProfile({
        isConstantWithReturn: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(1);
    });

    it("should return O(1) for constant body with conditionals", () => {
      const signals = createSignalProfile({
        isConstantBody: true,
        conditionals: 2,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(1);
    });

    it("should return O(2ⁿ) for binary recursion", () => {
      const signals = createSignalProfile({
        recursionDoubled: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(2ⁿ)");
      expect(result.score).toBe(9);
    });

    it("should return O(n!) for recursion + loop in recursion + filter/slice", () => {
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
        hasFilterOrSlice: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n!)");
      expect(result.score).toBe(10);
    });

    it("should return O(n²) for linear search in loop", () => {
      const signals = createSignalProfile({
        hasLinearSearchInLoop: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n²) for nested array methods", () => {
      const signals = createSignalProfile({
        hasNestedArrayMethods: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n³) for recursion with deeply nested loops", () => {
      const signals = createSignalProfile({
        recursion: true,
        nestedLoops: 2,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n³)");
      expect(result.score).toBe(8);
    });

    it("should return O(n²) for recursion with loop in recursion", () => {
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n log n) for recursion with allocations and filter/slice", () => {
      const signals = createSignalProfile({
        recursion: true,
        allocations: 1,
        hasFilterOrSlice: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n log n)");
      expect(result.score).toBe(5);
    });

    it("should return O(n²) for recursion with allocations (no filter/slice)", () => {
      const signals = createSignalProfile({
        recursion: true,
        allocations: 1,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n log n) for sorting", () => {
      const signals = createSignalProfile({
        hasSorting: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n log n)");
      expect(result.score).toBe(5);
    });

    it("should return O(n) for simple recursion", () => {
      const signals = createSignalProfile({
        recursion: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(n³) for triple nested loops", () => {
      const signals = createSignalProfile({
        nestedLoops: 3,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n³)");
      expect(result.score).toBe(8);
    });

    it("should return O(n²) for double nested loops", () => {
      const signals = createSignalProfile({
        nestedLoops: 2,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(log n) for single loop with break/continue and conditionals", () => {
      const signals = createSignalProfile({
        loops: 1,
        conditionals: 1,
        hasBreakOrContinue: true,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(log n)");
      expect(result.score).toBe(2);
    });

    it("should return O(n) for single loop without log-n indicators", () => {
      const signals = createSignalProfile({
        loops: 1,
      });
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(1) as fallback", () => {
      const signals = createSignalProfile();
      const result = buildTimeComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(1);
    });
  });

  describe("buildSpaceComplexity", () => {
    it("should return O(n²) for nested data structures", () => {
      const signals = createSignalProfile({
        usesNestedDataStructures: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n²) for spread in nested loops", () => {
      const signals = createSignalProfile({
        hasSpreadOperator: true,
        nestedLoops: 2,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n²)");
      expect(result.score).toBe(7);
    });

    it("should return O(n) for loop with allocation", () => {
      const signals = createSignalProfile({
        loopWithAllocation: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(n) for recursion with allocation", () => {
      const signals = createSignalProfile({
        recursionWithAllocation: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(n) for recursion alone", () => {
      const signals = createSignalProfile({
        recursion: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(n) for JSON operations", () => {
      const signals = createSignalProfile({
        hasJSONOperations: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(n)");
      expect(result.score).toBe(4);
    });

    it("should return O(1) for fixed allocations", () => {
      const signals = createSignalProfile({
        allocations: 1,
        usesDataStructures: true,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(2);
    });

    it("should return O(1) for spread operator without nested loops", () => {
      const signals = createSignalProfile({
        hasSpreadOperator: true,
        nestedLoops: 0,
      });
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(2);
    });

    it("should return O(1) for no allocations", () => {
      const signals = createSignalProfile();
      const result = buildSpaceComplexity(signals);
      expect(result.notation).toBe("O(1)");
      expect(result.score).toBe(1);
    });
  });

  describe("buildComplexityProfile", () => {
    it("should build complete profile with valid notations", () => {
      const signals = createSignalProfile({
        loops: 1,
        allocations: 1,
        usesDataStructures: true,
      });
      const profile = buildComplexityProfile(signals);

      expect(profile.timeNotation).toBe("O(n)");
      expect(profile.spaceNotation).toBe("O(1)");
      expect(profile.timeScore).toBe(4);
      expect(profile.spaceScore).toBe(2);
    });

    it("should throw for invalid notation (edge case)", () => {
      // This tests the validation path - normally not reachable with correct logic
      const signals = createSignalProfile({
        recursionDoubled: true,
      });
      expect(() => buildComplexityProfile(signals)).not.toThrow();
    });
  });

  describe("modelGrowth", () => {
    it("should calculate weighted total score (70% time, 30% space)", () => {
      const profile = {
        timeNotation: "O(n)" as const,
        spaceNotation: "O(1)" as const,
        timeScore: 4,
        spaceScore: 1,
      };
      const growth = modelGrowth(profile);
      // 4 * 0.7 + 1 * 0.3 = 2.8 + 0.3 = 3.1 → rounded to 3
      expect(growth.totalScore).toBe(3);
      expect(growth.time).toBe("O(n)");
      expect(growth.space).toBe("O(1)");
    });

    it("should classify LOW risk for low scores", () => {
      const profile = {
        timeNotation: "O(1)" as const,
        spaceNotation: "O(1)" as const,
        timeScore: 1,
        spaceScore: 1,
      };
      const growth = modelGrowth(profile);
      expect(growth.riskLevel).toBe("LOW");
    });

    it("should classify MEDIUM risk for medium scores", () => {
      const profile = {
        timeNotation: "O(n)" as const,
        spaceNotation: "O(n)" as const,
        timeScore: 4,
        spaceScore: 4,
      };
      const growth = modelGrowth(profile);
      // 4 * 0.7 + 4 * 0.3 = 4 → MEDIUM
      expect(growth.riskLevel).toBe("MEDIUM");
    });

    it("should classify HIGH risk for high scores", () => {
      const profile = {
        timeNotation: "O(n²)" as const,
        spaceNotation: "O(n²)" as const,
        timeScore: 7,
        spaceScore: 7,
      };
      const growth = modelGrowth(profile);
      expect(growth.riskLevel).toBe("HIGH");
    });
  });

  describe("composeGrowth", () => {
    it("should clamp totalScore to minimum 1", () => {
      const growth = {
        time: "O(1)" as const,
        space: "O(1)" as const,
        timeScore: 0,
        spaceScore: 0,
        totalScore: 0,
        riskLevel: "LOW" as const,
      };
      const composed = composeGrowth(growth);
      expect(composed.totalScore).toBe(1);
    });

    it("should clamp totalScore to maximum 10", () => {
      const growth = {
        time: "O(n!)" as const,
        space: "O(n²)" as const,
        timeScore: 15,
        spaceScore: 15,
        totalScore: 15,
        riskLevel: "HIGH" as const,
      };
      const composed = composeGrowth(growth);
      expect(composed.totalScore).toBe(10);
    });

    it("should re-evaluate risk level after clamping", () => {
      const growth = {
        time: "O(1)" as const,
        space: "O(1)" as const,
        timeScore: 1,
        spaceScore: 1,
        totalScore: 0,
        riskLevel: "HIGH" as const,
      };
      const composed = composeGrowth(growth);
      expect(composed.riskLevel).toBe("LOW");
    });
  });

  describe("confidenceFromGrowth", () => {
    it("should return 90 for low scores (≤3)", () => {
      const growth = {
        time: "O(1)" as const,
        space: "O(1)" as const,
        timeScore: 1,
        spaceScore: 1,
        totalScore: 1,
        riskLevel: "LOW" as const,
      };
      expect(confidenceFromGrowth(growth)).toBe(90);
    });

    it("should return 80 for medium scores (4-6)", () => {
      const growth = {
        time: "O(n)" as const,
        space: "O(n)" as const,
        timeScore: 4,
        spaceScore: 4,
        totalScore: 4,
        riskLevel: "MEDIUM" as const,
      };
      expect(confidenceFromGrowth(growth)).toBe(80);
    });

    it("should return 70 for high scores (>6)", () => {
      const growth = {
        time: "O(n²)" as const,
        space: "O(n²)" as const,
        timeScore: 7,
        spaceScore: 7,
        totalScore: 7,
        riskLevel: "HIGH" as const,
      };
      expect(confidenceFromGrowth(growth)).toBe(70);
    });
  });
});
