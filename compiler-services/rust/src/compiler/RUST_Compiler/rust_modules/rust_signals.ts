// ============================================================================
// RUST — SIGNAL EXTRACTOR
// Configures the shared signal factory with Rust-specific tree-sitter node types.
//
// AST node types verified against tree-sitter-rust@0.24.0 grammar.
//
// Rust-specific notes:
//  - `loop_expression`  covers infinite `loop {}` blocks.
//  - `for_expression`   covers `for x in iter {}`.
//  - `while_expression` covers `while cond {}`.
//  - `match_expression` is the primary conditional dispatch (like switch).
//  - `closure_expression` is the lambda / anonymous function form.
//  - `break_expression` and `continue_expression` carry optional labels and values.
//  - Allocation: Rust uses `Vec::new()`, `vec![...]`, `HashMap::new()`, etc.
//    There is no single `new` keyword; allocation is always a call expression.
//  - Spread equivalent: `.clone()`, `to_vec()`, `collect()` calls.
//  - `let_declaration` is the primary variable binding.
//  - JSON: serde_json::to_string / serde_json::from_str.
//  - Sorting: `.sort()`, `.sort_by()`, `.sort_unstable()`.
//  - Binary recursion: `return f(n-1) + f(n-2)` or `f(n-1) + f(n-2)` as expr.
// ============================================================================

import type { LanguageSignalConfig, SyntaxNode } from "../shared/signal-factory.js";
import { createSignalExtractor } from "../shared/signal-factory.js";

// ── Loop constructs ──────────────────────────────────────────────────────────
const RUST_LOOP_TYPES = new Set([
  "for_expression",   // for x in iter {}
  "while_expression", // while cond {}
  "loop_expression",  // loop {}  (infinite; break carries value)
]);

// ── Conditional constructs ───────────────────────────────────────────────────
const RUST_CONDITIONAL_TYPES = new Set([
  "if_expression",
  "match_expression",
  "if_let_expression",  // if let Pat = val {}  (pattern-matching conditional)
]);

// ── Break / Continue ─────────────────────────────────────────────────────────
const RUST_BREAK_CONTINUE_TYPES = new Set([
  "break_expression",
  "continue_expression",
]);

// ── Return ───────────────────────────────────────────────────────────────────
const RUST_RETURN_TYPES = new Set(["return_expression"]);

// ── Binary / boolean expressions ─────────────────────────────────────────────
const RUST_BINARY_EXPRESSION_TYPES = new Set(["binary_expression"]);

// ── Call expressions ─────────────────────────────────────────────────────────
// Rust has two forms: function calls and method calls.
const RUST_CALL_EXPRESSION_TYPES = new Set([
  "call_expression",        // fn_name(args)
  "generic_function",       // fn_name::<T>(args)
]);

// ── Variable / parameter declarations ────────────────────────────────────────
const RUST_VARIABLE_TYPES = new Set([
  "let_declaration", // let x = ...;
  "parameter",       // fn params
]);

// ── Allocation call names (receiver-less) ────────────────────────────────────
const RUST_ALLOCATION_CALL_NAMES = new Set([
  // Vec
  "Vec::new", "vec",           // vec![] macro — caught by regex fallback
  // HashMap / BTreeMap
  "HashMap::new", "BTreeMap::new", "HashMap::with_capacity",
  // HashSet / BTreeSet
  "HashSet::new", "BTreeSet::new",
  // Box / Rc / Arc
  "Box::new", "Rc::new", "Arc::new",
  // String
  "String::new", "String::from", "String::with_capacity",
  // VecDeque / LinkedList
  "VecDeque::new", "LinkedList::new",
]);

/**
 * Returns the called path from a Rust call_expression.
 * call_expression: function arguments
 * The function field is a path, identifier, or field_expression.
 */
function getRustCalleeName(node: SyntaxNode): string | null {
  const fn = node.childForFieldName("function");
  if (!fn) return null;
  return fn.text.trim();
}

