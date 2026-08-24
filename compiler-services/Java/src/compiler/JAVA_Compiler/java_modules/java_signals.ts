// ============================================================================
// JAVA — SIGNAL EXTRACTOR
// Configures the shared signal factory with Java-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-java@0.23.5 grammar.
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../../shared/signal-factory.js";
import { createSignalExtractor } from "../../shared/signal-factory.js";

// ── Java loop constructs ─────────────────────────────────────────────────────
const JAVA_LOOP_TYPES = new Set([
  "for_statement",          // for (init; cond; update) {}
  "enhanced_for_statement", // for (T x : iterable) {}
  "while_statement",        // while (cond) {}
  "do_statement",           // do {} while (cond);
]);

// ── Conditional constructs ───────────────────────────────────────────────────
const JAVA_CONDITIONAL_TYPES = new Set([
  "if_statement",
  "switch_expression",
  "switch_block",
  "ternary_expression",
]);

// ── Break / Continue ─────────────────────────────────────────────────────────
const JAVA_BREAK_CONTINUE_TYPES = new Set([
  "break_statement",
  "continue_statement",
]);

// ── Return ───────────────────────────────────────────────────────────────────
const JAVA_RETURN_TYPES = new Set(["return_statement"]);

// ── Binary / boolean expressions ─────────────────────────────────────────────
const JAVA_BINARY_EXPRESSION_TYPES = new Set([
  "binary_expression",
]);

// ── Call expressions ─────────────────────────────────────────────────────────
// Java uses method_invocation for all calls.
const JAVA_CALL_EXPRESSION_TYPES = new Set([
  "method_invocation",
  "explicit_constructor_invocation", // super()/this() calls
]);

// ── Variable / parameter declarations ────────────────────────────────────────
const JAVA_VARIABLE_TYPES = new Set([
  "local_variable_declaration",
  "formal_parameter",
  "variable_declarator",
]);

// ── Names that indicate heap allocation in Java ───────────────────────────────
const JAVA_ALLOCATION_TYPES = new Set([
  "object_creation_expression", // new Foo(...)
  "array_creation_expression",  // new int[n]
  "array_initializer",          // { 1, 2, 3 }
]);

/**
 * Returns the simple method name from a Java method_invocation node.
 * method_invocation: [object '.'] name '(' arguments ')'
 */
function getJavaMethodName(node: SyntaxNode): string | null {
  // The "name" field is the method name identifier
  const nameNode = node.childForFieldName("name");
  return nameNode?.text ?? null;
}

/**
 * Returns the full invocation text stripped to the last identifier
 * so we can detect self-recursive calls regardless of `this.` prefix.
 */
function getJavaCallFullName(node: SyntaxNode): string | null {
  // Try "name" field first
  const name = getJavaMethodName(node);
  if (name) return name;
  // Fallback: first named child text
  return node.namedChildren[0]?.text ?? null;
}

const JAVA_CONFIG: LanguageSignalConfig = {
  loopTypes: JAVA_LOOP_TYPES,
  conditionalTypes: JAVA_CONDITIONAL_TYPES,
  breakContinueTypes: JAVA_BREAK_CONTINUE_TYPES,
  returnTypes: JAVA_RETURN_TYPES,
  binaryExpressionTypes: JAVA_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: JAVA_CALL_EXPRESSION_TYPES,
  variableTypes: JAVA_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    return JAVA_ALLOCATION_TYPES.has(node.type);
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getJavaCallFullName(node);
    return name === funcName;
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (JAVA_ALLOCATION_TYPES.has(child.type)) return true;
    }
    return false;
  },

  getBinaryOperator(node: SyntaxNode): string | null {
    // binary_expression: left op right — operator is children[1]
    if (node.children.length >= 3) {
      return node.children[1]?.text ?? null;
    }
    return null;
  },

  isFilterOrSliceNode(node: SyntaxNode): boolean {
    // Java stream().filter(), subList(), Arrays.copyOf all produce sub-sequences
    if (node.type === "method_invocation") {
      const name = getJavaMethodName(node);
      return (
        name === "filter" ||
        name === "subList" ||
        name === "copyOf" ||
        name === "copyOfRange" ||
        name === "slice"
      );
    }
    return false;
  },

  // Stream API functional loops: .forEach(), .stream().map(), .stream().filter()
  // Also: .stream(), .parallelStream()
  functionalLoopRegex:
    /\.(forEach|stream|parallelStream|map|filter|flatMap|reduce|collect)\s*\(/g,

  // Java sort patterns
  sortingRegex:
    /\bCollections\.sort\s*\(|\bArrays\.sort\s*\(|\b\.sorted\s*\(|\b\.sort\s*\(/,

  // Jackson / Gson / built-in JSON
  jsonOperationsRegex:
    /new\s+ObjectMapper\s*\(\)|\.writeValueAsString\s*\(|\.readValue\s*\(|\.toJson\s*\(|\.fromJson\s*\(|\.toJsonTree\s*\(|JSONObject\s*\(|JSONArray\s*\(/,

  // Java has no spread but array copy patterns are analogous
  spreadOperatorRegex:
    /System\.arraycopy\s*\(|Arrays\.copyOf\s*\(|\.clone\s*\(\)|\.toArray\s*\(/,

  // Linear search in collections/arrays
  linearSearchRegex:
    /\.(contains|indexOf|lastIndexOf|find|findFirst|findAny)\s*\(/,

  // Nested stream/functional calls
  nestedArrayMethodsRegex:
    /\.(map|filter|forEach|flatMap)\s*\([^)]*\.(map|filter|contains|indexOf|find)/,

  loopKeywordsForDepth: ["for", "while", "do", "forEach", "stream"],
};

/**
 * Extracts a language-agnostic SignalProfile from a Java AST node.
 */
export const extractSignals = createSignalExtractor(JAVA_CONFIG);
