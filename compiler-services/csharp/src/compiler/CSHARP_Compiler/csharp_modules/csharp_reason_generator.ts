// ============================================================================
// C# REASON GENERATOR
// ============================================================================

import { ReasonRule } from "../shared/interfaces.js";

export const CSHARP_EXTRA_TIME_RULES: ReasonRule[] = [
  {
    id: "csharp-linq-chain",
    timeNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasLinqQuery) && s.nestedLoops <= 1,
    reason:
      "LINQ method chain (.Where().Select().ToList()) performs deferred evaluation — O(n) single pass",
    impact: "low",
    confidence: 90,
    priority: 63,
  },
  {
    id: "csharp-linq-nested",
    timeNotation: "O(n²)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasLinqQuery) && s.hasNestedArrayMethods,
    reason:
      "Nested LINQ queries (query inside a Select/Where callback) create O(n²) iterations",
    impact: "high",
    confidence: 87,
    priority: 91,
  },
  {
    id: "csharp-parallel",
    timeNotation: "O(n)",
    condition: (_p, s) => !!(s.languageSpecific?.hasParallelOperations),
    reason:
      "Parallel.ForEach / Task.WhenAll splits work — algorithmic complexity stays O(n), wall-clock improves by thread count",
    impact: "low",
    confidence: 75,
    priority: 55,
  },
  {
    id: "csharp-async-await",
    timeNotation: "O(n)",
    condition: (_p, s) => !!(s.languageSpecific?.hasAsyncAwait) && s.loops > 0,
    reason:
      "async/await inside a loop serializes async tasks — effectively O(n) sequential I/O waits",
    impact: "medium",
    confidence: 80,
    priority: 57,
  },
];

export const CSHARP_EXTRA_SPACE_RULES: ReasonRule[] = [
  {
    id: "csharp-linq-tolist",
    spaceNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasLinqQuery) && s.allocations > 0,
    reason:
      ".ToList() / .ToArray() materialises the entire deferred LINQ query — O(n) heap allocation",
    impact: "medium",
    confidence: 88,
    priority: 73,
  },
];
