// ============================================================================
// SIGNAL FACTORY
// Contains the ONE canonical implementation of the signal-extraction traversal.
// Each language configures it via LanguageSignalConfig.
//
// Architecture mirrors extractSignals() in enhanced-analyzer-v3-paid.ts but
// operates on web-tree-sitter SyntaxNode instead of ts-morph Node.
// ============================================================================

import type Parser from "tree-sitter";
import type { SignalProfile } from "./interfaces.js";
import { LoopDepthAnalyzer } from "./complexity-utils.js";

export type SyntaxNode = Parser.SyntaxNode;

// ============================================================================
// LANGUAGE SIGNAL CONFIG
// All language-specific knowledge is captured here.
// ============================================================================
export interface LanguageSignalConfig {
  /** AST node types that represent loop constructs. */
  loopTypes: ReadonlySet<string>;

  /** AST node types that represent conditional constructs. */
  conditionalTypes: ReadonlySet<string>;

  /** AST node types that represent break or continue statements. */
  breakContinueTypes: ReadonlySet<string>;

  /** AST node types that represent return statements. */
  returnTypes: ReadonlySet<string>;

  /**
   * AST node types that represent binary/boolean expressions.
   * Used to detect compound conditions (&&, ||) and doubled recursion.
   */
  binaryExpressionTypes: ReadonlySet<string>;

  /**
   * AST node types that represent a function call.
   * Used for recursion detection.
   */
  callExpressionTypes: ReadonlySet<string>;

  /** AST node types that represent variable / parameter declarations. */
  variableTypes: ReadonlySet<string>;

  /**
   * Returns true if the given node represents a memory allocation
   * (new object, array literal, container construction, etc.).
   */
  isAllocationNode: (node: SyntaxNode) => boolean;

  /**
   * Returns true if the given node is a call to the named function
   * (i.e. a self-recursive call).
   */
  isSelfCallNode: (node: SyntaxNode, funcName: string) => boolean;

  /**
   * Returns true if the given call node (already confirmed as allocation)
   * contains a nested allocation among its immediate children.
   * Used to set usesNestedDataStructures.
   */
  isNestedAllocationInChildren: (node: SyntaxNode) => boolean;

  /**
   * Returns the operator text from a binary expression node,
   * or null if not determinable.
   */
  getBinaryOperator: (node: SyntaxNode) => string | null;

  /**
   * Returns true if the given node represents a "filter or slice" operation.
   * Contributes to factorial-complexity detection.
   */
  isFilterOrSliceNode: (node: SyntaxNode) => boolean;

  /** Regex to count functional loops (forEach / map / filter / reduce equivalents). */
  functionalLoopRegex: RegExp;

  /** Regex to detect sort operations. */
  sortingRegex: RegExp;

  /** Regex to detect JSON encode/decode operations. */
  jsonOperationsRegex: RegExp;

  /** Regex to detect spread / shallow-copy operations. */
  spreadOperatorRegex: RegExp;

  /** Regex to detect linear search methods (contains, indexOf, find, etc.). */
  linearSearchRegex: RegExp;

  /** Regex to detect a linear search method NESTED inside a functional loop callback. */
  nestedArrayMethodsRegex: RegExp;

  /** Loop keyword list used by LoopDepthAnalyzer.estimateLoopNestingDepth(). */
  loopKeywordsForDepth: string[];

  /**
   * Regex to detect a binary recursive return pattern in the raw source text.
   * Default matches: return X + Y or return X * Y patterns.
   * Override for languages where statements do not end with semicolons.
   */
  binaryRecursionReturnRegex?: RegExp;
}

