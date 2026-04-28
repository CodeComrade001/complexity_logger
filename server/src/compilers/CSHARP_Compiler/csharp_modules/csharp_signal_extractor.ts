// ============================================================================
// C# SIGNAL EXTRACTOR
// Uses tree-sitter-c-sharp AST node types.
// ============================================================================

import Parser from "tree-sitter";
import { LanguageSpecificSignals, SignalProfile } from "../../shared/interfaces.js";
import {
  createBlankSignalProfile,
  InputValidator,
  LoopDepthAnalyzer,
} from "../../shared/shared-utils.js";

const CSHARP_LOOP_TYPES = new Set([
  "for_statement",
  "foreach_statement",
  "while_statement",
  "do_statement",
]);

const CSHARP_CONDITIONAL_TYPES = new Set([
  "if_statement",
  "switch_statement",
  "switch_expression",
  "conditional_expression",  // ternary
]);

interface TraversalContext {
  insideLoop: boolean;
  insideRecursion: boolean;
  loopDepth: number;
}

export function extractCSharpSignals(
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
    if (n.type !== "invocation_expression") return false;
    const fn = n.childForFieldName("expression");
    return fn?.text === validName;
  };

  const isAllocation = (n: Parser.SyntaxNode): boolean =>
    n.type === "object_creation_expression" ||
    n.type === "array_creation_expression" ||
    n.type === "implicit_array_creation_expression" ||
    n.type === "collection_expression";

  const traverse = (n: Parser.SyntaxNode, ctx: TraversalContext): void => {
    if (CSHARP_LOOP_TYPES.has(n.type)) {
      loops++;
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
      ctx = { ...ctx, insideLoop: true, loopDepth: currentLoopDepth };
      if (ctx.insideRecursion) hasLoopInRecursion = true;
    }

    if (CSHARP_CONDITIONAL_TYPES.has(n.type)) conditionals++;

    if (n.type === "binary_expression") {
      const op = n.children.find((c) => c.text === "&&" || c.text === "||");
      if (op) conditionDoubled = true;
    }

    if (n.type === "break_statement" || n.type === "continue_statement") {
      hasBreakOrContinue = true;
    }

    if (n.type === "return_statement" && ctx.insideLoop) hasEarlyReturn = true;

    if (n.type === "variable_declaration" || n.type === "parameter") {
      variables++;
    }

    if (isAllocation(n)) {
      allocations++;
      usesDataStructures = true;
      if (ctx.insideLoop) loopWithAllocation = true;
      if (ctx.insideRecursion) recursionWithAllocation = true;
      for (const child of n.children) {
        if (isAllocation(child)) usesNestedDataStructures = true;
      }
    }

    // LINQ query expressions
    if (n.type === "query_expression") {
      ls.hasLinqQuery = true;
      signals.functionalLoopCount = (signals.functionalLoopCount ?? 0) + 1;
    }

    // Async/await
    if (n.type === "await_expression") {
      ls.hasAsyncAwait = true;
    }

    // Method invocations
    if (n.type === "invocation_expression") {
      const expr = n.childForFieldName("expression");
      const methodText = expr?.text ?? "";
      const parts = methodText.split(".");
      const methodName = parts[parts.length - 1];

      // LINQ methods (functional loops)
      const linqMethods = [
        "Select", "Where", "SelectMany", "GroupBy", "OrderBy",
        "ThenBy", "Distinct", "Skip", "Take", "Aggregate",
        "Any", "All", "Count", "Sum", "Max", "Min", "Average",
        "ToList", "ToArray", "ToDictionary", "First", "FirstOrDefault",
      ];
      if (linqMethods.includes(methodName)) {
        ls.hasLinqQuery = true;
        signals.functionalLoopCount = (signals.functionalLoopCount ?? 0) + 1;
      }

      // Sort
      if (methodName === "Sort" || methodName === "OrderBy" || methodName === "ThenBy") {
        signals.hasSorting = true;
      }

      // Linear search
      if (["Contains", "IndexOf", "Find", "FindIndex"].includes(methodName)) {
        if (ctx.insideLoop) signals.hasLinearSearchInLoop = true;
      }

      // Filter/slice
      if (["Where", "Skip", "Take", "GetRange"].includes(methodName)) {
        hasFilterOrSlice = true;
      }

      // JSON
      if (
        methodText.includes("JsonSerializer") || methodText.includes("JsonConvert") ||
        methodName === "Serialize" || methodName === "Deserialize"
      ) {
        signals.hasJSONOperations = true;
      }

      // Spread equivalent: AddRange, CopyTo
      if (["AddRange", "CopyTo", "InsertRange"].includes(methodName)) {
        signals.hasSpreadOperator = true;
      }

      // Parallel
      if (methodText.includes("Parallel.") || methodText.includes("Task.")) {
        ls.hasParallelOperations = true;
      }

      // Recursion
      if (isSelfCall(n)) {
        recursion = true;
        recursionCallCount++;
        ctx = { ...ctx, insideRecursion: true };
      }
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
    if (CSHARP_LOOP_TYPES.has(n.type)) currentLoopDepth--;
  };

  traverse(node, { insideLoop: false, insideRecursion: false, loopDepth: 0 });

  const regexDepth = LoopDepthAnalyzer.estimateLoopNestingDepth(
    fullText, ["for", "foreach", "while", "do"], "//"
  );
  maxLoopDepth = Math.max(maxLoopDepth, regexDepth);

  const isConstantBody = loops === 0 && !recursion && (signals.functionalLoopCount ?? 0) === 0;
  const isConstantWithReturn = isConstantBody && conditionals === 0 && allocations === 0;

  const lowerText = fullText.toLowerCase();
  let dataSizeHint: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM";
  if (/\b(n|size|length|count|items|list|collection)\b/.test(lowerText)) dataSizeHint = "LARGE";
  else if (isConstantBody) dataSizeHint = "SMALL";

  signals.loops = loops;
  signals.nestedLoops = maxLoopDepth;
  signals.conditionals = conditionals;
  signals.recursion = recursion;
  signals.recursionDoubled = recursionDoubled;
  // signals.recursionCallCount = recursionCallCount;
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
  // signals.languageSpecific = ls;

  return signals;
}
