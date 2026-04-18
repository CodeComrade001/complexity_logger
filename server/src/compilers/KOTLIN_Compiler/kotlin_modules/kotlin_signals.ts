// ============================================================================
// KOTLIN — SIGNAL EXTRACTOR
// Configures the shared signal factory with Kotlin-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-kotlin@0.3.8 grammar.
//
// Kotlin-specific notes:
//  - break and return are both represented as jump_expression;
//    the text content distinguishes them.
//  - conjunction_expression / disjunction_expression are used instead of
//    binary_expression for boolean logic.
//  - when_expression covers Java's switch + ternary.
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../../shared/signal-factory.js";
import { createSignalExtractor } from "../../shared/signal-factory.js";

// ── Loop constructs ──────────────────────────────────────────────────────────
const KOTLIN_LOOP_TYPES = new Set([
  "for_statement",      // for (x in list) {}
  "while_statement",    // while (cond) {}
  "do_while_statement", // do {} while (cond)
]);

// ── Conditional constructs ────────────────────────────────────────────────────
const KOTLIN_CONDITIONAL_TYPES = new Set([
  "if_expression",
  "when_expression",    // covers switch + pattern match
]);

// ── Break / Continue ──────────────────────────────────────────────────────────
// jump_expression encompasses: return, continue, break, throw
const KOTLIN_BREAK_CONTINUE_TYPES = new Set(["jump_expression"]);

// ── Return ────────────────────────────────────────────────────────────────────
// Same node type; we discriminate by text in the factory below.
const KOTLIN_RETURN_TYPES = new Set(["jump_expression"]);

// ── Boolean / binary expression types ────────────────────────────────────────
// Kotlin uses dedicated node types for &&/||
const KOTLIN_BINARY_EXPRESSION_TYPES = new Set([
  "binary_expression",       // arithmetic/comparison
  "conjunction_expression",  // A && B
  "disjunction_expression",  // A || B
]);

// ── Call expressions ──────────────────────────────────────────────────────────
const KOTLIN_CALL_EXPRESSION_TYPES = new Set(["call_expression"]);

// ── Variable / parameter declarations ────────────────────────────────────────
const KOTLIN_VARIABLE_TYPES = new Set([
  "property_declaration",  // val x = / var x =
  "variable_declaration",  // destructuring or multi-decl
  // parameters are named nodes within function_value_parameters
]);

/**
 * Returns the callee name from a Kotlin call_expression.
 * call_expression: simple_identifier call_suffix
 * The first named child is typically the callee expression.
 */
function getKotlinCalleeName(node: SyntaxNode): string | null {
  // The callee is the first named child before the call_suffix
  const first = node.namedChildren[0];
  if (!first) return null;
  return first.text.trim();
}

const KOTLIN_CONFIG: LanguageSignalConfig = {
  loopTypes: KOTLIN_LOOP_TYPES,
  conditionalTypes: KOTLIN_CONDITIONAL_TYPES,
  breakContinueTypes: KOTLIN_BREAK_CONTINUE_TYPES,
  returnTypes: KOTLIN_RETURN_TYPES,
  binaryExpressionTypes: KOTLIN_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: KOTLIN_CALL_EXPRESSION_TYPES,
  variableTypes: KOTLIN_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    // Kotlin object construction looks like a call_expression to a class name.
    // We catch it via the allocation-class regex in functionalLoopRegex instead.
    // Direct structural heuristic: call_expression with an object_declaration or
    // collection literal as argument.
    if (node.type === "object_literal") return true;
    if (node.type === "collection_literal") return true;

    if (node.type === "call_expression") {
      const name = getKotlinCalleeName(node);
      if (!name) return false;
      // Common collection constructors
      return (
        name === "listOf" ||
        name === "mutableListOf" ||
        name === "arrayListOf" ||
        name === "mapOf" ||
        name === "mutableMapOf" ||
        name === "hashMapOf" ||
        name === "setOf" ||
        name === "mutableSetOf" ||
        name === "arrayOf" ||
        name === "Array" ||
        name === "ArrayList" ||
        name === "HashMap" ||
        name === "HashSet" ||
        // Kotlin stdlib builders
        name === "buildList" ||
        name === "buildMap" ||
        name === "buildSet"
      );
    }

    return false;
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getKotlinCalleeName(node);
    return name === funcName;
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (this.isAllocationNode(child)) return true;
    }
    return false;
  },

  getBinaryOperator(node: SyntaxNode): string | null {
    // conjunction_expression / disjunction_expression → the type IS the operator
    if (node.type === "conjunction_expression") return "&&";
    if (node.type === "disjunction_expression") return "||";
    // binary_expression: children[1] is the operator token
    if (node.children.length >= 3) {
      return node.children[1]?.text ?? null;
    }
    return null;
  },

  isFilterOrSliceNode(node: SyntaxNode): boolean {
    if (node.type === "call_expression") {
      const name = getKotlinCalleeName(node);
      return (
        name === "filter" ||
        name === "slice" ||
        name === "subList" ||
        name === "drop" ||
        name === "take"
      );
    }
    return false;
  },

  // Kotlin functional iteration methods
  functionalLoopRegex:
    /\.(forEach|map|filter|flatMap|reduce|fold|onEach|mapNotNull)\s*\{/g,

  sortingRegex:
    /\.(sortedBy|sortedWith|sortedByDescending|sort)\s*[\({]|\bCollections\.sort\s*\(/,

  jsonOperationsRegex:
    /\bJson\.encode[Td]?\s*\(|\bJson\.decode[Fd]?\s*\(|\bGson\s*\(\)|\.toJson\s*\(|\.fromJson\s*\(|kotlinx\.serialization/,

  // Kotlin spread operator: *list
  spreadOperatorRegex: /\*\s*\w+|\btoTypedArray\s*\(|\bcopyOf\s*\(|\btoList\s*\(/,

  linearSearchRegex:
    /\.(contains|indexOf|find|findLast|firstOrNull|lastOrNull|any|none)\s*[\({]/,

  nestedArrayMethodsRegex:
    /\.(map|filter|forEach|flatMap)\s*\{[^}]*\.(map|filter|contains|indexOf|find)/,

  loopKeywordsForDepth: ["for", "while", "do", "forEach", "map", "filter", "reduce"],

  // Kotlin return statements do not end with `;`
  binaryRecursionReturnRegex: /return[^\n]*\+[^\n]*|return[^\n]*\*[^\n]*/g,
};

/**
 * Extracts a language-agnostic SignalProfile from a Kotlin AST node.
 */
export const extractSignals = createSignalExtractor(KOTLIN_CONFIG);
