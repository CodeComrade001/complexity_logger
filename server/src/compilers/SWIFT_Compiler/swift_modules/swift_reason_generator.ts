// ============================================================================
// SWIFT REASON GENERATOR
// ============================================================================
import { ReasonRule } from "../../shared_v2/interfaces.js";

export const SWIFT_EXTRA_TIME_RULES: ReasonRule[] = [
  {
    id: "swift-higher-order-chain",
    timeNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasHigherOrderFunction) && s.nestedLoops <= 1,
    reason:
      "Swift higher-order functions (.map, .filter, .compactMap) are eager — each produces a new Array in O(n)",
    impact: "low",
    confidence: 90,
    priority: 62,
  },
  {
    id: "swift-nested-higher-order",
    timeNotation: "O(n²)",
    condition: (_p, s) => s.hasNestedArrayMethods,
    reason:
      "Nested Swift higher-order functions (.map { $0.filter { ... } }) create O(n²) iterations",
    impact: "high",
    confidence: 87,
    priority: 91,
  },
  {
    id: "swift-sort",
    timeNotation: "O(n log n)",
    condition: (_p, s) => s.hasSorting,
    reason:
      "Swift sort() / sorted() uses introsort — O(n log n) time",
    impact: "medium",
    confidence: 95,
    priority: 76,
  },
  {
    id: "swift-async-loop",
    timeNotation: "O(n)",
    condition: (_p, s) => !!(s.languageSpecific?.hasAsyncAwait) && s.loops > 0,
    reason:
      "async/await inside a loop serialises n async tasks — O(n) sequential awaits. Use async let or TaskGroup for parallelism.",
    impact: "medium",
    confidence: 80,
    priority: 57,
  },
];

export const SWIFT_EXTRA_SPACE_RULES: ReasonRule[] = [
  {
    id: "swift-map-intermediate",
    spaceNotation: "O(n)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasHigherOrderFunction) && s.allocations > 0,
    reason:
      "Swift eager higher-order functions allocate a new Array<T> on each call — O(n) per step in the chain",
    impact: "medium",
    confidence: 88,
    priority: 73,
  },
  {
    id: "swift-optional-chain-constant",
    spaceNotation: "O(1)",
    condition: (_p, s) =>
      !!(s.languageSpecific?.hasOptionalChain) && !s.loopWithAllocation,
    reason:
      "Optional chaining (?.) is O(1) space — it short-circuits on nil without allocation",
    impact: "low",
    confidence: 90,
    priority: 48,
  },
];
