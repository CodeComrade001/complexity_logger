import { Node, SyntaxKind, CallExpression } from "ts-morph";
import { ALLOCATION_CONSTRUCTOR_NAMES, ComplexityNotation, ComplexityProfile, ComplexityResult, GrowthProfile, LOOP_KINDS, Risk, SignalProfile } from "../../../interfaces/complexityGeneratorInterface.js";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class EnhancedAnalyzer_v2 {

  /**
   * Entry point.
   * Runs the full pipeline: extract → profile → model → compose → result.
   */
  public run(
    node: Node,
    functionName: string | null,
    keywordSet: Set<string>
  ): { success: boolean; result?: ComplexityResult; message: string } {

    try {
      // 1. Single AST pass — collect every raw signal we care about
      const signals = this.extractSignals(node, functionName);

      // 2. Map raw signals → named Big-O categories + numeric scores
      const profile = this.buildComplexityProfile(signals);

      // 3. Combine time + space into a unified growth object
      const growth = this.modelGrowth(profile);

      // 4. Attach total score and risk tier
      const composed = this.composeGrowth(growth);

      // 5. Format and return the final ComplexityResult
      const result = this.buildResult(node, functionName, composed);

      return { success: true, result, message: "Complexity calculated" };

    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 1 — SIGNAL EXTRACTION
  // Single depth-first traversal.  All counters updated in one pass.
  // ───────────────────────────────────────────────────────────────────────────

  private extractSignals(
    node: Node,
    functionName: string | null
  ): SignalProfile {

    // ── Mutable counters ────────────────────────────────────────────────────
    let loops = 0;
    let maxLoopDepth = 0;          // deepest nesting seen
    let conditionals = 0;
    let recursion = false;
    let recursionCallCount = 0;    // total recursive call-sites found
    let recursionDoubled = false;
    let hasBreakOrContinue = false;
    let conditionDoubled = false;
    let allocations = 0;
    let variables = 0;
    let usesDataStructures = false;
    let usesNestedDataStructures = false;
    let loopWithAllocation = false;
    let recursionWithAllocation = false;

    // ── Stack to track current loop-nesting depth ───────────────────────────
    let currentLoopDepth = 0;

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** Returns true if `callNode` is a direct self-call of functionName. */
    const isSelfCall = (callNode: CallExpression): boolean => {
      if (!functionName) return false;
      const expr = callNode.getExpression();
      return expr.getText() === functionName;
    };

    /** Returns true if the node is any kind of memory allocation. */
    const isAllocation = (n: Node): boolean => {
      if (n.getKind() === SyntaxKind.NewExpression) return true;
      if (n.getKind() === SyntaxKind.ArrayLiteralExpression) return true;
      if (n.getKind() === SyntaxKind.ObjectLiteralExpression) return true;
      // Array(), Map(), Set() constructor-style calls
      if (n.getKind() === SyntaxKind.CallExpression) {
        const name = (n as CallExpression).getExpression().getText();
        return ALLOCATION_CONSTRUCTOR_NAMES.has(name);
      }
      return false;
    };

    // ── Recursive DFS traversal ─────────────────────────────────────────────
    const traverse = (n: Node, insideLoop: boolean, insideRecursion: boolean): void => {

      const kind = n.getKind();

      // ── LOOP detection ─────────────────────────────────────────────────
      if (LOOP_KINDS.has(kind)) {
        loops++;
        currentLoopDepth++;
        maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
        insideLoop = true;
      }

      // ── CONDITIONAL detection ──────────────────────────────────────────
      if (
        kind === SyntaxKind.IfStatement ||
        kind === SyntaxKind.SwitchStatement ||
        kind === SyntaxKind.ConditionalExpression
      ) {
        conditionals++;
      }

      // ── COMPOUND CONDITION detection (&&, ||) ──────────────────────────
      if (kind === SyntaxKind.BinaryExpression) {
        const op = n.getChildAtPos(1)?.getText();
        if (op === "&&" || op === "||") conditionDoubled = true;
      }

      // ── BREAK / CONTINUE detection ─────────────────────────────────────
      if (
        kind === SyntaxKind.BreakStatement ||
        kind === SyntaxKind.ContinueStatement
      ) {
        hasBreakOrContinue = true;
      }

      // ── VARIABLE DECLARATION detection ────────────────────────────────
      if (
        kind === SyntaxKind.VariableDeclaration ||
        kind === SyntaxKind.Parameter
      ) {
        variables++;
      }

      // ── ALLOCATION detection ───────────────────────────────────────────
      if (isAllocation(n)) {
        allocations++;

        // If we're allocating inside a loop → O(n) space at minimum
        if (insideLoop) loopWithAllocation = true;

        // If we're allocating inside a recursive branch → O(n) stack space
        if (insideRecursion) recursionWithAllocation = true;

        // Check for nested data structures (Array of Array, Map of Map, etc.)
        if (kind === SyntaxKind.NewExpression || kind === SyntaxKind.ArrayLiteralExpression) {
          n.forEachChild(child => {
            if (isAllocation(child)) usesNestedDataStructures = true;
          });
        }

        usesDataStructures = true;
      }

      // ── RECURSIVE CALL detection ───────────────────────────────────────
      if (kind === SyntaxKind.CallExpression) {
        const callNode = n as CallExpression;
        if (isSelfCall(callNode)) {
          recursion = true;
          recursionCallCount++;
          insideRecursion = true;
        }
      }

      // ── DOUBLED RECURSION (e.g. return f(n-1) + f(n-2)) ───────────────
      // We count self-calls per BinaryExpression scope.
      // If any binary expression contains ≥ 2 recursive calls, it's O(2ⁿ).
      if (kind === SyntaxKind.BinaryExpression) {
        let selfCallsInExpr = 0;
        n.forEachDescendant(desc => {
          if (
            desc.getKind() === SyntaxKind.CallExpression &&
            isSelfCall(desc as CallExpression)
          ) selfCallsInExpr++;
        });
        if (selfCallsInExpr >= 2) recursionDoubled = true;
      }

      // ── Recurse into children ──────────────────────────────────────────
      n.forEachChild(child => traverse(child, insideLoop, insideRecursion));

      // ── Unwind loop depth on exit ──────────────────────────────────────
      if (LOOP_KINDS.has(kind)) {
        currentLoopDepth--;
      }
    };

    traverse(node, false, false);

    // ── Post-traversal derived booleans ────────────────────────────────────
    const isConstantBody = loops === 0 && !recursion;
    const isConstantWithReturn =
      isConstantBody && conditionals === 0 && allocations === 0;

    // ── Dataset size hint ──────────────────────────────────────────────────
    // Heuristic: infer from parameter names / variable names whether the
    // function appears to work on large data.
    const allText = node.getText().toLowerCase();
    let dataSizeHint: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM";
    if (/\b(n|size|length|count|items|dataset|records|rows|elements)\b/.test(allText)) {
      dataSizeHint = "LARGE";
    } else if (/\b(limit|page|chunk|batch|slice|offset)\b/.test(allText)) {
      dataSizeHint = "MEDIUM";
    } else if (isConstantBody) {
      dataSizeHint = "SMALL";
    }

    return {
      loops,
      nestedLoops: maxLoopDepth,
      conditionals,
      recursion,
      recursionDoubled,
      hasBreakOrContinue,
      conditionDoubled,
      isConstantBody,
      isConstantWithReturn,
      allocations,
      variables,
      usesDataStructures,
      usesNestedDataStructures,
      loopWithAllocation,
      recursionWithAllocation,
      dataSizeHint,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2 — BUILD COMPLEXITY PROFILE
  // Maps SignalProfile signals → Big-O strings + numeric severity scores.
  //
  // TIME scoring ladder  (1 = best → 10 = worst):
  //   O(1)         → 1
  //   O(log n)     → 2
  //   O(n)         → 4
  //   O(n log n)   → 5
  //   O(n²)        → 7
  //   O(n³)        → 8
  //   O(2ⁿ)        → 9
  //   O(n!)        → 10
  //
  // SPACE scoring ladder:
  //   O(1)  → 1
  //   O(n)  → 4
  //   O(n²) → 7
  // ───────────────────────────────────────────────────────────────────────────

  private buildComplexityProfile(signals: SignalProfile): ComplexityProfile {

    // ── TIME COMPLEXITY ────────────────────────────────────────────────────

    let timeNotation: ComplexityNotation;
    let timeScore: number;

    if (signals.isConstantWithReturn) {
      // No branching, no loops, immediate return — provably O(1)
      timeNotation = "O(1)";
      timeScore = 1;

    } else if (signals.isConstantBody && signals.conditionals > 0) {
      // Conditionals only (no loops/recursion) — still O(1) at runtime
      timeNotation = "O(1)";
      timeScore = 1;

    } else if (signals.recursionDoubled) {
      // Two recursive calls per frame → exponential blowup O(2ⁿ)
      timeNotation = "O(2ⁿ)";
      timeScore = 9;

    } else if (signals.recursion && signals.nestedLoops >= 2) {
      // Recursive + deeply nested loops → very expensive, treat as O(n³)
      timeNotation = "O(n³)";
      timeScore = 8;

    } else if (signals.recursion && signals.loops > 0) {
      // Recursive with a loop inside → at minimum O(n log n) / O(n²)
      // We conservatively emit O(n²) unless break/continue hints otherwise
      timeNotation = signals.hasBreakOrContinue ? "O(n log n)" : "O(n²)";
      timeScore = signals.hasBreakOrContinue ? 5 : 7;

    } else if (signals.recursion) {
      // Pure recursion (single branch) → O(n) on the call stack
      timeNotation = "O(n)";
      timeScore = 4;

    } else if (signals.nestedLoops >= 3) {
      // Triple-nested loop → O(n³)
      timeNotation = "O(n³)";
      timeScore = 8;

    } else if (signals.nestedLoops === 2) {
      // Double-nested loop → O(n²)
      timeNotation = "O(n²)";
      timeScore = 7;

    } else if (signals.loops > 0) {
      // Single loop.  If there's a halving pattern (break/continue + conditionals)
      // we infer O(log n); otherwise plain O(n).
      const likelyLogN =
        signals.hasBreakOrContinue &&
        signals.conditionals > 0 &&
        signals.loops === 1;

      timeNotation = likelyLogN ? "O(log n)" : "O(n)";
      timeScore = likelyLogN ? 2 : 4;

    } else {
      // Fallback: no identifiable growth pattern → O(1)
      timeNotation = "O(1)";
      timeScore = 1;
    }

    // ── SPACE COMPLEXITY ───────────────────────────────────────────────────

    let spaceNotation: ComplexityNotation;
    let spaceScore: number;

    if (signals.usesNestedDataStructures) {
      // Nested data structures (array of arrays, map of maps) → O(n²) space
      spaceNotation = "O(n²)";
      spaceScore = 7;

    } else if (signals.recursionWithAllocation || signals.loopWithAllocation) {
      // Allocating inside a loop or recursion → grows with input → O(n)
      spaceNotation = "O(n)";
      spaceScore = 4;

    } else if (signals.recursion) {
      // Recursion alone creates an implicit call stack → O(n) space
      spaceNotation = "O(n)";
      spaceScore = 4;

    } else if (signals.allocations > 0 || signals.usesDataStructures) {
      // Fixed allocations outside loops → O(1) auxiliary, but flag it
      spaceNotation = "O(1)";
      spaceScore = 2;

    } else {
      // No allocations detected → O(1)
      spaceNotation = "O(1)";
      spaceScore = 1;
    }

    return { timeNotation, spaceNotation, timeScore, spaceScore };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 3 — MODEL GROWTH
  // Adds a unified totalScore and a human-readable risk tier.
  // ───────────────────────────────────────────────────────────────────────────

  private modelGrowth(profile: ComplexityProfile): GrowthProfile {

    // Weighted combination: time is weighted more heavily than space
    const totalScore = Math.round(profile.timeScore * 0.7 + profile.spaceScore * 0.3);

    return {
      time: profile.timeNotation,
      space: profile.spaceNotation,
      timeScore: profile.timeScore,
      spaceScore: profile.spaceScore,
      totalScore,
      riskLevel: this.scoreToRisk(totalScore),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 4 — COMPOSE GROWTH
  // Final pass: clamp scores, ensure risk is consistent, return the envelope.
  // ───────────────────────────────────────────────────────────────────────────

  private composeGrowth(growth: GrowthProfile): GrowthProfile {

    // Clamp totalScore to [1, 10]
    const totalScore = Math.min(10, Math.max(1, growth.totalScore));

    return {
      ...growth,
      totalScore,
      riskLevel: this.scoreToRisk(totalScore),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 5 — BUILD RESULT
  // Formats everything into a ComplexityResult for the upstream consumer.
  // ───────────────────────────────────────────────────────────────────────────

  private buildResult(
    node: Node,
    functionName: string | null,
    data: GrowthProfile
  ): ComplexityResult {

    // Confidence is inversely proportional to score uncertainty.
    // High-risk scores have more heuristic assumptions → lower confidence.
    const confidence = data.totalScore <= 3 ? 90 :
      data.totalScore <= 6 ? 80 : 70;

    return {
      id: crypto.randomUUID(),

      kind: "functions",

      name: functionName,

      startLine: node.getStartLineNumber(),
      endLine: node.getEndLineNumber(),

      text: node.getText(),

      timeComplexity: { notation: data.time, confidence: 0, flags: ["not implemented"] },
      spaceComplexity: { notation: data.space, confidence: 0, flags: ["not implemented"] },

      timeScore: data.timeScore,
      spaceScore: data.spaceScore,
      totalScore: data.totalScore,

      riskLevel: data.riskLevel,

      matchedKeywords: [],
      reasons: [],

      tierUsed: "paid",

      confidence,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Maps a 1-10 score to a human-readable risk tier.
   *   1–3  → LOW
   *   4–6  → MEDIUM
   *   7–10 → HIGH
   */
  private scoreToRisk(score: number): Risk {
    if (score <= 3) return "LOW";
    if (score <= 6) return "MEDIUM";
    return "HIGH";
  }
}