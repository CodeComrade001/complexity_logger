import { Node, SyntaxKind, CallExpression } from "ts-morph";
import { ALLOCATION_CONSTRUCTOR_NAMES, ComplexityNotation, ComplexityProfile, ComplexityResult, GrowthProfile, LOOP_KINDS, Risk, SignalProfile } from "../../../interfaces/complexityGeneratorInterface.js";
import { ComplexityReasonGenerator } from "./aI_ReasonGenerator.js";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class EnhancedAnalyzer_v2 {
  private aiExplain: ComplexityReasonGenerator

  constructor(aiExplain: ComplexityReasonGenerator) {
    this.aiExplain = aiExplain;
  }

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
  // ENHANCED: Now includes regex fallbacks for patterns AST might miss
  // ───────────────────────────────────────────────────────────────────────────

  private extractSignals(
    node: Node,
    functionName: string | null
  ): SignalProfile {

    // Get the full text for regex analysis
    const fullText = node.getText();

    // ── Mutable counters ────────────────────────────────────────────────────
    let loops = 0;
    let maxLoopDepth = 0;          // deepest nesting seen
    let conditionals = 0;
    let recursion = false;
    let recursionCallCount = 0;    // total recursive call-sites found
    let recursionDoubled = false;
    let hasBreakOrContinue = false;
    let hasEarlyReturn = false;
    let conditionDoubled = false;
    let allocations = 0;
    let variables = 0;
    let usesDataStructures = false;
    let usesNestedDataStructures = false;
    let loopWithAllocation = false;
    let recursionWithAllocation = false;
    let hasLoopInRecursion = false;
    let hasFilterOrSlice = false;

    // NEW: Additional signals from regex analysis
    let hasLinearSearchInLoop = false;
    let hasNestedArrayMethods = false;
    let hasSorting = false;
    let hasJSONOperations = false;
    let hasSpreadOperator = false;
    let functionalLoopCount = 0;

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

        // Track if we're in a loop inside a recursive function
        if (insideRecursion) hasLoopInRecursion = true;
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

      // ── EARLY RETURN detection (inside loops) ──────────────────────────
      if (kind === SyntaxKind.ReturnStatement && insideLoop) {
        hasEarlyReturn = true;
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

      // ── FILTER/SLICE detection (factorial pattern indicator) ───────────
      if (kind === SyntaxKind.CallExpression) {
        const callNode = n as CallExpression;
        const callText = callNode.getExpression().getText();

        if (callText.includes("filter") || callText.includes("slice")) {
          hasFilterOrSlice = true;
        }
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

    // ═══════════════════════════════════════════════════════════════════════
    // REGEX FALLBACK ANALYSIS
    // Use when AST analysis might miss patterns or needs supplementation
    // ═══════════════════════════════════════════════════════════════════════

    // ── FUNCTIONAL LOOP DETECTION (forEach, map, filter, reduce) ──────────
    const functionalLoopMatches = fullText.match(/\.(forEach|map|filter|reduce)\s*\(/g);
    if (functionalLoopMatches) {
      functionalLoopCount = functionalLoopMatches.length;
      // Add to loop count if AST missed them
      const totalDetectedLoops = loops + functionalLoopCount;
      if (totalDetectedLoops > loops) {
        loops = totalDetectedLoops;
      }
    }

    // ── NESTED ARRAY METHODS (map inside map, filter with includes, etc) ──
    const nestedArrayPattern = /\.(map|filter|forEach|reduce)\s*\([^)]*\.(map|filter|includes|indexOf|find|findIndex)/;
    hasNestedArrayMethods = nestedArrayPattern.test(fullText);

    // If we found nested array methods, update nesting depth
    if (hasNestedArrayMethods && maxLoopDepth < 2) {
      maxLoopDepth = Math.max(maxLoopDepth, 2);
    }

    // ── LINEAR SEARCH IN LOOPS (.includes, .indexOf inside loops) ─────────
    // This is a critical O(n²) pattern that's easy to miss
    const hasLinearSearchMethods = /\.(includes|indexOf|find|findIndex)\s*\(/.test(fullText);
    if ((loops > 0 || functionalLoopCount > 0) && hasLinearSearchMethods) {
      hasLinearSearchInLoop = true;
    }

    // ── BINARY RECURSION FALLBACK ─────────────────────────────────────────
    // If AST missed it, use regex to detect multiple recursive calls
    if (functionName && !recursionDoubled && recursion) {
      const recursiveCallPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
      const callsInBinaryExpr = fullText.match(/return[^;]*\+[^;]*|return[^;]*\*[^;]*/g);

      if (callsInBinaryExpr) {
        for (const expr of callsInBinaryExpr) {
          const callsInExpr = (expr.match(recursiveCallPattern) || []).length;
          if (callsInExpr >= 2) {
            recursionDoubled = true;
            break;
          }
        }
      }
    }

    // ── SORTING DETECTION ──────────────────────────────────────────────────
    hasSorting = /\.sort\s*\(/.test(fullText);

    // ── JSON OPERATIONS (expensive builtins) ───────────────────────────────
    hasJSONOperations = /JSON\.(parse|stringify)/.test(fullText);

    // ── SPREAD OPERATOR (creates copies) ───────────────────────────────────
    hasSpreadOperator = /\.\.\.|\bspread\b/.test(fullText);

    // ── ENHANCED NESTING DEPTH (regex fallback) ────────────────────────────
    // Use regex-based nesting calculation if it's higher than AST found
    const regexNestingDepth = this.estimateLoopNestingDepth(fullText);
    maxLoopDepth = Math.max(maxLoopDepth, regexNestingDepth);

    // ── Post-traversal derived booleans ────────────────────────────────────
    const isConstantBody = loops === 0 && !recursion;
    const isConstantWithReturn =
      isConstantBody && conditionals === 0 && allocations === 0;

    // ── Dataset size hint ──────────────────────────────────────────────────
    const allText = fullText.toLowerCase();
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
      hasEarlyReturn,
      conditionDoubled,
      isConstantBody,
      isConstantWithReturn,
      allocations,
      variables,
      usesDataStructures,
      usesNestedDataStructures,
      loopWithAllocation,
      recursionWithAllocation,
      hasLoopInRecursion,
      hasFilterOrSlice,
      dataSizeHint,
      // NEW SIGNALS FROM REGEX ANALYSIS
      hasLinearSearchInLoop,
      hasNestedArrayMethods,
      hasSorting,
      hasJSONOperations,
      hasSpreadOperator,
      functionalLoopCount,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REGEX HELPER: Better loop nesting detection
  // Used as fallback when AST analysis might undercount nesting
  // ───────────────────────────────────────────────────────────────────────────
  private estimateLoopNestingDepth(text: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    const blockStack: boolean[] = [];

    const lines = text.split('\n');

    for (let line of lines) {
      // Remove strings and comments (basic heuristic)
      line = line.replace(/\/\/.*$/g, ''); // remove single-line comments
      line = line.replace(/\/\*.*\*\//g, ''); // remove block comments
      line = line.replace(/(["'`]).*?\1/g, ''); // remove string literals

      // Count all loop keywords in the line
      const loopKeywords = line.match(/\b(for|while|do|forEach|map|filter|reduce)\b/g) || [];
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      // Handle loop keywords
      for (let i = 0; i < loopKeywords.length; i++) {
        blockStack.push(true);
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      // Track non-loop blocks for extra braces
      const nonLoopBlocks = Math.max(0, openBraces - loopKeywords.length);
      for (let i = 0; i < nonLoopBlocks; i++) {
        blockStack.push(false);
      }

      // Close blocks
      for (let i = 0; i < closeBraces; i++) {
        const isLoopBlock = blockStack.pop();
        if (isLoopBlock) {
          currentDepth = Math.max(0, currentDepth - 1);
        }
      }
    }

    return maxDepth;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2 — BUILD COMPLEXITY PROFILE
  // Maps SignalProfile signals → Big-O strings + numeric scores.
  // ENHANCED: Now uses regex signals for better detection
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

    } else if (signals.recursion && signals.hasLoopInRecursion && signals.hasFilterOrSlice) {
      // Factorial pattern: recursion + loop + filtering remaining elements
      // Classic permutation/combination generation
      timeNotation = "O(n!)";
      timeScore = 10;

    } else if (signals.hasLinearSearchInLoop || signals.hasNestedArrayMethods) {
      // CRITICAL: Linear search inside loops or nested array methods
      // This is a hidden O(n²) pattern that's very common
      timeNotation = "O(n²)";
      timeScore = 7;

    } else if (signals.recursion && signals.nestedLoops >= 2) {
      // Recursive + deeply nested loops → very expensive, treat as O(n³)
      timeNotation = "O(n³)";
      timeScore = 8;

    } else if (signals.recursion && signals.hasLoopInRecursion) {
      // Recursion with a loop inside → likely O(n²)
      timeNotation = "O(n²)";
      timeScore = 7;

    } else if (signals.recursion && signals.allocations > 0) {
      // Recursion with allocations (like merge sort with slice)
      // If it's dividing the problem, it's likely O(n log n)

      if (signals.hasFilterOrSlice) {
        timeNotation = "O(n log n)";
        timeScore = 5;
      } else {
        timeNotation = "O(n²)";
        timeScore = 7;
      }

    } else if (signals.hasSorting) {
      // Sorting is O(n log n) - common pattern
      timeNotation = "O(n log n)";
      timeScore = 5;

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
      // Single loop. Check for logarithmic patterns:
      // - Has conditionals AND (break/continue OR early return)
      // - Single loop only
      const likelyLogN =
        signals.conditionals > 0 &&
        (signals.hasBreakOrContinue || signals.hasEarlyReturn) &&
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

    } else if (signals.hasSpreadOperator && signals.loops > 0) {
      // Spread operator in loops creates multiple copies → O(n) or O(n²)
      spaceNotation = signals.nestedLoops >= 2 ? "O(n²)" : "O(n)";
      spaceScore = signals.nestedLoops >= 2 ? 7 : 4;

    } else if (signals.recursionWithAllocation || signals.loopWithAllocation) {
      // Allocating inside a loop or recursion → grows with input → O(n)
      spaceNotation = "O(n)";
      spaceScore = 4;

    } else if (signals.recursion) {
      // Recursion alone creates an implicit call stack → O(n) space
      spaceNotation = "O(n)";
      spaceScore = 4;

    } else if (signals.hasJSONOperations) {
      // JSON operations create full copies of data → O(n) space
      spaceNotation = "O(n)";
      spaceScore = 4;

    } else if (signals.allocations > 0 || signals.usesDataStructures || signals.hasSpreadOperator) {
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





  private async generateComplexityReason(complexityResult: ComplexityProfile, signals: SignalProfile): Promise<string[]> {
    // Use the AI explainer to generate a human-readable reason for the complexity result
    const breakdown = this.aiExplain.getDetailedBreakdown(complexityResult, signals);
    // Combine time and space reasons into a flat array
    const reasons = [
      ...breakdown.time.reasons,
      ...breakdown.space.reasons
    ];
    return reasons;
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