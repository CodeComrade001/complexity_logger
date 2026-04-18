// ============================================================================
// ZIG — SIGNAL EXTRACTOR
// Configures the shared signal factory with Zig-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-zig@0.2.0 grammar.
//
// Zig-specific notes:
//  - `for_expression`   covers `for (slice) |item| {}` and
//                       `for (0..n) |i| {}` (range loop).
//  - `while_expression` covers `while (cond) {}` and
//                       `while (iter.next()) |val| {}` (iterator pattern).
//  - There is no `do-while`; instead `while (true)` with a `break`.
//  - `if_expression`    covers `if (cond) {} else {}` and optional unwrap:
//                       `if (opt) |val| {}`.
//  - `switch_expression` covers `switch (x) { .foo => ..., else => ... }`.
//  - `break_expression` / `continue_expression` carry optional labels.
//  - `return_expression` is the return statement.
//  - Allocation: Zig uses allocator.alloc / allocator.create / std.ArrayList
//    / std.ArrayHashMap etc. All are call_expression nodes.
//  - Spread equivalent: std.mem.copy, std.mem.copyBackwards, @memcpy.
//  - JSON: std.json.stringify / std.json.parse.
//  - Sort: std.sort.sort, std.sort.pdqSort, std.mem.sort.
//  - Linear search: std.mem.indexOf, std.mem.indexOfScalar, std.mem.containsAtLeast.
//  - `assignment_statement` covers `const x =` and `var x =` declarations.
//  - Binary recursion regex needs to handle Zig's expression syntax (no `;` on
//    implicit returns, but explicit `return` expressions end with `;`).
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../../shared/signal-factory.js";
import { createSignalExtractor } from "../../shared/signal-factory.js";

// ── Loop constructs ──────────────────────────────────────────────────────────
const ZIG_LOOP_TYPES = new Set([
  "for_expression",   // for (slice) |item| {}
  "while_expression", // while (cond) {}
]);

// ── Conditional constructs ───────────────────────────────────────────────────
const ZIG_CONDITIONAL_TYPES = new Set([
  "if_expression",
  "switch_expression",
]);

// ── Break / Continue ─────────────────────────────────────────────────────────
const ZIG_BREAK_CONTINUE_TYPES = new Set([
  "break_expression",
  "continue_expression",
]);

// ── Return ───────────────────────────────────────────────────────────────────
const ZIG_RETURN_TYPES = new Set(["return_expression"]);

// ── Binary / boolean expressions ─────────────────────────────────────────────
const ZIG_BINARY_EXPRESSION_TYPES = new Set(["binary_expression"]);

// ── Call expressions ─────────────────────────────────────────────────────────
const ZIG_CALL_EXPRESSION_TYPES = new Set([
  "call_expression",
  "build_in_call_expr",  // @builtinFn() calls like @memcpy, @memset
]);

// ── Variable / parameter declarations ────────────────────────────────────────
const ZIG_VARIABLE_TYPES = new Set([
  "assignment_statement", // const x = ...; / var x = ...;
  "parameter",
  "variadic_parameter",
]);

// ── Allocation call name fragments ───────────────────────────────────────────
// Zig allocations always go through an Allocator interface.
const ZIG_ALLOCATION_METHOD_NAMES = new Set([
  "alloc",
  "create",
  "realloc",
  "dupe",
  "dupeZ",
  // Container initialisation
  "init",    // ArrayList.init(allocator) etc.
  "initCapacity",
]);

// Standard container type constructors
const ZIG_ALLOCATION_TYPE_NAMES = new Set([
  "ArrayList",
  "ArrayListUnmanaged",
  "ArrayHashMap",
  "HashMap",
  "AutoHashMap",
  "StringHashMap",
  "BoundedArray",
  "MultiArrayList",
]);

/**
 * Returns the callee name from a Zig call_expression.
 * call_expression: expression '(' arguments ')'
 * The callee is the first child (the expression being called).
 */
function getZigCalleeName(node: SyntaxNode): string | null {
  const callee = node.namedChildren[0];
  if (!callee) return null;

  if (callee.type === "identifier") return callee.text;

  // field_expression: receiver '.' field
  if (callee.type === "field_expression") {
    const field = callee.childForFieldName("field");
    return field?.text ?? callee.text.split(".").pop() ?? null;
  }

  return callee.text.trim();
}

/**
 * Returns the full dotted path of a Zig call_expression callee.
 * E.g. "allocator.alloc" or "std.sort.sort".
 */
