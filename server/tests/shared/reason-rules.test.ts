import { describe, it, expect } from "@jest/globals";
import {
  matchRules,
  generateReasons,
  SHARED_TIME_RULES,
  SHARED_SPACE_RULES,
} from "../../src/compilers/shared/reason-rules.js";
import type {
  ComplexityProfile,
  SignalProfile,
  ReasonRule,
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

describe("reason-rules", () => {
  describe("matchRules", () => {
    it("should return empty array when no rules match", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const signals = createSignalProfile();
      const rules: ReasonRule[] = [];

      const matches = matchRules(rules, profile, signals);
      expect(matches).toEqual([]);
    });

    it("should return matching rules", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n²)",
        spaceNotation: "O(1)",
        timeScore: 7,
        spaceScore: 1,
      };
      const signals = createSignalProfile({
        nestedLoops: 2,
      });

      const matches = matchRules(SHARED_TIME_RULES, profile, signals);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should limit results to specified count", () => {
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
      });

      const matches = matchRules(SHARED_TIME_RULES, profile, signals, 2);
      expect(matches.length).toBeLessThanOrEqual(2);
    });

    it("should sort by priority descending", () => {
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
      });

      const matches = matchRules(SHARED_TIME_RULES, profile, signals);

      if (matches.length >= 2) {
        expect(matches[0].priority).toBeGreaterThanOrEqual(matches[1].priority);
      }
    });

    it("should include extra rules when provided", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const signals = createSignalProfile();
      const extraRules: ReasonRule[] = [
        {
          id: "custom-rule",
          timeNotation: "O(1)",
          condition: () => true,
          reason: "Custom reason",
          impact: "low",
          confidence: 90,
          priority: 100,
        },
      ];

      const matches = matchRules(extraRules, profile, signals);
      expect(matches.length).toBe(1);
      expect(matches[0].id).toBe("custom-rule");
    });
  });

  describe("generateReasons", () => {
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

      const reasons = generateReasons(profile, signals);

      const timeReasons = reasons.filter((r) => r.type === "time");
      const spaceReasons = reasons.filter((r) => r.type === "space");

      expect(timeReasons.length).toBeGreaterThan(0);
      expect(spaceReasons.length).toBeGreaterThan(0);
    });

    it("should merge extra time rules", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const signals = createSignalProfile();
      const extraTimeRules: ReasonRule[] = [
        {
          id: "extra-time",
          timeNotation: "O(1)",
          condition: () => true,
          reason: "Extra time reason",
          impact: "low",
          confidence: 95,
          priority: 100,
        },
      ];

      const reasons = generateReasons(profile, signals, extraTimeRules);

      const extraReason = reasons.find((r) => r.pattern === "extra-time");
      expect(extraReason).toBeDefined();
      expect(extraReason?.type).toBe("time");
    });

    it("should merge extra space rules", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(1)",
        spaceNotation: "O(1)",
        timeScore: 1,
        spaceScore: 1,
      };
      const signals = createSignalProfile();
      const extraSpaceRules: ReasonRule[] = [
        {
          id: "extra-space",
          spaceNotation: "O(1)",
          condition: () => true,
          reason: "Extra space reason",
          impact: "low",
          confidence: 95,
          priority: 100,
        },
      ];

      const reasons = generateReasons(profile, signals, [], extraSpaceRules);

      const extraReason = reasons.find((r) => r.pattern === "extra-space");
      expect(extraReason).toBeDefined();
      expect(extraReason?.type).toBe("space");
    });

    it("should handle complex signal profiles", () => {
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
        loopWithAllocation: true,
        hasSorting: true,
      });

      const reasons = generateReasons(profile, signals);

      expect(reasons.length).toBeGreaterThan(0);
      reasons.forEach((reason) => {
        expect(reason.confidence).toBeGreaterThan(0);
        expect(reason.confidence).toBeLessThanOrEqual(100);
      });
    });

    it("should validate notations in matched rules", () => {
      const profile: ComplexityProfile = {
        timeNotation: "O(n)",
        spaceNotation: "O(1)",
        timeScore: 4,
        spaceScore: 1,
      };
      const signals = createSignalProfile({
        loops: 1,
      });

      // Should not throw - validates notations internally
      expect(() => generateReasons(profile, signals)).not.toThrow();
    });
  });

  describe("SHARED_TIME_RULES", () => {
    it("should have rules with required properties", () => {
      SHARED_TIME_RULES.forEach((rule) => {
        expect(rule.id).toBeDefined();
        expect(rule.condition).toBeInstanceOf(Function);
        expect(rule.reason).toBeDefined();
        expect(rule.impact).toBeDefined();
        expect(rule.confidence).toBeGreaterThan(0);
        expect(rule.priority).toBeGreaterThan(0);
      });
    });

    it("should have unique rule IDs", () => {
      const ids = SHARED_TIME_RULES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("SHARED_SPACE_RULES", () => {
    it("should have rules with required properties", () => {
      SHARED_SPACE_RULES.forEach((rule) => {
        expect(rule.id).toBeDefined();
        expect(rule.condition).toBeInstanceOf(Function);
        expect(rule.reason).toBeDefined();
        expect(rule.impact).toBeDefined();
        expect(rule.confidence).toBeGreaterThan(0);
        expect(rule.priority).toBeGreaterThan(0);
      });
    });

    it("should have unique rule IDs", () => {
      const ids = SHARED_SPACE_RULES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
