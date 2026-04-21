// ============================================================================
// HASKELL SIGNAL EXTRACTOR
// Uses tree-sitter-haskell AST node types.
// Grammar ref: https://github.com/tree-sitter/tree-sitter-haskell
//
// KEY DIFFERENCE from imperative languages:
//   - Haskell has NO loops — only recursion, folds, and list operations
//   - Lazy evaluation changes space semantics significantly
//   - Pattern matching is the primary branching mechanism
//   - `where` and `let` clauses are the scoping mechanism for helpers
// ============================================================================

import Parser from "tree-sitter";
import { LanguageSpecificSignals, SignalProfile } from "../../shared_v2/interfaces.js";
import {
  createBlankSignalProfile,
  InputValidator,
  LoopDepthAnalyzer,
} from "../../shared_v2/shared-utils.js";

// ─────────────────────────────────────────────────────────────────────────────
// HASKELL TREE-SITTER NODE TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Haskell has no loop constructs — we track recursion depth via call patterns
const HASKELL_CONDITIONAL_TYPES = new Set([
  "case_expression",           // case x of ...
  "if_expression",             // if cond then a else b
  "guard",                     // | cond = ...
  "multi_way_if_expression",   // MultiWayIf extension
]);

// Allocation patterns
const HASKELL_ALLOCATION_TYPES = new Set([
  "list",                    // [1, 2, 3]
  "list_comprehension",      // [x | x <- xs]
  "tuple",                   // (a, b)
  "arithmetic_sequence",     // [1..n]
]);

// High-cost operations in Haskell
const HASKELL_HIGH_COST = new Set([
  "nub",        // O(n²) - removes duplicates by equality
  "sort",       // O(n log n)
  "sortBy",     // O(n log n)
  "sortOn",     // O(n log n)
  "group",      // O(n)
  "groupBy",    // O(n)
  "transpose",  // O(n*m)
  "permutations", // O(n!)
  "subsequences", // O(2^n)
]);

interface TraversalContext {
  insideRecursion: boolean;
  depth: number;
}

