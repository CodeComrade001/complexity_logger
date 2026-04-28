import { describe, it, expect, jest } from "@jest/globals";
import {
  LoopDepthAnalyzer,
  ConfidenceStrategy,
  NotationValidator,
  InputValidator,
} from "../../src/compilers/shared/complexity-utils.js";
import type { ComplexityNotation } from "../../src/compilers/shared/interfaces.js";

describe("complexity-utils", () => {
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

      it("should return 3 for triple nested loops", () => {
        const code = `
          function foo() {
            for (let i = 0; i < n; i++) {
              for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                  console.log(i, j, k);
                }
              }
            }
          }
        `;
        const depth = LoopDepthAnalyzer.estimateLoopNestingDepth(code);
        expect(depth).toBe(3);
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

      it("should handle functional loops (forEach, map, filter, reduce)", () => {
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

      it("should handle non-integer depth", () => {
        expect(InputValidator.validateLoopDepth(3.7)).toBe(3);
      });
    });

    describe("validateFunctionName", () => {
      it("should return valid function name", () => {
        expect(InputValidator.validateFunctionName("foo")).toBe("foo");
      });

      it("should trim whitespace", () => {
        expect(InputValidator.validateFunctionName("  foo  ")).toBe("foo");
      });

      it("should return null for null", () => {
        expect(InputValidator.validateFunctionName(null)).toBeNull();
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
  });
});
