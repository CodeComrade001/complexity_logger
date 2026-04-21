// ============================================================================
// SWIFT SIGNAL EXTRACTOR
// Uses tree-sitter-swift AST node types.
// Grammar ref: https://github.com/alex-pinkus/tree-sitter-swift
// ============================================================================

import Parser from "tree-sitter";
import { LanguageSpecificSignals, SignalProfile } from "../../shared_v2/interfaces.js";
import {
  createBlankSignalProfile,
  InputValidator,
  LoopDepthAnalyzer,
} from "../../shared_v2/shared-utils.js";

// ─────────────────────────────────────────────────────────────────────────────
// SWIFT TREE-SITTER NODE TYPES
// ─────────────────────────────────────────────────────────────────────────────
const SWIFT_LOOP_TYPES = new Set([
  "for_statement",       // for x in sequence
  "while_statement",     // while cond {}
  "repeat_while_statement", // repeat {} while cond
]);

const SWIFT_CONDITIONAL_TYPES = new Set([
  "if_statement",
  "guard_statement",        // guard let x = ...
  "switch_statement",
  "ternary_expression",
]);

const SWIFT_FUNCTIONAL_METHODS = new Set([
  "map", "flatMap", "compactMap", "filter", "reduce",
  "forEach", "sorted", "sorted(by:)", "contains", "first",
  "firstIndex", "last", "lastIndex", "min", "max",
  "allSatisfy", "contains(where:)", "prefix", "suffix",
  "enumerated", "zip",
]);

interface TraversalContext {
  insideLoop: boolean;
  insideRecursion: boolean;
  loopDepth: number;
}