export function extractHaskellSignals(
  node: Parser.SyntaxNode,
  _source: string,
  functionName: string | null
): SignalProfile {
  const validName = InputValidator.validateFunctionName(functionName);
  const signals = createBlankSignalProfile();
  const fullText = node.text;
  const ls: LanguageSpecificSignals = {};

  // Haskell has no imperative loops — these stay 0 unless we find list ops
  let loops = 0;
  let conditionals = 0;
  let allocations = 0;
  let variables = 0;
  let recursion = false;
  let recursionCallCount = 0;
  let recursionDoubled = false;
  let hasBreakOrContinue = false;
  let hasEarlyReturn = false;
  let conditionDoubled = false;
  let loopWithAllocation = false;
  let recursionWithAllocation = false;
  let hasLoopInRecursion = false;
  let hasFilterOrSlice = false;
  let usesDataStructures = false;
  let usesNestedDataStructures = false;
  let functionalLoopCount = 0;
  let hasSorting = false;
  let hasJSONOperations = false;
  let hasLinearSearchInLoop = false;
  let hasNestedArrayMethods = false;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isSelfCall = (n: Parser.SyntaxNode): boolean => {
    if (!validName) return false;
    // In Haskell, function application: funcName arg1 arg2
    // tree-sitter-haskell uses "function" or "apply" nodes
    if (n.type === "apply") {
      const fn = n.child(0);
      return fn?.text === validName;
    }
    if (n.type === "variable") {
      return n.text === validName;
    }
    return false;
  };

  const isAllocation = (n: Parser.SyntaxNode): boolean =>
    HASKELL_ALLOCATION_TYPES.has(n.type);

  // ── Traversal ─────────────────────────────────────────────────────────────

  const traverse = (n: Parser.SyntaxNode, ctx: TraversalContext): void => {
    // Conditionals
    if (HASKELL_CONDITIONAL_TYPES.has(n.type)) {
      conditionals++;
    }

    // Guards (| condition = expr) — pattern matching branches
    if (n.type === "guard") {
      conditionals++;
      ls.hasGuards = true;
    }

    // Pattern matching in case expression
    if (n.type === "case_expression") {
      ls.hasPatternMatch = true;
    }

    // Where clause (local definitions)
    if (n.type === "where") {
      ls.hasWhereClause = true;
    }

    // Allocations (list literals, tuples, comprehensions)
    if (isAllocation(n)) {
      allocations++;
      usesDataStructures = true;

      if (ctx.insideRecursion) recursionWithAllocation = true;

      // Nested: [[1,2],[3,4]]
      if (n.type === "list") {
        for (const child of n.children) {
          if (child.type === "list" || child.type === "tuple") {
            usesNestedDataStructures = true;
          }
        }
      }
    }

    // List comprehension — equivalent to functional loop
    if (n.type === "list_comprehension") {
      ls.hasListComprehension = true;
      functionalLoopCount++;
      loops++; // treat as implicit loop

      // Nested comprehension: [x | x <- [y | y <- ys]]
      let innerComps = 0;
      const countInner = (c: Parser.SyntaxNode): void => {
        if (c.type === "list_comprehension") innerComps++;
        for (const ch of c.children) countInner(ch);
      };
      countInner(n);
      if (innerComps > 0) {
        hasNestedArrayMethods = true;
        signals.nestedLoops = Math.max(signals.nestedLoops ?? 0, 2);
      }
    }

    // Arithmetic sequences: [1..n] — potentially infinite
    if (n.type === "arithmetic_sequence") {
      ls.hasInfiniteList = true;
      ls.hasLazyEvaluation = true;
      functionalLoopCount++;
    }

    // Function application — detect known high-cost / functional patterns
    if (n.type === "apply") {
      const fn = n.child(0);
      const fnName = fn?.text ?? "";

      // Fold operations (foldl, foldr, foldl', foldMap, etc.)
      if (/^fold|^foldl|^foldr|^scanl|^scanr|^foldMap/.test(fnName)) {
        ls.hasFoldOperation = true;
        functionalLoopCount++;
      }

      // Map / filter / concatMap (functional loops)
      if (
        fnName === "map" || fnName === "fmap" ||
        fnName === "filter" || fnName === "concatMap" ||
        fnName === "mapM" || fnName === "forM" ||
        fnName === "traverse" || fnName === "mapM_" ||
        fnName === "for_" || fnName === "replicateM"
      ) {
        functionalLoopCount++;
      }

      // Filter / slice equivalent
      if (fnName === "filter" || fnName === "takeWhile" || fnName === "dropWhile" ||
        fnName === "take" || fnName === "drop" || fnName === "splitAt") {
        hasFilterOrSlice = true;
      }

      // High-cost builtins
      if (HASKELL_HIGH_COST.has(fnName)) {
        if (fnName === "sort" || fnName === "sortBy" || fnName === "sortOn") {
          hasSorting = true;
        }
        if (fnName === "permutations") {
          // O(n!) — extreme case
          recursionDoubled = true; // reuse binary recursion signal as worst-case trigger
        }
        if (fnName === "subsequences") {
          // O(2^n)
          recursionDoubled = true;
        }
        if (fnName === "nub") {
          // O(n²) — linear search in a list
          hasLinearSearchInLoop = true;
        }
      }

      // Linear search in recursive context
      if (
        (fnName === "elem" || fnName === "notElem" || fnName === "find" ||
          fnName === "findIndex" || fnName === "elemIndex" || fnName === "lookup")
      ) {
        if (ctx.insideRecursion) hasLinearSearchInLoop = true;
      }

      // JSON (aeson)
      if (fnName === "encode" || fnName === "decode" || fnName === "eitherDecode" ||
        fnName === "toJSON" || fnName === "fromJSON" || fnName === "parseJSON") {
        hasJSONOperations = true;
      }

      // Spread/copy equivalent: (++) concat
      if (fnName === "++" || fnName === "concat" || fnName === "concatMap" ||
        fnName === "mappend" || fnName === "<>") {
        signals.hasSpreadOperator = true;
      }

      // Nested map inside map: map (map f) — O(n²)
      if (fnName === "map" || fnName === "fmap") {
        // Check if the function argument is also a map call
        const arg = n.child(1);
        if (arg?.type === "apply") {
          const innerFn = arg.child(0);
          if (
            innerFn?.text === "map" || innerFn?.text === "fmap" ||
            innerFn?.text === "filter"
          ) {
            hasNestedArrayMethods = true;
          }
        }
      }

      // Self-recursion
      if (isSelfCall(n)) {
        recursion = true;
        recursionCallCount++;
        ctx = { ...ctx, insideRecursion: true };

        if (loops > 0) hasLoopInRecursion = true;
      }
    }

    // Variable bindings (let / where)
    if (n.type === "bind" || n.type === "function" || n.type === "variable_declaration") {
      variables++;
    }

    // Binary recursion — two self-calls in same expression
    // e.g., fib n = fib (n-1) + fib (n-2)
    if (n.type === "exp" || n.type === "infix_apply") {
      let selfCalls = 0;
      const countSelf = (c: Parser.SyntaxNode): void => {
        if (c.type === "apply") {
          const fn = c.child(0);
          if (fn?.text === validName) selfCalls++;
        }
        for (const ch of c.children) countSelf(ch);
      };
      countSelf(n);
      if (selfCalls >= 2) recursionDoubled = true;
    }

    for (const child of n.children) traverse(child, ctx);
  };

  traverse(node, { insideRecursion: false, depth: 0 });

  // ── Regex supplement for Haskell ──────────────────────────────────────────

  // Lazy evaluation hints: use of `lazy`, `~`, `seq`
  if (/\blazy\b|\bseq\b|~[a-zA-Z_]/.test(fullText)) {
    ls.hasLazyEvaluation = true;
  }

  // do-notation loops (mapM_ / forM_ in IO)
  const doLoopMatches = (
    fullText.match(/\b(mapM_|forM_|mapM|forM|replicateM_|replicateM)\b/g) || []
  ).length;
  functionalLoopCount = Math.max(functionalLoopCount, doLoopMatches);

  // Mutual recursion (two functions calling each other — hard to detect statically)
  // Count all function-name occurrences as a rough proxy
  if (validName) {
    const escaped = validName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const callPattern = new RegExp(`\\b${escaped}\\b`, "g");
    const allCalls = (fullText.match(callPattern) || []).length;
    // Subtract the definition itself (first occurrence)
    const effectiveCalls = Math.max(0, allCalls - 1);
    recursionCallCount = Math.max(recursionCallCount, effectiveCalls);
    if (effectiveCalls > 0) recursion = true;

    // Binary recursion regex fallback
    if (!recursionDoubled && effectiveCalls >= 2) {
      const binaryPattern = /=.*\+.*=|return.*\+/;
      if (binaryPattern.test(fullText)) recursionDoubled = true;
    }
  }

  // Infinite lists ([1..], cycle, repeat, iterate) → lazy O(∞) time
  if (/\[[\d]\.\.(?!\d)|\bcycle\b|\brepeat\b|\biterate\b/.test(fullText)) {
    ls.hasInfiniteList = true;
    ls.hasLazyEvaluation = true;
  }

  const isConstantBody = !recursion && functionalLoopCount === 0 && loops === 0;
  const isConstantWithReturn = isConstantBody && conditionals === 0 && allocations === 0;

  const lowerText = fullText.toLowerCase();
  let dataSizeHint: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM";
  if (/\b(n|xs|ys|list|size|length|count)\b/.test(lowerText)) dataSizeHint = "LARGE";
  else if (isConstantBody) dataSizeHint = "SMALL";

  // Haskell has no imperative loops — loops = functional loop count
  signals.loops = loops + functionalLoopCount;
  signals.nestedLoops = signals.nestedLoops ?? 0;
  signals.functionalLoopCount = functionalLoopCount;
  signals.conditionals = conditionals;
  signals.recursion = recursion;
  signals.recursionDoubled = recursionDoubled;
  signals.recursionCallCount = recursionCallCount;
  signals.hasBreakOrContinue = false; // Haskell has no break/continue
  signals.hasEarlyReturn = false;      // Haskell has no early return (pattern guards serve this)
  signals.conditionDoubled = conditionDoubled;
  signals.isConstantBody = isConstantBody;
  signals.isConstantWithReturn = isConstantWithReturn;
  signals.allocations = allocations;
  signals.variables = variables;
  signals.usesDataStructures = usesDataStructures;
  signals.usesNestedDataStructures = usesNestedDataStructures;
  signals.loopWithAllocation = loopWithAllocation;
  signals.recursionWithAllocation = recursionWithAllocation;
  signals.hasLoopInRecursion = hasLoopInRecursion;
  signals.hasFilterOrSlice = hasFilterOrSlice;
  signals.hasSorting = hasSorting;
  signals.hasJSONOperations = hasJSONOperations;
  signals.hasLinearSearchInLoop = hasLinearSearchInLoop;
  signals.hasNestedArrayMethods = hasNestedArrayMethods;
  signals.dataSizeHint = dataSizeHint;
  signals.languageSpecific = ls;

  return signals;
}