// ============================================================================
// MUTABLE STATE  (closed over inside the traversal)
// ============================================================================
interface TraversalState {
  loops: number;
  currentLoopDepth: number;
  maxLoopDepth: number;
  conditionals: number;
  recursion: boolean;
  recursionCallCount: number;
  recursionDoubled: boolean;
  hasBreakOrContinue: boolean;
  hasEarlyReturn: boolean;
  conditionDoubled: boolean;
  allocations: number;
  variables: number;
  usesDataStructures: boolean;
  usesNestedDataStructures: boolean;
  loopWithAllocation: boolean;
  recursionWithAllocation: boolean;
  hasLoopInRecursion: boolean;
  hasFilterOrSlice: boolean;
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Returns an `extractSignals` function bound to the supplied language config.
 * The returned function mirrors extractSignals() from enhanced-analyzer-v3-paid.ts.
 */
export function createSignalExtractor(
  config: LanguageSignalConfig
): (node: SyntaxNode, functionName: string | null) => SignalProfile {
  return function extractSignals(
    node: SyntaxNode,
    functionName: string | null
  ): SignalProfile {
    const fullText = node.text;

    // ── Mutable traversal state ──────────────────────────────────────────
    const s: TraversalState = {
      loops: 0,
      currentLoopDepth: 0,
      maxLoopDepth: 0,
      conditionals: 0,
      recursion: false,
      recursionCallCount: 0,
      recursionDoubled: false,
      hasBreakOrContinue: false,
      hasEarlyReturn: false,
      conditionDoubled: false,
      allocations: 0,
      variables: 0,
      usesDataStructures: false,
      usesNestedDataStructures: false,
      loopWithAllocation: false,
      recursionWithAllocation: false,
      hasLoopInRecursion: false,
      hasFilterOrSlice: false,
    };

    // ── Depth-first traversal ─────────────────────────────────────────────
    function traverse(
      n: SyntaxNode,
      insideLoop: boolean,
      insideRecursion: boolean
    ): void {
      const type = n.type;

      // Loop detection
      const isLoop = config.loopTypes.has(type);
      if (isLoop) {
        s.loops++;
        s.currentLoopDepth++;
        s.maxLoopDepth = Math.max(s.maxLoopDepth, s.currentLoopDepth);
        insideLoop = true;
        if (insideRecursion) s.hasLoopInRecursion = true;
      }

      // Conditional detection
      if (config.conditionalTypes.has(type)) {
        s.conditionals++;
      }

      // Compound condition (&&, ||)
      if (config.binaryExpressionTypes.has(type)) {
        const op = config.getBinaryOperator(n);
        if (op === "&&" || op === "||") s.conditionDoubled = true;
      }

      // Break / Continue
      if (config.breakContinueTypes.has(type)) {
        s.hasBreakOrContinue = true;
      }

      // Early return inside a loop
      if (config.returnTypes.has(type) && insideLoop) {
        s.hasEarlyReturn = true;
      }

      // Variable declaration
      if (config.variableTypes.has(type)) {
        s.variables++;
      }

      // Allocation detection
      if (config.isAllocationNode(n)) {
        s.allocations++;
        if (insideLoop) s.loopWithAllocation = true;
        if (insideRecursion) s.recursionWithAllocation = true;
        if (config.isNestedAllocationInChildren(n)) {
          s.usesNestedDataStructures = true;
        }
        s.usesDataStructures = true;
      }

      // Filter / Slice
      if (config.isFilterOrSliceNode(n)) {
        s.hasFilterOrSlice = true;
      }

      // Recursion detection (call expression matching function name)
      if (
        config.callExpressionTypes.has(type) &&
        functionName !== null &&
        config.isSelfCallNode(n, functionName)
      ) {
        s.recursion = true;
        s.recursionCallCount++;
        insideRecursion = true;
      }

      // Doubled recursion — check binary expressions for ≥2 self-calls
      if (config.binaryExpressionTypes.has(type) && functionName !== null) {
        let selfCallsInExpr = 0;
        countSelfCallDescendants(n, functionName);
        function countSelfCallDescendants(node: SyntaxNode, fn: string): void {
          if (
            config.callExpressionTypes.has(node.type) &&
            config.isSelfCallNode(node, fn)
          ) {
            selfCallsInExpr++;
          }
          for (const child of node.children) {
            countSelfCallDescendants(child, fn);
          }
        }
        if (selfCallsInExpr >= 2) s.recursionDoubled = true;
      }

      // Recurse into children
      for (const child of n.children) {
        traverse(child, insideLoop, insideRecursion);
      }

      // Unwind loop depth on exit
      if (isLoop) s.currentLoopDepth--;
    }

    traverse(node, false, false);

    // ═══════════════════════════════════════════════════════════════════
    // REGEX FALLBACK ANALYSIS  (mirrors the regex section in original)
    // ═══════════════════════════════════════════════════════════════════

    // Functional loop count
    const functionalLoopMatches =
      fullText.match(config.functionalLoopRegex) || [];
    const functionalLoopCount = functionalLoopMatches.length;
    const totalDetectedLoops = s.loops + functionalLoopCount;
    if (totalDetectedLoops > s.loops) {
      s.loops = totalDetectedLoops;
    }

    // Nested array methods
    const hasNestedArrayMethods = config.nestedArrayMethodsRegex.test(fullText);
    if (hasNestedArrayMethods && s.maxLoopDepth < 2) {
      s.maxLoopDepth = Math.max(s.maxLoopDepth, 2);
    }

    // Linear search in loops
    const hasLinearSearchMethods = config.linearSearchRegex.test(fullText);
    const hasLinearSearchInLoop =
      (s.loops > 0 || functionalLoopCount > 0) && hasLinearSearchMethods;

    // Binary recursion regex fallback
    if (functionName && !s.recursionDoubled && s.recursion) {
      const escapedName = functionName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const callPattern = new RegExp(`\\b${escapedName}\\s*\\(`, "g");
      const returnRegex =
        config.binaryRecursionReturnRegex ??
        /return[^;]*\+[^;]*|return[^;]*\*[^;]*/g;
      const binaryReturns = fullText.match(returnRegex);
      if (binaryReturns) {
        for (const expr of binaryReturns) {
          if ((expr.match(callPattern) || []).length >= 2) {
            s.recursionDoubled = true;
            break;
          }
        }
      }
    }

    // Remaining regex signals
    const hasSorting = config.sortingRegex.test(fullText);
    const hasJSONOperations = config.jsonOperationsRegex.test(fullText);
    const hasSpreadOperator = config.spreadOperatorRegex.test(fullText);

    // Enhanced nesting depth via regex fallback
    const regexNestingDepth = LoopDepthAnalyzer.estimateLoopNestingDepth(
      fullText,
      config.loopKeywordsForDepth
    );
    s.maxLoopDepth = Math.max(s.maxLoopDepth, regexNestingDepth);

    // Derived booleans
    const isConstantBody = s.loops === 0 && !s.recursion;
    const isConstantWithReturn =
      isConstantBody && s.conditionals === 0 && s.allocations === 0;

    // Data size hint
    const allText = fullText.toLowerCase();
    let dataSizeHint: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM";
    if (
      /\b(n|size|length|count|items|dataset|records|rows|elements)\b/.test(
        allText
      )
    ) {
      dataSizeHint = "LARGE";
    } else if (
      /\b(limit|page|chunk|batch|slice|offset)\b/.test(allText)
    ) {
      dataSizeHint = "MEDIUM";
    } else if (isConstantBody) {
      dataSizeHint = "SMALL";
    }

    return {
      loops: s.loops,
      nestedLoops: s.maxLoopDepth,
      conditionals: s.conditionals,
      recursionCallCount: s.recursionCallCount,
      recursion: s.recursion,
      recursionDoubled: s.recursionDoubled,
      hasBreakOrContinue: s.hasBreakOrContinue,
      hasEarlyReturn: s.hasEarlyReturn,
      conditionDoubled: s.conditionDoubled,
      isConstantBody,
      isConstantWithReturn,
      allocations: s.allocations,
      variables: s.variables,
      usesDataStructures: s.usesDataStructures,
      usesNestedDataStructures: s.usesNestedDataStructures,
      loopWithAllocation: s.loopWithAllocation,
      recursionWithAllocation: s.recursionWithAllocation,
      hasLoopInRecursion: s.hasLoopInRecursion,
      hasFilterOrSlice: s.hasFilterOrSlice,
      dataSizeHint,
      hasLinearSearchInLoop,
      hasNestedArrayMethods,
      hasSorting,
      hasJSONOperations,
      hasSpreadOperator,
      functionalLoopCount,
      languageSpecific: {},
    };
  };
}
