// ============================================================================
// HASKELL REASON GENERATOR
// Haskell-specific complexity rules — pure functional language.
// ============================================================================
import { ReasonRule } from "../../shared_v2/interfaces.js";

export const HASKELL_EXTRA_TIME_RULES: ReasonRule[] = [
  {
    id: "haskell-fold-linear",
    timeNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasFoldOperation) && !s.hasNestedArrayMethods,
    reason:
      "foldl/foldr traverses the entire list once — O(n) time. Note: foldl is O(n) space for lazy lists; use foldl' for strict accumulation.",
    impact: "low",
    confidence: 92,
    priority: 63,
  },
  {
    id: "haskell-nested-map",
    timeNotation: "O(n²)",
    condition: (_p, s) => s.hasNestedArrayMethods,
    reason:
      "Nested map/filter calls (map (map f) xss) traverse n × m elements — O(n²) for square inputs",
    impact: "high",
    confidence: 87,
    priority: 91,
  },
  {
    id: "haskell-list-comprehension-nested",
    timeNotation: "O(n²)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasListComprehension) && s.hasNestedArrayMethods,
    reason:
      "Nested list comprehension [ ... | x <- xs, y <- ys ] — O(|xs| × |ys|), quadratic for same-size inputs",
    impact: "high",
    confidence: 89,
    priority: 92,
  },
  {
    id: "haskell-list-comprehension-linear",
    timeNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasListComprehension) && !s.hasNestedArrayMethods,
    reason:
      "Single-generator list comprehension [ f x | x <- xs ] is O(n) — one pass over the input list",
    impact: "low",
    confidence: 90,
    priority: 62,
  },
  {
    id: "haskell-infinite-list",
    timeNotation: "O(n)",
    condition: (_p, s) => !!(s.languageSpecific?.hasInfiniteList),
    reason:
      "Infinite list ([1..], cycle, repeat) is lazily evaluated — complexity depends on how many elements are forced (take n = O(n))",
    impact: "medium",
    confidence: 70,
    priority: 55,
  },
  {
    id: "haskell-pattern-match-constant",
    timeNotation: "O(1)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasPatternMatch) &&
      s.recursion === false &&
      s.functionalLoopCount === 0,
    reason:
      "Exhaustive pattern matching without recursion or iteration — O(1) dispatch",
    impact: "low",
    confidence: 88,
    priority: 19,
  },
  {
    id: "haskell-guard-constant",
    timeNotation: "O(1)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasGuards) &&
      !s.recursion &&
      s.functionalLoopCount === 0,
    reason:
      "Guard conditions without recursion — O(1) conditional evaluation",
    impact: "low",
    confidence: 88,
    priority: 17,
  },
];

export const HASKELL_EXTRA_SPACE_RULES: ReasonRule[] = [
  {
    id: "haskell-lazy-space",
    spaceNotation: "O(n)",
    condition: (_p, s) => !!(s.languageSpecific?.hasLazyEvaluation) && s.recursion,
    reason:
      "Lazy evaluation builds up thunk chains proportional to input size — O(n) space on the heap before forcing",
    impact: "medium",
    confidence: 78,
    priority: 74,
  },
  {
    id: "haskell-list-materialised",
    spaceNotation: "O(n)",
    condition: (_p, s) =>
      s.usesDataStructures && !s.usesNestedDataStructures && !s.languageSpecific?.hasLazyEvaluation,
    reason:
      "Strict list materialisation stores all n elements in heap memory",
    impact: "low",
    confidence: 85,
    priority: 69,
  },
  {
    id: "haskell-tail-recursion-constant",
    spaceNotation: "O(1)",
    condition: (_p, s) =>
      s.recursion &&
      !s.recursionDoubled &&
      !s.recursionWithAllocation &&
      !s.languageSpecific?.hasLazyEvaluation,
    reason:
      "Strict tail-recursive function (with bang patterns or foldl') uses O(1) stack space — GHC optimises to a loop",
    impact: "low",
    confidence: 80,
    priority: 53,
  },
  {
    id: "haskell-fold-space",
    spaceNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasFoldOperation) && !!(s.languageSpecific?.hasLazyEvaluation),
    reason:
      "Lazy foldl builds an O(n) chain of unevaluated thunks — use foldl' (strict) to prevent stack overflow",
    impact: "high",
    confidence: 88,
    priority: 82,
  },
];
