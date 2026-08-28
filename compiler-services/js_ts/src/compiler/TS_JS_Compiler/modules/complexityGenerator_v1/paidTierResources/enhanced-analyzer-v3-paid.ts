// ============================================================================
// ENHANCED ANALYZER V2 (PAID TIER - Production Grade)
// Target: 100% correctness, comprehensive edge case handling
// ============================================================================

import { Node, SyntaxKind, CallExpression } from "ts-morph";
import {
  ALLOCATION_CONSTRUCTOR_NAMES,
  ComplexityNotation,
  ComplexityProfile,
  ComplexityReason,
  ComplexityResult,
  GrowthProfile,
  LOOP_KINDS,
  Lowercase_RiskLevelType,
  Risk,
  SignalProfile,
} from "../../../interfaces/complexityGeneratorInterface.js";
import { PaidTierReasonGenerator } from "./paid-tier-reason-v3.js";
import { ConfidenceStrategy, InputValidator, LoopDepthAnalyzer, NotationValidator } from "../utils/shared-complexity-utils.js";

// ============================================================================
// MAIN CLASS - PAID TIER
// ============================================================================
export class EnhancedAnalyzer_v2 {
  private aiExplain: PaidTierReasonGenerator;

  constructor(aiExplain: PaidTierReasonGenerator) {
    this.aiExplain = aiExplain;
  }

  /**
   * Entry point - Full complexity analysis pipeline
   * Returns: { success, result?, message }
   */
  public run(
    node: Node,
    functionName: string | null,
    keywordSet: Set<string>
  ): { success: boolean; result?: ComplexityResult; message: string } {
    try {
      // Validate function name with logging
      const validatedName = InputValidator.validateFunctionName(
        functionName,
        (message) => {
          console.warn(`[EnhancedAnalyzer] ${message} - Line ${node.getStartLineNumber()}`);
        }
      );

      // 1. Extract signals from AST + regex fallback
      const signals = this.extractSignals(node, validatedName);

      // 2. Build complexity profile (map signals → Big-O + scores)
      const profile = this.buildComplexityProfile(signals);

      // 3. Generate human-readable reasons
      const reasons = this.generateComplexityReason(profile, signals);

      // 4. Model growth (combine time + space)
      const growth = this.modelGrowth(profile);

      // 5. Compose final growth profile with validation
      const composed = this.composeGrowth(growth);

      // 6. Build final result
      const result = this.buildResult(node, reasons, validatedName, composed);

      return { success: true, result, message: "Complexity calculated successfully" };
    } catch (err) {
      const error = err as Error;
      console.error("[EnhancedAnalyzer] Analysis failed:", error);
      return {
        success: false,
        message: `Analysis failed: ${error.message}`,
      };
    }
  }

  // ========================================================================
  // STEP 1 - SIGNAL EXTRACTION (AST + Regex Fallback)
  // ========================================================================

