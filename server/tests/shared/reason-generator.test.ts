import { describe, it, expect } from "@jest/globals";
import { PaidTierReasonGenerator } from "../../src/compilers/shared/reason-generator.js";
import type {
  ComplexityProfile,
  SignalProfile,
} from "../../src/compilers/shared/interfaces.js";

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

describe("PaidTierReasonGenerator", () => {
  describe("getDetailedBreakdown", () => {
    it("should generate time and space reasons", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n²)",
        spaceNotation: "O(n)",
        timeScore: 7,
        spaceScore: 4,
      };
      const signals = createSignalProfile({
        nestedLoops: 2,
        loopWithAllocation: true,
      });

      const breakdown = PaidTierReasonGenerator.getDetailedBreakdown(profile, signals);

      expect(breakdown.time.reasons.length).toBeGreaterThan(0);
      expect(breakdown.space.reasons.length).toBeGreaterThan(0);
    });

    it("should include fallback messages when no rules match", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const signals = createSignalProfile();

      const breakdown = PaidTierReasonGenerator.getDetailedBreakdown(profile, signals);

      expect(breakdown.time.reasons.length).toBeGreaterThan(0);
      expect(breakdown.space.reasons.length).toBeGreaterThan(0);
    });

    it("should detect factorial pattern", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n!)",
        spaceNotation: "O(n)",
        timeScore: 10,
        spaceScore: 4,
      };
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
        hasFilterOrSlice: true,
      });

      const breakdown = PaidTierReasonGenerator.getDetailedBreakdown(profile, signals);

      const factorialReason = breakdown.time.reasons.find((r) =>
        r.includes("Factorial")
      );
      expect(factorialReason).toBeDefined();
    });

    it("should detect binary recursion pattern", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(2ⁿ)",
        spaceNotation: "O(n)",
        timeScore: 9,
        spaceScore: 4,
      };
      const signals = createSignalProfile({
        recursionDoubled: true,
      });

      const breakdown = PaidTierReasonGenerator.getDetailedBreakdown(profile, signals);

      const exponentialReason = breakdown.time.reasons.find((r) =>
        r.includes("Exponential")
      );
      expect(exponentialReason).toBeDefined();
    });
  });

  describe("generateReasons", () => {
    it("should return structured ComplexityReason objects", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n²)",
        spaceNotation: "O(1)",
        timeScore: 7,
        spaceScore: 1,
      };
      const signals = createSignalProfile({
        nestedLoops: 2,
      });

      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);

      expect(reasons.length).toBeGreaterThan(0);
      reasons.forEach((reason) => {
        expect(reason).toHaveProperty("type");
        expect(reason).toHaveProperty("detail");
        expect(reason).toHaveProperty("impact");
        expect(reason).toHaveProperty("confidence");
        expect(reason).toHaveProperty("pattern");
      });
    });

    it("should include time and space reasons", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n)",
        spaceNotation: "O(n)",
        timeScore: 4,
        spaceScore: 4,
      };
      const signals = createSignalProfile({
        loops: 1,
        recursion: true,
      });

      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);

      const timeReasons = reasons.filter((r) => r.type === "time");
      const spaceReasons = reasons.filter((r) => r.type === "space");

      expect(timeReasons.length).toBeGreaterThan(0);
      expect(spaceReasons.length).toBeGreaterThan(0);
    });

    it("should limit to top 3 reasons per category", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n³)",
        spaceNotation: "O(n²)",
        timeScore: 8,
        spaceScore: 7,
      };
      const signals = createSignalProfile({
        nestedLoops: 3,
        usesNestedDataStructures: true,
        loopWithAllocation: true,
        recursion: true,
        hasLoopInRecursion: true,
        hasFilterOrSlice: true,
      });

      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);

      const timeReasons = reasons.filter((r) => r.type === "time");
      const spaceReasons = reasons.filter((r) => r.type === "space");

      expect(timeReasons.length).toBeLessThanOrEqual(3);
      expect(spaceReasons.length).toBeLessThanOrEqual(3);
    });

    it("should sort reasons by priority (highest first)", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n!)",
        spaceNotation: "O(n²)",
        timeScore: 10,
        spaceScore: 7,
      };
      const signals = createSignalProfile({
        recursion: true,
        hasLoopInRecursion: true,
        hasFilterOrSlice: true,
        usesNestedDataStructures: true,
      });

      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);

      if (reasons.length >= 2) {
        expect(reasons[0].confidence).toBeGreaterThanOrEqual(reasons[1].confidence);
      }
    });
  });
});
