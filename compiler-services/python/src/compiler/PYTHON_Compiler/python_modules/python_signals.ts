// ============================================================================
// PYTHON — SIGNAL EXTRACTOR
// Configures the shared signal factory with Python-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-python@0.25.0 grammar.
//
// Python-specific notes:
//  - No braces: depth is tracked by indentation-sensitive grammar, but
//    our regex depth estimator uses the "for"/"while" keyword count correctly.
//  - Comprehensions (list_comprehension, dict_comprehension, set_comprehension)
//    are treated as functional loops.
//  - json module: json.dumps / json.loads / json.dump / json.load.
//  - Spread equivalent: *args, **kwargs unpacking, list(other), dict(other).
//  - Linear search: `in` operator on lists is O(n); `in` on set/dict is O(1).
//    We detect `.index()`, `.count()` calls as linear search signals.
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../../shared/signal-factory.js";
import { createSignalExtractor } from "../../shared/signal-factory.js";

// ── Loop constructs ──────────────────────────────────────────────────────────
const PYTHON_LOOP_TYPES = new Set([
  "for_statement",   // for x in iterable:
  "while_statement", // while cond:
]);

// ── Conditional constructs ───────────────────────────────────────────────────
const PYTHON_CONDITIONAL_TYPES = new Set([
  "if_statement",
  "elif_clause",
  "conditional_expression", // ternary: a if cond else b
]);

// ── Break / Continue ─────────────────────────────────────────────────────────
const PYTHON_BREAK_CONTINUE_TYPES = new Set([
  "break_statement",
  "continue_statement",
]);

// ── Return ───────────────────────────────────────────────────────────────────
const PYTHON_RETURN_TYPES = new Set(["return_statement"]);

// ── Binary / boolean expression types ────────────────────────────────────────
const PYTHON_BINARY_EXPRESSION_TYPES = new Set([
  "boolean_operator",  // and / or
  "binary_operator",   // arithmetic/bitwise
  "comparison_operator",
]);

// ── Call expressions ─────────────────────────────────────────────────────────
// Python uses `call` for all call expressions.
const PYTHON_CALL_EXPRESSION_TYPES = new Set(["call"]);

// ── Variable / parameter declarations ────────────────────────────────────────
const PYTHON_VARIABLE_TYPES = new Set([
  "assignment",
  "augmented_assignment",
  "named_expression",  // walrus :=
  "parameters",
]);

// ── Allocation node type set ─────────────────────────────────────────────────
const PYTHON_ALLOCATION_NODE_TYPES = new Set([
  "list",            // [1, 2, 3]
  "dictionary",      // {k: v}
  "set",             // {1, 2}
  "list_comprehension",
  "dictionary_comprehension",
  "set_comprehension",
]);

// Python built-in constructors that indicate heap allocation
const PYTHON_ALLOCATION_CALL_NAMES = new Set([
  "list", "dict", "set", "tuple", "bytearray", "bytes",
  "array", "deque", "defaultdict", "OrderedDict", "Counter",
  "heapq", "PriorityQueue", "Queue",
]);

/**
 * Returns the name of the function being called.
 * Python call node: function argument_list
 * The function child may be an identifier or an attribute (obj.method).
 */
function getPythonCalleeName(node: SyntaxNode): string | null {
  const fn = node.namedChildren[0];
  if (!fn) return null;

  if (fn.type === "identifier") return fn.text;

  // attribute: obj.method — return the method name (last part)
  if (fn.type === "attribute") {
    const attr = fn.childForFieldName("attribute") ??
      fn.namedChildren[fn.namedChildren.length - 1];
    return attr?.text ?? null;
  }

  return fn.text.trim();
}

const PYTHON_CONFIG: LanguageSignalConfig = {
  loopTypes: PYTHON_LOOP_TYPES,
  conditionalTypes: PYTHON_CONDITIONAL_TYPES,
  breakContinueTypes: PYTHON_BREAK_CONTINUE_TYPES,
  returnTypes: PYTHON_RETURN_TYPES,
  binaryExpressionTypes: PYTHON_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: PYTHON_CALL_EXPRESSION_TYPES,
  variableTypes: PYTHON_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    if (PYTHON_ALLOCATION_NODE_TYPES.has(node.type)) return true;

    if (node.type === "call") {
      const name = getPythonCalleeName(node);
      if (name && PYTHON_ALLOCATION_CALL_NAMES.has(name)) return true;
    }

    return false;
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getPythonCalleeName(node);
    return name === funcName;
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (PYTHON_ALLOCATION_NODE_TYPES.has(child.type)) return true;
      if (child.type === "call") {
        const name = getPythonCalleeName(child);
        if (name && PYTHON_ALLOCATION_CALL_NAMES.has(name)) return true;
      }
    }
    return false;
  },

  getBinaryOperator(node: SyntaxNode): string | null {
    if (node.type === "boolean_operator") {
      // boolean_operator: left 'and'/'or' right
      // Operator is the unnamed child between named ones
      for (const child of node.children) {
        if (!child.isNamed && (child.text === "and" || child.text === "or")) {
          return child.text === "and" ? "&&" : "||";
        }
      }
    }
    if (node.type === "binary_operator") {
      // binary_operator: left op right — children[1] is operator
      return node.children[1]?.text ?? null;
    }
    return null;
  },

  isFilterOrSliceNode(node: SyntaxNode): boolean {
    // Python slice syntax: list[start:stop:step]
    if (node.type === "subscript") {
      // Check if any child is a slice
      for (const child of node.children) {
        if (child.type === "slice") return true;
      }
    }

    if (node.type === "call") {
      const name = getPythonCalleeName(node);
      return name === "filter" || name === "islice" || name === "slice";
    }

    return false;
  },

  // List/dict/set comprehensions + functional builtins used as loops
  // map(), filter(), sorted(), enumerate(), zip() are all O(n) iterators
  functionalLoopRegex:
    /\b(map|filter|sorted|enumerate|zip|sum|any|all|max|min)\s*\(|\[.+\bfor\b.+\bin\b|\{.+\bfor\b.+\bin\b/g,

  // sort() / sorted()
  sortingRegex: /\bsorted\s*\(|\.sort\s*\(/,

  // Standard library json module
  jsonOperationsRegex:
    /\bjson\.(dumps|loads|dump|load)\s*\(|pickle\.(dumps|loads|dump|load)\s*\(/,

  // Spread: *args, **kwargs unpacking in calls; list(x), dict(x) copy patterns
  spreadOperatorRegex:
    /\*\s*\w+|\*\*\s*\w+|\blist\s*\(\w|\bdict\s*\(\w|\b\.copy\s*\(|\bcopy\.deepcopy\s*\(/,

  // Python linear search methods
  linearSearchRegex:
    /\b(in\s+\w+|\b\.index\s*\(|\b\.find\s*\(|\b\.count\s*\(|\bnext\s*\(filter)/,

  // Nested comprehension or nested map/filter call
  nestedArrayMethodsRegex:
    /\[.+\bfor\b.+\bfor\b.+\bin\b|\bmap\s*\([^)]*\bmap\s*\(|\bfilter\s*\([^)]*\bfilter\s*\(/,

  loopKeywordsForDepth: ["for", "while"],

  // Python statements don't end in `;`; look for binary ops in return lines
  binaryRecursionReturnRegex: /return[^\n]*\+[^\n]*|return[^\n]*\*[^\n]*/g,
};

/**
 * Extracts a language-agnostic SignalProfile from a Python AST node.
 */
export const extractSignals = createSignalExtractor(PYTHON_CONFIG);