  private extractSignals(
    node: Node,
    functionName: string | null
  ): SignalProfile {
    const fullText = node.getText();

    // Initialize counters
    let loops = 0;
    let maxLoopDepth = 0;
    let conditionals = 0;
    let recursion = false;
    let recursionCallCount = 0;
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

    // Regex-based signals
    let hasLinearSearchInLoop = false;
    let hasNestedArrayMethods = false;
    let hasSorting = false;
    let hasJSONOperations = false;
    let hasSpreadOperator = false;
    let functionalLoopCount = 0;

    // Loop tracking
    let currentLoopDepth = 0;

    // ── Helpers ──

    const isSelfCall = (callNode: CallExpression): boolean => {
      if (!functionName) return false;
      const expr = callNode.getExpression();
      return expr.getText() === functionName;
    };

    const isAllocation = (n: Node): boolean => {
      const kind = n.getKind();
      if (kind === SyntaxKind.NewExpression) return true;
      if (kind === SyntaxKind.ArrayLiteralExpression) return true;
      if (kind === SyntaxKind.ObjectLiteralExpression) return true;
      if (kind === SyntaxKind.CallExpression) {
        const name = (n as CallExpression).getExpression().getText();
        return ALLOCATION_CONSTRUCTOR_NAMES.has(name);
      }
      return false;
    };

    // ── AST Traversal ──

    const traverse = (
      n: Node,
      insideLoop: boolean,
      insideRecursion: boolean
    ): void => {
      const kind = n.getKind();

      // Loop detection
      if (LOOP_KINDS.has(kind)) {
        loops++;
        currentLoopDepth++;
        maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
        insideLoop = true;

        if (insideRecursion) hasLoopInRecursion = true;
      }

      // Conditional detection
      if (
        kind === SyntaxKind.IfStatement ||
        kind === SyntaxKind.SwitchStatement ||
        kind === SyntaxKind.ConditionalExpression
      ) {
        conditionals++;
      }

      // Compound conditions
      if (kind === SyntaxKind.BinaryExpression) {
        const op = n.getChildAtPos(1)?.getText();
        if (op === "&&" || op === "||") conditionDoubled = true;
      }

      // Break/Continue
      if (
        kind === SyntaxKind.BreakStatement ||
        kind === SyntaxKind.ContinueStatement
      ) {
        hasBreakOrContinue = true;
      }

      // Early return in loops
      if (kind === SyntaxKind.ReturnStatement && insideLoop) {
        hasEarlyReturn = true;
      }

      // Variables
      if (
        kind === SyntaxKind.VariableDeclaration ||
        kind === SyntaxKind.Parameter
      ) {
        variables++;
      }

      // Allocations
      if (isAllocation(n)) {
        allocations++;

        if (insideLoop) loopWithAllocation = true;
        if (insideRecursion) recursionWithAllocation = true;

        // Check nested structures
        if (
          kind === SyntaxKind.NewExpression ||
          kind === SyntaxKind.ArrayLiteralExpression
        ) {
          n.forEachChild((child) => {
            if (isAllocation(child)) usesNestedDataStructures = true;
          });
        }

        usesDataStructures = true;
      }

      // Filter/Slice (factorial pattern indicator)
      if (kind === SyntaxKind.CallExpression) {
        const callNode = n as CallExpression;
        const callText = callNode.getExpression().getText();

        if (callText.includes("filter") || callText.includes("slice")) {
          hasFilterOrSlice = true;
        }
      }

      // Recursion detection
      if (kind === SyntaxKind.CallExpression) {
        const callNode = n as CallExpression;
        if (isSelfCall(callNode)) {
          recursion = true;
          recursionCallCount++;
          insideRecursion = true;
        }
      }

      // Binary recursion (multiple calls in same expression)
      if (kind === SyntaxKind.BinaryExpression) {
        let selfCallsInExpr = 0;
        n.forEachDescendant((desc) => {
          if (
            desc.getKind() === SyntaxKind.CallExpression &&
            isSelfCall(desc as CallExpression)
          ) {
            selfCallsInExpr++;
          }
        });
        if (selfCallsInExpr >= 2) recursionDoubled = true;
      }

      // Recurse into children
      n.forEachChild((child) => traverse(child, insideLoop, insideRecursion));

      // Unwind loop depth
      if (LOOP_KINDS.has(kind)) {
        currentLoopDepth--;
      }
    };

    traverse(node, false, false);

    // ── Regex Fallback Analysis ──

    // Functional loops
    const functionalLoopMatches =
      fullText.match(/\.(forEach|map|filter|reduce)\s*\(/g) || [];
    functionalLoopCount = functionalLoopMatches.length;

    // Add to total loops if AST missed them
    const totalDetectedLoops = loops + functionalLoopCount;
    if (totalDetectedLoops > loops) {
      loops = totalDetectedLoops;
    }

    // Nested array methods
    const nestedArrayPattern =
      /\.(map|filter|forEach|reduce)\s*\([^)]*\.(map|filter|includes|indexOf|find|findIndex)/;
    hasNestedArrayMethods = nestedArrayPattern.test(fullText);

    if (hasNestedArrayMethods && maxLoopDepth < 2) {
      maxLoopDepth = Math.max(maxLoopDepth, 2);
    }

    // Linear search in loops
    const hasLinearSearchMethods =
      /\.(includes|indexOf|find|findIndex)\s*\(/.test(fullText);
    if ((loops > 0 || functionalLoopCount > 0) && hasLinearSearchMethods) {
      hasLinearSearchInLoop = true;
    }

    // Binary recursion fallback (regex)
    if (functionName && !recursionDoubled && recursion) {
      const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const recursiveCallPattern = new RegExp(`\\b${escapedName}\\s*\\(`, "g");
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

    // Other regex patterns
    hasSorting = /\.sort\s*\(/.test(fullText);
    hasJSONOperations = /JSON\.(parse|stringify)/.test(fullText);
    hasSpreadOperator = /\.\.\.|\bspread\b/.test(fullText);

    // Enhanced nesting depth (use shared utility)
    const regexNestingDepth = LoopDepthAnalyzer.estimateLoopNestingDepth(fullText);
    maxLoopDepth = Math.max(maxLoopDepth, regexNestingDepth);

    // Derived booleans
    const isConstantBody = loops === 0 && !recursion;
    const isConstantWithReturn =
      isConstantBody && conditionals === 0 && allocations === 0;

    // Data size hint
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
      hasLinearSearchInLoop,
      hasNestedArrayMethods,
      hasSorting,
      hasJSONOperations,
      hasSpreadOperator,
      functionalLoopCount,
    };
  }

  // ========================================================================
  // STEP 2 - BUILD COMPLEXITY PROFILE
  // ========================================================================

  private buildComplexityProfile(signals: SignalProfile): ComplexityProfile {
    let timeNotation: ComplexityNotation;
    let timeScore: number;

    // ── TIME COMPLEXITY ──

    if (signals.isConstantWithReturn) {
      timeNotation = "O(1)";
      timeScore = 1;
    } else if (signals.isConstantBody && signals.conditionals > 0) {
      timeNotation = "O(1)";
      timeScore = 1;
    } else if (signals.recursionDoubled) {
      timeNotation = "O(2ⁿ)";
      timeScore = 9;
    } else if (
      signals.recursion &&
      signals.hasLoopInRecursion &&
      signals.hasFilterOrSlice
    ) {
      timeNotation = "O(n!)";
      timeScore = 10;
    } else if (signals.hasLinearSearchInLoop || signals.hasNestedArrayMethods) {
      timeNotation = "O(n²)";
      timeScore = 7;
    } else if (signals.recursion && signals.nestedLoops >= 2) {
      timeNotation = "O(n³)";
      timeScore = 8;
    } else if (signals.recursion && signals.hasLoopInRecursion) {
      timeNotation = "O(n²)";
      timeScore = 7;
    } else if (signals.recursion && signals.allocations > 0) {
      if (signals.hasFilterOrSlice) {
        timeNotation = "O(n log n)";
        timeScore = 5;
      } else {
        timeNotation = "O(n²)";
        timeScore = 7;
      }
    } else if (signals.hasSorting) {
      timeNotation = "O(n log n)";
      timeScore = 5;
    } else if (signals.recursion) {
      timeNotation = "O(n)";
      timeScore = 4;
    } else if (signals.nestedLoops >= 3) {
      timeNotation = "O(n³)";
      timeScore = 8;
    } else if (signals.nestedLoops === 2) {
      timeNotation = "O(n²)";
      timeScore = 7;
    } else if (signals.loops > 0) {
      const likelyLogN =
        signals.conditionals > 0 &&
        (signals.hasBreakOrContinue || signals.hasEarlyReturn) &&
        signals.loops === 1;

      timeNotation = likelyLogN ? "O(log n)" : "O(n)";
      timeScore = likelyLogN ? 2 : 4;
    } else {
      timeNotation = "O(1)";
      timeScore = 1;
    }

    // ── SPACE COMPLEXITY ──

    let spaceNotation: ComplexityNotation;
    let spaceScore: number;

    if (signals.usesNestedDataStructures) {
      spaceNotation = "O(n²)";
      spaceScore = 7;
    } else if (signals.hasSpreadOperator && signals.loops > 0) {
      spaceNotation = signals.nestedLoops >= 2 ? "O(n²)" : "O(n)";
      spaceScore = signals.nestedLoops >= 2 ? 7 : 4;
    } else if (signals.recursionWithAllocation || signals.loopWithAllocation) {
      spaceNotation = "O(n)";
      spaceScore = 4;
    } else if (signals.recursion) {
      spaceNotation = "O(n)";
      spaceScore = 4;
    } else if (signals.hasJSONOperations) {
      spaceNotation = "O(n)";
      spaceScore = 4;
    } else if (
      signals.allocations > 0 ||
      signals.usesDataStructures ||
      signals.hasSpreadOperator
    ) {
      spaceNotation = "O(1)";
      spaceScore = 2;
    } else {
      spaceNotation = "O(1)";
      spaceScore = 1;
    }

    // Validate notations
    NotationValidator.validate(timeNotation);
    NotationValidator.validate(spaceNotation);

    return { timeNotation, spaceNotation, timeScore, spaceScore };
  }

  // ========================================================================
  // STEP 3 - GENERATE REASONS
  // ========================================================================

  private generateComplexityReason(
    profile: ComplexityProfile,
    signals: SignalProfile
  ): ComplexityReason[] {
    return PaidTierReasonGenerator.generateReasons(profile, signals);
  }

  // ========================================================================
  // STEP 4 - MODEL GROWTH
  // ========================================================================

  private modelGrowth(profile: ComplexityProfile): GrowthProfile {
    // Weighted combination: time 70%, space 30%
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

  // ========================================================================
  // STEP 5 - COMPOSE GROWTH
  // ========================================================================

  private composeGrowth(growth: GrowthProfile): GrowthProfile {
    // Clamp totalScore to [1, 10]
    const totalScore = Math.min(10, Math.max(1, growth.totalScore));

    return {
      ...growth,
      totalScore,
      riskLevel: this.scoreToRisk(totalScore),
    };
  }

  // ========================================================================
  // STEP 6 - BUILD RESULT
  // ========================================================================

  private buildResult(
    node: Node,
    reasons: ComplexityReason[],
    functionName: string | null,
    data: GrowthProfile
  ): ComplexityResult {
    // Calculate confidence (NO artificial cap for paid tier)
    const baseConfidence = ConfidenceStrategy.aggregateConfidence(reasons);
    const confidence = ConfidenceStrategy.applyFreeTierCap(
      baseConfidence,
      data.time,
      "paid" // NO CAPS for paid users
    );

    return {
      id: crypto.randomUUID(),
      kind: "functions",
      name: functionName,
      startLine: node.getStartLineNumber(),
      endLine: node.getEndLineNumber(),
      text: node.getText(),
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
      reasons: reasons,
      tierUsed: "paid",
      confidence,
    };
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  private scoreToRisk(score: number): Risk {
    if (score <= 3) return "LOW";
    if (score <= 6) return "MEDIUM";
    return "HIGH";
  }
}