const RUST_CONFIG: LanguageSignalConfig = {
  loopTypes: RUST_LOOP_TYPES,
  conditionalTypes: RUST_CONDITIONAL_TYPES,
  breakContinueTypes: RUST_BREAK_CONTINUE_TYPES,
  returnTypes: RUST_RETURN_TYPES,
  binaryExpressionTypes: RUST_BINARY_EXPRESSION_TYPES,
  callExpressionTypes: RUST_CALL_EXPRESSION_TYPES,
  variableTypes: RUST_VARIABLE_TYPES,

  isAllocationNode(node: SyntaxNode): boolean {
    // struct_expression: MyStruct { field: val }
    if (node.type === "struct_expression") return true;

    // array_expression: [val; N] or [1, 2, 3]
    if (node.type === "array_expression") return true;

    // call_expression to a known allocation path
    if (node.type === "call_expression") {
      const name = getRustCalleeName(node);
      if (name) {
        for (const known of RUST_ALLOCATION_CALL_NAMES) {
          if (name === known || name.endsWith(`::${known.split("::")[1] ?? known}`)) {
            return true;
          }
        }
        // .collect() creates a new collection from an iterator
        if (name.endsWith(".collect")) return true;
      }
    }

    return false;
  },

  isSelfCallNode(node: SyntaxNode, funcName: string): boolean {
    const name = getRustCalleeName(node);
    if (!name) return false;
    // Handle both `func_name(...)` and `Self::func_name(...)`
    return name === funcName || name.endsWith(`::${funcName}`);
  },

  isNestedAllocationInChildren(node: SyntaxNode): boolean {
    for (const child of node.children) {
      if (
        child.type === "struct_expression" ||
        child.type === "array_expression"
      ) {
        return true;
      }
      if (child.type === "call_expression") {
        const name = getRustCalleeName(child);
        if (name) {
          for (const known of RUST_ALLOCATION_CALL_NAMES) {
            if (name === known || name.endsWith(`::${known.split("::")[1] ?? known}`)) {
              return true;
            }
          }
        }
      }
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
    // Rust slice expressions: &arr[start..end]
    if (node.type === "index_expression") {
      for (const child of node.children) {
        if (child.type === "range_expression") return true;
      }
    }

    // Iterator adapter calls: .filter(), .take(), .skip(), .windows(), .chunks()
    if (node.type === "call_expression") {
      const name = getRustCalleeName(node);
      if (name) {
        const method = name.split(".").pop() ?? "";
        return (
          method === "filter" ||
          method === "take" ||
          method === "skip" ||
          method === "windows" ||
          method === "chunks" ||
          method === "split" ||
          method === "drain"
        );
      }
    }

    return false;
  },

  // Rust functional iteration: .iter().map(), .iter().filter(), etc.
  // Also: .into_iter(), .iter_mut()
  functionalLoopRegex:
    /\.(iter|into_iter|iter_mut)\s*\(\s*\)\s*\.(map|filter|flat_map|for_each|fold|reduce|any|all)\s*\(|\.(map|filter|flat_map|for_each|fold)\s*\(\s*\|/g,

  // sort / sort_by / sort_unstable / sort_unstable_by
  sortingRegex: /\.(sort|sort_by|sort_by_key|sort_unstable|sort_unstable_by|sort_unstable_by_key)\s*\(/,

  // serde_json serialization / deserialization
  jsonOperationsRegex:
    /serde_json::(to_string|from_str|to_value|from_value|to_writer|from_reader)\s*\(|\.serialize\s*\(|\.deserialize\s*\(/,

  // Clone / copy patterns; spread-like: ..Base { } struct update syntax
  spreadOperatorRegex:
    /\.clone\s*\(\)|\.to_vec\s*\(\)|\.to_owned\s*\(\)|\.collect\s*\(\)|\.copy_from_slice\s*\(|\.\.\s*\w+/,

  // Linear search in iterators or slices
  linearSearchRegex:
    /\.(contains|position|find|rfind|index_of|iter\(\)\.find)\s*\(/,

  // Nested iterator adapter chains: .map(|x| iter.filter(...))
  nestedArrayMethodsRegex:
    /\.(map|filter|for_each|flat_map)\s*\(\s*\|[^|]+\|\s*[^}]*\.(map|filter|contains|find|position)/,

  loopKeywordsForDepth: ["for", "while", "loop"],

  // Rust can have implicit returns (last expression without `;`), so match both:
  binaryRecursionReturnRegex:
    /return[^\n]*\+[^\n]*|return[^\n]*\*[^\n]*|\n\s*\w+\s*\([^)]*\)\s*\+\s*\w+\s*\([^)]*\)/g,
};

/**
 * Extracts a language-agnostic SignalProfile from a Rust AST node.
 */
export const extractSignals = createSignalExtractor(RUST_CONFIG);
