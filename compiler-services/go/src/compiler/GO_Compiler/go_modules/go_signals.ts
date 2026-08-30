// ============================================================================
// GO — SIGNAL EXTRACTOR
// Configures the shared signal factory with Go-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-go@0.25.0 grammar.
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../shared/signal-factory.js";
import { createSignalExtractor } from "../shared/signal-factory.js";

// ── Go loop constructs ───────────────────────────────────────────────────────
// `for_statement` covers ALL Go loops:
//   • for {}           (infinite)
//   • for condition {} (while-style)
//   • for i; cond; post {} (C-style)
//   • for k, v := range x {} (range / for-each)
const GO_LOOP_TYPES = new Set(["for_statement"]);

// ── Conditional constructs ───────────────────────────────────────────────────
const GO_CONDITIONAL_TYPES = new Set([
  "if_statement",
  "expression_switch_statement",
  "type_switch_statement",
  "select_statement", // select is a special kind of conditional dispatch
]);

// ── Break / Continue ─────────────────────────────────────────────────────────
const GO_BREAK_CONTINUE_TYPES = new Set([
  "break_statement",
  "continue_statement",
]);

// ── Return ───────────────────────────────────────────────────────────────────
const GO_RETURN_TYPES = new Set(["return_statement"]);

// ── Binary / boolean expressions ─────────────────────────────────────────────
const GO_BINARY_EXPRESSION_TYPES = new Set(["binary_expression"]);

// ── Call expressions ─────────────────────────────────────────────────────────
const GO_CALL_EXPRESSION_TYPES = new Set(["call_expression"]);

// ── Variable / parameter declarations ────────────────────────────────────────
const GO_VARIABLE_TYPES = new Set([
  "short_var_declaration", // x := value
  "var_declaration",       // var x T = value
  "parameter_declaration", // func params
]);

// ── Allocation constructor names for Go ──────────────────────────────────────
// These are call_expression targets that signal heap allocation.
const GO_ALLOCATION_CALL_NAMES = new Set([
  "make",     // slices, maps, channels
  "new",      // pointer allocation
  "append",   // slice grow (implies re-allocation)
]);

// ── Filter / slice indicator names ───────────────────────────────────────────
// In Go, slice expressions and append-with-filter patterns signal O(n!) risk.
const GO_FILTER_SLICE_CALL_NAMES = new Set([
  "append",
  "copy",
]);

/**
 * Returns the text of the called function in a Go call_expression.
 * call_expression: { function: _expression, arguments: argument_list }
 */
function getGoCallName(node: SyntaxNode): string | null {
  const fn = node.childForFieldName("function");
  if (!fn) return null;
  // Normalise: strip package qualifier (e.g. "sort.Slice" → "sort.Slice" kept
  // as-is so we can match "sort." prefix in isSelfCall checks separately)
  return fn.text.trim();
}

const GO_CONFIG: LanguageSignalConfig = {
  loopTypes: GO_LOOP_TYPES,
  conditionalTypes: GO_CONDITIONAL_TYPES,
  breakContinueTypes: GO_BREAK_CONTINUE_TYPES,
  returnTypes: GO_RETURN_TYPES,
  binaryExpressionTypes: GO_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: GO_CALL_EXPRESSION_TYPES,
  variableTypes: GO_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    // composite_literal: MyStruct{}, []int{}, map[string]int{}
    if (node.type === "composite_literal") return true;

    // call_expression to make / new / append
    if (node.type === "call_expression") {
      const name = getGoCallName(node);
      if (name && GO_ALLOCATION_CALL_NAMES.has(name)) return true;
    }

    return false;
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getGoCallName(node);
    if (!name) return false;
    // Match exact name (handles both plain functions and method calls)
    return name === funcName || name.endsWith(`.${funcName}`);
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (this.isAllocationNode(child)) return true;
    }
    return false;
  },

  getBinaryOperator(node: SyntaxNode): string | null {
    // binary_expression: left op right — operator is child[1] (unnamed)
    if (node.children.length >= 3) {
      return node.children[1]?.text ?? null;
    }
    return null;
  },

  isFilterOrSliceNode(node: SyntaxNode): boolean {
    // slice_expression: arr[low:high] — creates a sub-slice (O(1) view but
    // combined with append it signals copy/filter patterns)
    if (node.type === "slice_expression") return true;

    if (node.type === "call_expression") {
      const name = getGoCallName(node);
      if (name && GO_FILTER_SLICE_CALL_NAMES.has(name)) return true;
    }

    return false;
  },

  // Functional loops: Go uses range; no built-in map/filter, but
  // common idiom is a for-range with an appended slice build.
  // We detect Go functional patterns via the sorting/stdlib calls below.
  // Direct range loops are already captured by for_statement in loopTypes.
  functionalLoopRegex: /\brange\b/g,

  // sort package: sort.Slice, sort.SliceStable, sort.Sort, slices.Sort
  sortingRegex: /\bsort\.\w+\s*\(|\bslices\.\w*[Ss]ort\w*\s*\(/,

  // encoding/json package
  jsonOperationsRegex:
    /\bjson\.(Marshal|Unmarshal|NewDecoder|NewEncoder|Decode|Encode)\b/,

  // Go variadic spread: fn(a, args...) or append(dst, src...)
  spreadOperatorRegex: /\.\.\.|spread/,

  // Linear search: slices.Contains, strings.Contains, manual index patterns
  linearSearchRegex:
    /\bslices\.Contains\s*\(|\bstrings\.Contains\s*\(|\bstrings\.Index\s*\(|\bslices\.Index\s*\(/,

  // Nested functional iteration: range inside range callback (approximation)
  nestedArrayMethodsRegex: /\brange\b[^}]+\brange\b/,

  // Keywords for regex-based depth estimation
  loopKeywordsForDepth: ["for"],

  // Go statements are not semicolon-terminated in source (gofmt removes them)
  binaryRecursionReturnRegex: /return[^\n]*\+[^\n]*|return[^\n]*\*[^\n]*/g,
};

/**
 * Extracts a language-agnostic SignalProfile from a Go AST node.
 *
 * @param node         A tree-sitter SyntaxNode (typically a function_declaration
 *                     or method_declaration node).
 * @param functionName The name of the function being analysed (for recursion
 *                     detection). Pass null for anonymous functions.
 */
export const extractSignals = createSignalExtractor(GO_CONFIG);