function getZigCallFullPath(node: SyntaxNode): string | null {
  const callee = node.namedChildren[0];
  if (!callee) return null;
  return callee.text.trim();
}

const ZIG_CONFIG: LanguageSignalConfig = {
  loopTypes: ZIG_LOOP_TYPES,
  conditionalTypes: ZIG_CONDITIONAL_TYPES,
  breakContinueTypes: ZIG_BREAK_CONTINUE_TYPES,
  returnTypes: ZIG_RETURN_TYPES,
  binaryExpressionTypes: ZIG_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: ZIG_CALL_EXPRESSION_TYPES,
  variableTypes: ZIG_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    // struct_construction / struct_expression: MyType { .field = val }
    if (node.type === "struct_expression" || node.type === "struct_construction") {
      return true;
    }

    // array_expression: .{ 1, 2, 3 } or [N]T{ ... }
    if (node.type === "array_expression" || node.type === "anonymous_array_expr") {
      return true;
    }

    if (node.type === "call_expression") {
      const method = getZigCalleeName(node);
      const full = getZigCallFullPath(node);

      if (method && ZIG_ALLOCATION_METHOD_NAMES.has(method)) return true;

      // Container type .init() pattern: ArrayList.init, HashMap.init
      if (full) {
        for (const typeName of ZIG_ALLOCATION_TYPE_NAMES) {
          if (full.includes(typeName)) return true;
        }
      }
    }

    return false;
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getZigCalleeName(node);
    return name === funcName;
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (
        child.type === "struct_expression" ||
        child.type === "struct_construction" ||
        child.type === "array_expression" ||
        child.type === "anonymous_array_expr"
      ) {
        return true;
      }
      if (child.type === "call_expression") {
        const method = getZigCalleeName(child);
        if (method && ZIG_ALLOCATION_METHOD_NAMES.has(method)) return true;
      }
    }
    return false;
  },

  getBinaryOperator(node: SyntaxNode): string | null {
    // binary_expression: left op right — children[1] is the operator token
    if (node.children.length >= 3) {
      return node.children[1]?.text ?? null;
    }
    return null;
  },

  isFilterOrSliceNode(node: SyntaxNode): boolean {
    // Zig slice expression: slice[start..end] — index_expression with range
    if (node.type === "index_expression") {
      for (const child of node.children) {
        if (child.type === "binary_expression" && child.text.includes("..")) {
          return true;
        }
      }
    }

    if (node.type === "call_expression") {
      const full = getZigCallFullPath(node);
      if (!full) return false;
      return (
        full.includes("mem.copy") ||
        full.includes("mem.copyBackwards") ||
        full.includes("mem.copyForwards") ||
        full.includes("mem.sliceTo") ||
        full.endsWith(".filter") ||
        full.endsWith(".take") ||
        full.endsWith(".skip")
      );
    }

    // @memcpy built-in
    if (node.type === "build_in_call_expr") {
      return node.text.startsWith("@memcpy");
    }

    return false;
  },

  // Zig has no built-in functional iteration methods; approximation via
  // common iterator-pattern function names in typical Zig code.
  functionalLoopRegex:
    /\bstd\.mem\.(map|filter|forEach)\s*\(|\bIterator\s*\(|\bstd\.meta\.fields\s*\(/g,

  // std.sort family
  sortingRegex:
    /\bstd\.sort\.(sort|pdqSort|insertionSort|blockSort)\s*\(|\bstd\.mem\.sort\s*\(/,

  // std.json family
  jsonOperationsRegex:
    /\bstd\.json\.(stringify|parse|parseFromSlice|stringifyAlloc)\s*\(/,

  // @memcpy, std.mem.copy, slice duplication
  spreadOperatorRegex:
    /@memcpy\s*\(|\bstd\.mem\.(copy|dupe|dupeZ)\s*\(|\.dupe\s*\(/,

  // std.mem linear search
  linearSearchRegex:
    /\bstd\.mem\.(indexOf|indexOfScalar|indexOfPos|containsAtLeast|lastIndexOf)\s*\(/,

  // Nested for loops (approximation in regex)
  nestedArrayMethodsRegex: /\bfor\s*\([^)]+\)[^{]*\{[^}]*\bfor\s*\(/,

  loopKeywordsForDepth: ["for", "while"],

  // Zig return uses explicit `return expr;`
  binaryRecursionReturnRegex: /return[^;]*\+[^;]*;|return[^;]*\*[^;]*;/g,
};

/**
 * Extracts a language-agnostic SignalProfile from a Zig AST node.
 */
export const extractSignals = createSignalExtractor(ZIG_CONFIG);
