import { describe, it, expect } from "@jest/globals";
import { buildComplexityProfile } from "../../src/compilers/shared/profile-builder.js";
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

describe("profile-builder", () => {
  describe("buildComplexityProfile", () => {
    it("should return O(1) time for constant body", () => {
      const signals = createSignalProfile({
        isConstantWithReturn: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(1)");
      expect(profile.timeScore).toBe(1);
    });

    it("should return O(1) time for constant body with conditionals", () => {
      const signals = createSignalProfile({
        isConstantBody: true,
        conditionals: 2,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(1)");
      expect(profile.timeScore).toBe(1);
    });

    it("should return O(2ⁿ) for binary recursion", () => {
      const signals = createSignalProfile({
        recursionDoubled: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(2ⁿ)");
      expect(profile.timeScore).toBe(9);
    });

    it("should return O(n!) for factorial pattern", () => {
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
        hasFilterOrSlice: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n!)");
      expect(profile.timeScore).toBe(10);
    });

    it("should return O(n²) for linear search in loop", () => {
      const signals = createSignalProfile({
        hasLinearSearchInLoop: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n²)");
      expect(profile.timeScore).toBe(7);
    });

    it("should return O(n²) for nested array methods", () => {
      const signals = createSignalProfile({
        hasNestedArrayMethods: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n²)");
      expect(profile.timeScore).toBe(7);
    });

    it("should return O(n³) for recursion + nested loops ≥2", () => {
      const signals = createSignalProfile({
        recursion: true,
        nestedLoops: 2,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n³)");
      expect(profile.timeScore).toBe(8);
    });

    it("should return O(n²) for recursion + loop in recursion", () => {
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n²)");
      expect(profile.timeScore).toBe(7);
    });

    it("should return O(n log n) for recursion + allocations + filter/slice", () => {
      const signals = createSignalProfile({
        recursion: true,
        allocations: 1,
        hasFilterOrSlice: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n log n)");
      expect(profile.timeScore).toBe(5);
    });

    it("should return O(n²) for recursion + allocations (no filter/slice)", () => {
      const signals = createSignalProfile({
        recursion: true,
        allocations: 1,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n²)");
      expect(profile.timeScore).toBe(7);
    });

    it("should return O(n log n) for sorting", () => {
      const signals = createSignalProfile({
        hasSorting: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n log n)");
      expect(profile.timeScore).toBe(5);
    });

    it("should return O(n) for simple recursion", () => {
      const signals = createSignalProfile({
        recursion: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n)");
      expect(profile.timeScore).toBe(4);
    });

    it("should return O(n³) for triple nested loops", () => {
      const signals = createSignalProfile({
        nestedLoops: 3,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n³)");
      expect(profile.timeScore).toBe(8);
    });

    it("should return O(n²) for double nested loops", () => {
      const signals = createSignalProfile({
        nestedLoops: 2,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n²)");
      expect(profile.timeScore).toBe(7);
    });

    it("should return O(log n) for single loop with early exit pattern", () => {
      const signals = createSignalProfile({
        loops: 1,
        conditionals: 1,
        hasBreakOrContinue: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(log n)");
      expect(profile.timeScore).toBe(2);
    });

    it("should return O(n) for single loop without exit pattern", () => {
      const signals = createSignalProfile({
        loops: 1,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(n)");
      expect(profile.timeScore).toBe(4);
    });

    it("should return O(1) fallback", () => {
      const signals = createSignalProfile();
      const profile = buildComplexityProfile(signals);
      expect(profile.timeNotation).toBe("O(1)");
      expect(profile.timeScore).toBe(1);
    });

    // Space complexity tests
    it("should return O(n²) space for nested data structures", () => {
      const signals = createSignalProfile({
        usesNestedDataStructures: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n²)");
      expect(profile.spaceScore).toBe(7);
    });

    it("should return O(n²) space for spread in nested loops", () => {
      const signals = createSignalProfile({
        hasSpreadOperator: true,
        nestedLoops: 2,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n²)");
      expect(profile.spaceScore).toBe(7);
    });

    it("should return O(n) space for loop with allocation", () => {
      const signals = createSignalProfile({
        loopWithAllocation: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n)");
      expect(profile.spaceScore).toBe(4);
    });

    it("should return O(n) space for recursion with allocation", () => {
      const signals = createSignalProfile({
        recursionWithAllocation: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n)");
      expect(profile.spaceScore).toBe(4);
    });

    it("should return O(n) space for recursion alone", () => {
      const signals = createSignalProfile({
        recursion: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n)");
      expect(profile.spaceScore).toBe(4);
    });

    it("should return O(n) space for JSON operations", () => {
      const signals = createSignalProfile({
        hasJSONOperations: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(n)");
      expect(profile.spaceScore).toBe(4);
    });

    it("should return O(1) space for fixed allocations", () => {
      const signals = createSignalProfile({
        allocations: 1,
        usesDataStructures: true,
      });
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(1)");
      expect(profile.spaceScore).toBe(2);
    });

    it("should return O(1) space for no allocations", () => {
      const signals = createSignalProfile();
      const profile = buildComplexityProfile(signals);
      expect(profile.spaceNotation).toBe("O(1)");
      expect(profile.spaceScore).toBe(1);
    });

    it("should validate notations and not throw", () => {
      const signals = createSignalProfile({
        loops: 1,
        allocations: 1,
        usesDataStructures: true,
      });
      expect(() => buildComplexityProfile(signals)).not.toThrow();
    });
  });
});
