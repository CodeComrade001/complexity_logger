import { describe, it, expect, jest } from "@jest/globals";
import {
  LoopDepthAnalyzer,
  ConfidenceStrategy,
  NotationValidator,
  InputValidator,
  RiskCalculator,
  createBlankSignalProfile,
} from "../../src/compilers/shared/shared-utils.js";
import type { ComplexityNotation } from "../../src/compilers/shared/interfaces.js";

describe("shared-utils", () => {
  describe("LoopDepthAnalyzer", () => {
    describe("estimateLoopNestingDepth", () => {
      it("should return 0 for code with no loops", () => {
        const code = "function foo() { return 1; }";
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(0);
      });

      it("should return 1 for single loop", () => {
        const code = `
          function foo() {
            for (let i = 0; i < n; i++) {
              console.log(i);
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should return 2 for nested loops", () => {
        const code = `
          function foo() {
            for (let i = 0; i < n; i++) {
              for (let j = 0; j < n; j++) {
                console.log(i, j);
              }
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(2);
      });

      it("should handle while loops", () => {
        const code = `
          function foo() {
            while (condition) {
              doSomething();
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should handle do-while loops", () => {
        const code = `
          function foo() {
            do {
              something();
            } while (condition);
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should not count non-loop braces", () => {
        const code = `
          function foo() {
            if (condition) {
              for (let i = 0; i < n; i++) {
                console.log(i);
              }
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should ignore comments in code", () => {
        const code = `
          function foo() {
            // for loop commented out
            /* while (true) { */
            for (let i = 0; i < n; i++) {
              console.log(i);
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should ignore strings containing loop keywords", () => {
        const code = `
          function foo() {
            const msg = "for your information";
            for (let i = 0; i < n; i++) {
              console.log("while you wait");
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should handle functional loops", () => {
        const code = `
          function foo() {
            arr.forEach(item => {
              console.log(item);
            });
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(1);
      });

      it("should handle custom loop keywords", () => {
        const code = `
          function foo() {
            foreach item in collection {
              process(item);
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(
          code,
          ["foreach", "loop"]
        );
        expect(depth).toBe(1);
      });

      it("should handle indent-based nesting (Python-style)", () => {
        const code = `
def foo():
    for i in range(n):
        for j in range(n):
            print(i, j)
`;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(
          code,
          ["for", "while"],
          "#",
          "indent"
        );
        expect(depth).toBe(2);
      });
    });

    describe("countFunctionalLoops", () => {
      it("should count functional loop patterns", () => {
        const code = "arr.map(x => x).filter(x => x).reduce((a, b) => a + b)";
        const count = LoopDepthAnalyzer.countFunctionalLoops(code);
        expect(count).toBe(3);
      });

      it("should return 0 when no functional loops", () => {
        const code = "function foo() { return 1; }";
        const count = LoopDepthAnalyzer.countFunctionalLoops(code);
        expect(count).toBe(0);
      });

      it("should handle custom functional patterns", () => {
        const code = "arr.flatMap(x => [x, x]).forEach(console.log)";
        const count = LoopDepthAnalyzer.countFunctionalLoops(code, [
          "flatMap",
          "forEach",
        ]);
        expect(count).toBe(2);
      });
    });

    describe("hasLinearSearchMethod", () => {
      it("should detect includes method", () => {
        const code = "arr.includes(target)";
        expect(LoopDepthAnalyzer.hasLinearSearchMethod(code)).toBe(true);
      });

      it("should detect indexOf method", () => {
        const code = "str.indexOf(substr)";
        expect(LoopDepthAnalyzer.hasLinearSearchMethod(code)).toBe(true);
      });

      it("should detect find method", () => {
        const code = "arr.find(predicate)";
        expect(LoopDepthAnalyzer.hasLinearSearchMethod(code)).toBe(true);
      });

      it("should return false when no search methods", () => {
        const code = "arr.map(x => x * 2)";
        expect(LoopDepthAnalyzer.hasLinearSearchMethod(code)).toBe(false);
      });

      it("should handle custom search methods", () => {
        const code = "arr.contains(target)";
        expect(
          LoopDepthAnalyzer.hasLinearSearchMethod(code, ["contains"])
        ).toBe(true);
      });
    });
  });

  describe("ConfidenceStrategy", () => {
    describe("applyFreeTierCap", () => {
      it("should not cap for paid tier", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(95, "O(n²)", "paid");
        expect(result).toBe(95);
      });

      it("should cap O(1) to 85 for free tier", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(95, "O(1)", "free");
        expect(result).toBe(85);
      });

      it("should cap O(log n) to 75 for free tier", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(90, "O(log n)", "free");
        expect(result).toBe(75);
      });

      it("should cap O(n) to 75 for free tier", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(90, "O(n)", "free");
        expect(result).toBe(75);
      });

      it("should cap complex notations to 70 for free tier", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(90, "O(n²)", "free");
        expect(result).toBe(70);
      });

      it("should not raise confidence above input", () => {
        const result = ConfidenceStrategy.applyFreeTierCap(60, "O(1)", "free");
        expect(result).toBe(60);
      });
    });

    describe("aggregateConfidence", () => {
      it("should return max confidence from reasons", () => {
        const reasons = [
          { confidence: 70, detail: "low", type: "time" as const, impact: "low" as const },
          { confidence: 90, detail: "high", type: "time" as const, impact: "high" as const },
          { confidence: 80, detail: "med", type: "space" as const, impact: "medium" as const },
        ];
        const result = ConfidenceStrategy.aggregateConfidence(reasons);
        expect(result).toBe(90);
      });

      it("should return 50 for empty reasons array", () => {
        const result = ConfidenceStrategy.aggregateConfidence([]);
        expect(result).toBe(50);
      });

      it("should handle single reason", () => {
        const reasons = [
          { confidence: 75, detail: "test", type: "time" as const, impact: "low" as const },
        ];
        const result = ConfidenceStrategy.aggregateConfidence(reasons);
        expect(result).toBe(75);
      });
    });
  });

  describe("NotationValidator", () => {
    describe("validate", () => {
      it("should not throw for valid notations", () => {
        const validNotations: ComplexityNotation[] = [
          "O(1)",
          "O(log n)",
          "O(n)",
          "O(n log n)",
          "O(n²)",
          "O(n³)",
          "O(2ⁿ)",
          "O(n!)",
          "UNKNOWN",
        ];
        validNotations.forEach((n) => {
          expect(() => NotationValidator.validate(n)).not.toThrow();
        });
      });

      it("should throw for invalid notation", () => {
        expect(() => NotationValidator.validate("O(n^4)" as ComplexityNotation)).toThrow(
          'Invalid ComplexityNotation: "O(n^4)"'
        );
      });
    });

    describe("scoreToNotation", () => {
      it("should map scores to correct notations", () => {
        expect(NotationValidator.scoreToNotation(0)).toBe("O(1)");
        expect(NotationValidator.scoreToNotation(1)).toBe("O(1)");
        expect(NotationValidator.scoreToNotation(2)).toBe("O(log n)");
        expect(NotationValidator.scoreToNotation(3)).toBe("O(n)");
        expect(NotationValidator.scoreToNotation(4)).toBe("O(n)");
        expect(NotationValidator.scoreToNotation(5)).toBe("O(n log n)");
        expect(NotationValidator.scoreToNotation(6)).toBe("O(n²)");
        expect(NotationValidator.scoreToNotation(7)).toBe("O(n²)");
        expect(NotationValidator.scoreToNotation(8)).toBe("O(n³)");
        expect(NotationValidator.scoreToNotation(9)).toBe("O(2ⁿ)");
        expect(NotationValidator.scoreToNotation(10)).toBe("O(n!)");
        expect(NotationValidator.scoreToNotation(15)).toBe("O(n!)");
      });
    });

    describe("notationToScore", () => {
      it("should map notations to correct scores", () => {
        expect(NotationValidator.notationToScore("O(1)")).toBe(1);
        expect(NotationValidator.notationToScore("O(log n)")).toBe(2);
        expect(NotationValidator.notationToScore("O(sqrt n)")).toBe(3);
        expect(NotationValidator.notationToScore("O(n)")).toBe(4);
        expect(NotationValidator.notationToScore("O(n log n)")).toBe(5);
        expect(NotationValidator.notationToScore("O(n²)")).toBe(7);
        expect(NotationValidator.notationToScore("O(n³)")).toBe(8);
        expect(NotationValidator.notationToScore("O(2ⁿ)")).toBe(9);
        expect(NotationValidator.notationToScore("O(n!)")).toBe(10);
        expect(NotationValidator.notationToScore("UNKNOWN")).toBe(5);
      });

      it("should return default score for unknown notation", () => {
        expect(NotationValidator.notationToScore("O(n^4)" as ComplexityNotation)).toBe(5);
      });
    });

    describe("worstCase", () => {
      it("should return O(1) for empty array", () => {
        expect(NotationValidator.worstCase([])).toBe("O(1)");
      });

      it("should return the worst notation from a list", () => {
        const notations: ComplexityNotation[] = ["O(1)", "O(n)", "O(n²)"];
        expect(NotationValidator.worstCase(notations)).toBe("O(n²)");
      });

      it("should handle single notation", () => {
        expect(NotationValidator.worstCase(["O(n)"])).toBe("O(n)");
      });

      it("should handle all same notations", () => {
        const notations: ComplexityNotation[] = ["O(n)", "O(n)", "O(n)"];
        expect(NotationValidator.worstCase(notations)).toBe("O(n)");
      });
    });
  });

  describe("InputValidator", () => {
    describe("validateLoopDepth", () => {
      it("should return valid depth", () => {
        expect(InputValidator.validateLoopDepth(3)).toBe(3);
      });

      it("should cap depth at 30", () => {
        expect(InputValidator.validateLoopDepth(50)).toBe(30);
      });

      it("should handle negative depth", () => {
        expect(InputValidator.validateLoopDepth(-5)).toBe(0);
      });

      it("should handle non-finite depth", () => {
        expect(InputValidator.validateLoopDepth(NaN)).toBe(0);
        expect(InputValidator.validateLoopDepth(Infinity)).toBe(0);
      });
    });

    describe("validateFunctionName", () => {
      it("should return valid function name", () => {
        expect(InputValidator.validateFunctionName("foo")).toBe("foo");
      });

      it("should trim whitespace", () => {
        expect(InputValidator.validateFunctionName("  foo  ")).toBe("foo");
      });

      it("should return null for null/undefined", () => {
        expect(InputValidator.validateFunctionName(null)).toBeNull();
        expect(InputValidator.validateFunctionName(undefined)).toBeNull();
      });

      it("should return null for empty string", () => {
        expect(InputValidator.validateFunctionName("")).toBeNull();
        expect(InputValidator.validateFunctionName("   ")).toBeNull();
      });

      it("should call onInvalid callback", () => {
        const onInvalid = jest.fn();
        InputValidator.validateFunctionName(null, onInvalid);
        expect(onInvalid).toHaveBeenCalled();
      });
    });

    describe("escapeRegex", () => {
      it("should escape special regex characters", () => {
        expect(InputValidator.escapeRegex("foo.bar")).toBe("foo\\.bar");
        expect(InputValidator.escapeRegex("a[b]")).toBe("a\\[b\\]");
        expect(InputValidator.escapeRegex("x*y")).toBe("x\\*y");
      });

      it("should not modify plain strings", () => {
        expect(InputValidator.escapeRegex("foobar")).toBe("foobar");
      });
    });
  });

  describe("RiskCalculator", () => {
    describe("fromScore", () => {
      it("should return LOW for score < 10", () => {
        expect(RiskCalculator.fromScore(5)).toBe("LOW");
        expect(RiskCalculator.fromScore(9)).toBe("LOW");
      });

      it("should return MEDIUM for score 10-29", () => {
        expect(RiskCalculator.fromScore(10)).toBe("MEDIUM");
        expect(RiskCalculator.fromScore(29)).toBe("MEDIUM");
      });

      it("should return HIGH for score 30-59", () => {
        expect(RiskCalculator.fromScore(30)).toBe("HIGH");
        expect(RiskCalculator.fromScore(59)).toBe("HIGH");
      });

      it("should return CRITICAL for score >= 60", () => {
        expect(RiskCalculator.fromScore(60)).toBe("CRITICAL");
        expect(RiskCalculator.fromScore(100)).toBe("CRITICAL");
      });
    });

    describe("scoreToRisk", () => {
      it("should return LOW for score <= 3", () => {
        expect(RiskCalculator.scoreToRisk(1)).toBe("LOW");
        expect(RiskCalculator.scoreToRisk(3)).toBe("LOW");
      });

      it("should return MEDIUM for score 4-6", () => {
        expect(RiskCalculator.scoreToRisk(4)).toBe("MEDIUM");
        expect(RiskCalculator.scoreToRisk(6)).toBe("MEDIUM");
      });

      it("should return HIGH for score > 6", () => {
        expect(RiskCalculator.scoreToRisk(7)).toBe("HIGH");
        expect(RiskCalculator.scoreToRisk(10)).toBe("HIGH");
      });
    });
  });

  describe("createBlankSignalProfile", () => {
    it("should return a signal profile with all defaults", () => {
      const profile = createBlankSignalProfile();

      expect(profile.loops).toBe(0);
      expect(profile.nestedLoops).toBe(0);
      expect(profile.conditionals).toBe(0);
      expect(profile.recursion).toBe(false);
      expect(profile.recursionDoubled).toBe(false);
      expect(profile.hasBreakOrContinue).toBe(false);
      expect(profile.hasEarlyReturn).toBe(false);
      expect(profile.conditionDoubled).toBe(false);
      expect(profile.isConstantBody).toBe(false);
      expect(profile.isConstantWithReturn).toBe(false);
      expect(profile.allocations).toBe(0);
      expect(profile.variables).toBe(0);
      expect(profile.usesDataStructures).toBe(false);
      expect(profile.usesNestedDataStructures).toBe(false);
      expect(profile.loopWithAllocation).toBe(false);
      expect(profile.recursionWithAllocation).toBe(false);
      expect(profile.hasLoopInRecursion).toBe(false);
      expect(profile.hasFilterOrSlice).toBe(false);
      expect(profile.dataSizeHint).toBe("MEDIUM");
      expect(profile.hasLinearSearchInLoop).toBe(false);
      expect(profile.hasNestedArrayMethods).toBe(false);
      expect(profile.recursionCallCount).toBe(0);
      expect(profile.hasSorting).toBe(false);
      expect(profile.hasJSONOperations).toBe(false);
      expect(profile.hasSpreadOperator).toBe(false);
      expect(profile.functionalLoopCount).toBe(0);
      expect(profile.languageSpecific).toEqual({});
    });

    it("should return independent copies", () => {
      const profile1 = createBlankSignalProfile();
      const profile2 = createBlankSignalProfile();

      profile1.loops = 5;
      expect(profile2.loops).toBe(0);
    });
  });
});