export function extractSwiftSignals(
  node: Parser.SyntaxNode,
  _source: string,
  functionName: string | null
): SignalProfile {
  const validName = InputValidator.validateFunctionName(functionName);
  const signals = createBlankSignalProfile();
  const fullText = node.text;
  const ls: LanguageSpecificSignals = {};

  let loops = 0;
  let currentLoopDepth = 0;
  let maxLoopDepth = 0;
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

  const isSelfCall = (n: Parser.SyntaxNode): boolean => {
    if (!validName) return false;
    // call_expression in tree-sitter-swift
    if (n.type !== "call_expression") return false;
    const fn = n.child(0);
    return fn?.text === validName;
  };

  const isAllocation = (n: Parser.SyntaxNode): boolean => {
    // Array literal: [1, 2, 3]
    if (n.type === "array_literal") return true;
    // Dictionary literal: ["key": value]
    if (n.type === "dictionary_literal") return true;
    // Initializer call: SomeType(...)
    if (n.type === "call_expression") {
      const fn = n.child(0);
      const text = fn?.text ?? "";
      // Capital letter = type initializer
      return /^[A-Z]/.test(text) && !["Bool", "Int", "Float", "Double", "String"].includes(text);
    }
    return false;
  };

  const traverse = (n: Parser.SyntaxNode, ctx: TraversalContext): void => {
    // Loops
    if (SWIFT_LOOP_TYPES.has(n.type)) {
      loops++;
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
      ctx = { ...ctx, insideLoop: true, loopDepth: currentLoopDepth };
      if (ctx.insideRecursion) hasLoopInRecursion = true;
    }

    // Conditionals
    if (SWIFT_CONDITIONAL_TYPES.has(n.type)) conditionals++;

    // Boolean ops (&&, ||)
    if (n.type === "infix_expression") {
      const op = n.children.find((c) => c.text === "&&" || c.text === "||");
      if (op) conditionDoubled = true;
    }

    // Break / continue / fallthrough
    if (
      n.type === "break_statement" ||
      n.type === "continue_statement" ||
      n.type === "fallthrough_statement"
    ) {
      hasBreakOrContinue = true;
    }

    // Early return
    if (n.type === "return_statement" && ctx.insideLoop) hasEarlyReturn = true;

    // Variables
    if (n.type === "variable_declaration" || n.type === "constant_declaration") {
      variables++;
    }

    // Allocations
    if (isAllocation(n)) {
      allocations++;
      usesDataStructures = true;
      if (ctx.insideLoop) loopWithAllocation = true;
      if (ctx.insideRecursion) recursionWithAllocation = true;
      for (const child of n.children) {
        if (isAllocation(child)) usesNestedDataStructures = true;
      }
    }

    // Call expressions / member access chains
    if (n.type === "call_expression") {
      const fn = n.child(0);
      const callText = fn?.text ?? "";
      const parts = callText.split(".");
      const methodName = parts[parts.length - 1];

      // Functional / higher-order
      if (SWIFT_FUNCTIONAL_METHODS.has(methodName)) {
        signals.functionalLoopCount = (signals.functionalLoopCount ?? 0) + 1;
        ls.hasHigherOrderFunction = true;
      }

      // Sort
      if (methodName === "sort" || methodName === "sorted") {
        signals.hasSorting = true;
      }

      // Filter / slice
      if (
        ["filter", "prefix", "suffix", "dropFirst", "dropLast", "split"].includes(methodName)
      ) {
        hasFilterOrSlice = true;
      }

      // Linear search
      if (
        ["contains", "firstIndex", "lastIndex", "index", "first"].includes(methodName)
      ) {
        if (ctx.insideLoop) signals.hasLinearSearchInLoop = true;
      }

      // JSON (Codable / JSONSerialization)
      if (
        callText.includes("JSONEncoder") || callText.includes("JSONDecoder") ||
        methodName === "encode" || methodName === "decode" ||
        callText.includes("JSONSerialization")
      ) {
        signals.hasJSONOperations = true;
      }

      // Spread equivalent: +, append(contentsOf:)
      if (methodName === "append" && n.text.includes("contentsOf")) {
        signals.hasSpreadOperator = true;
      }

      // Closures passed as trailing arguments
      ls.hasClosure = true;

      // Async / await detection
      if (callText.includes("async") || callText.includes("await") || callText.includes("Task")) {
        ls.hasAsyncAwait = true;
      }

      // Nested higher-order: .map { $0.filter { ... } }
      if (fn?.type === "navigation_expression") {
        const receiver = fn.child(0);
        const receiverCall = receiver?.type === "call_expression" ? receiver : null;
        const receiverFn = receiverCall?.child(0)?.text?.split(".").pop() ?? "";
        if (SWIFT_FUNCTIONAL_METHODS.has(receiverFn) && SWIFT_FUNCTIONAL_METHODS.has(methodName)) {
          signals.hasNestedArrayMethods = true;
        }
      }

      // Recursion
      if (isSelfCall(n)) {
        recursion = true;
        recursionCallCount++;
        ctx = { ...ctx, insideRecursion: true };
      }
    }

    // Optional chaining (?.)
    if (n.type === "optional_chaining_expression") {
      ls.hasOptionalChain = true;
    }

    // Binary recursion
    if (n.type === "return_statement") {
      let selfCalls = 0;
      const countSelf = (c: Parser.SyntaxNode): void => {
        if (isSelfCall(c)) selfCalls++;
        for (const ch of c.children) countSelf(ch);
      };
      countSelf(n);
      if (selfCalls >= 2) recursionDoubled = true;
    }

    for (const child of n.children) traverse(child, ctx);
    if (SWIFT_LOOP_TYPES.has(n.type)) currentLoopDepth--;
  };

  traverse(node, { insideLoop: false, insideRecursion: false, loopDepth: 0 });

  // Regex fallback
  const regexDepth = LoopDepthAnalyzer.estimateLoopNestingDepth(
    fullText, ["for", "while", "repeat"], "//"
  );
  maxLoopDepth = Math.max(maxLoopDepth, regexDepth);

  // Spread (... in function calls)
  if (/\.\.\.[a-zA-Z_]/.test(fullText)) signals.hasSpreadOperator = true;

  // Functional supplement
  const functionalMatches = (
    fullText.match(/\.(map|filter|forEach|compactMap|flatMap|reduce)\s*[{(]/g) || []
  ).length;
  signals.functionalLoopCount = Math.max(
    signals.functionalLoopCount ?? 0,
    functionalMatches
  );

  const isConstantBody =
    loops === 0 && !recursion && (signals.functionalLoopCount ?? 0) === 0;
  const isConstantWithReturn =
    isConstantBody && conditionals === 0 && allocations === 0;

  const lowerText = fullText.toLowerCase();
  let dataSizeHint: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM";
  if (/\b(n|count|size|length|items)\b/.test(lowerText)) dataSizeHint = "LARGE";
  else if (isConstantBody) dataSizeHint = "SMALL";

  signals.loops = loops;
  signals.nestedLoops = maxLoopDepth;
  signals.conditionals = conditionals;
  signals.recursion = recursion;
  signals.recursionDoubled = recursionDoubled;
  signals.recursionCallCount = recursionCallCount;
  signals.hasBreakOrContinue = hasBreakOrContinue;
  signals.hasEarlyReturn = hasEarlyReturn;
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
  signals.dataSizeHint = dataSizeHint;
  signals.languageSpecific = ls;

  return signals;
}
