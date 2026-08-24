export const dataSets = {
  loops: [
    "for",
    "while",
    "do",
    "for...of",
    "for...in",
    "forEach",
    "map",
    "filter",
    "reduce",
    "some",
    "every",
    "flatMap",
    "sort",
    "find",
    "findIndex",
    "includes",
    "indexOf",
    "slice",
    "splice"
  ],

  nestedLoopSignals: [
    "loop-inside-loop",
    "callback-inside-loop",
    "map/filter/reduce-inside-loop",
    "sort-inside-loop",
    "function-with-loop-called-inside-loop"
  ],

  recursion: [
    "self-call",
    "return-fn-call",
    "return-this-fn-call"
  ],

  divideAndConquer: [
    "mid-calculation",
    "Math.floor",
    "Math.ceil",
    "slice-recursive",
    "splice-recursive"
  ],

  dataIteration: [
    "length",
    "size",
    "keys()",
    "values()",
    "entries()"
  ],

  expensiveBuiltins: [
    "JSON.stringify",
    "JSON.parse",
    "RegExp",
    "match",
    "replace-regex"
  ],

  memoryAllocations: [
    "new Array",
    "[]",
    "{}",
    "new Set",
    "new Map",
    "push",
    "unshift",
    "concat",
    "slice",
    "splice",
    "spread-operator"
  ],

  temporaryStructures: [
    "array-literal-in-loop",
    "object-literal-in-loop",
    "set-in-loop",
    "map-in-loop"
  ],

  recursionSpace: [
    "recursive-calls",
    "build-array-recursively",
    "return-large-object-recursively"
  ],

  dataDuplication: [
    "slice",
    "splice",
    "concat",
    "json-deep-clone",
    "[...arr]",
    "{...obj}"
  ],

  branches: [
    "if",
    "else",
    "switch",
    "case",
    "ternary"
  ],

  inputDependent: [
    "length-in-loop-condition",
    "size-in-loop-condition",
    "parameter-as-loop-boundary"
  ],

  directCodePatterns: [
    "for",
    "while",
    "do...while",
    "for...of",
    "for...in",
    "foreach",
    "nested-loops",
    "if",
    "else-if",
    "switch",
    "ternary",
    "function-calls",
    "recursion",
    "mutual-recursion",
    "async-await",
    "call-inside-loop",
    "array-ops",
    "object-iteration",
    "map-ops",
    "set-ops",
    "queue-ops",
    "stack-ops",
    "linked-list-traversal",
    "tree-traversal",
    "graph-traversal"
  ],

  hiddenCostOps: [
    "sort",
    "includes",
    "indexOf",
    "find",
    "json-parse",
    "json-stringify",
    "regex",
    "string-concat-loop",
    "clone-object",
    "copy-array",
    "spread",
    "destructure",
    "deep-compare",
    "hashing",
    "serialization",
    "compression"
  ],

  spaceImpactOps: [
    "create-large-array",
    "create-large-object",
    "accumulate-list",
    "cache-results",
    "memoization",
    "temporary-buffer",
    "recursion-stack",
    "duplicate-input",
    "return-large-objects",
    "retain-references"
  ],

  algorithmicFactors: [
    "sorting",
    "searching",
    "pathfinding",
    "tree-ops",
    "hash-tables",
    "heaps",
    "dynamic-programming",
    "divide-and-conquer",
    "brute-force",
    "backtracking",
    "greedy"
  ],

  inputFactors: [
    "input-size",
    "input-distribution",
    "input-structure",
    "early-exit",
    "worst-path",
    "average-path",
    "best-path",
    "data-locality"
  ],

  runtimeFactors: [
    "gc-pressure",
    "memory-allocation-cost",
    "cache-misses",
    "jit-optimization",
    "jit-deopt",
    "event-loop-blocking",
    "thread-saturation",
    "io-latency",
    "network-latency",
    "disk-access",
    "concurrency-conflicts",
    "lock-contention",
    "environment-difference"
  ],

  architectureFactors: [
    "abstraction-layers",
    "external-library-calls",
    "chained-transformations",
    "cyclomatic-complexity",
    "nesting-depth",
    "dynamic-typing-overhead",
    "exception-handling",
    "proxy-reflection",
    "heavy-import-graph"
  ],

  languageSpecific: [
    "promise-hidden-loops",
    "async-iterator-loops",
    "spread-memory-cost",
    "runtime-coercion",
    "v8-optimization",
    "v8-deopt",
    "ts-emit-helpers"
  ],

  binaryRecursionIndicators: [
    "fibonacci",
    "tree-traversal",
    "combinations",
    "permutations",
    "backtracking"
  ],

  divideConquerIndicators: [
    "merge",
    "partition",
    "pivot",
    "binary-search",
    "quicksort",
    "mergesort",
    "midpoint"
  ],

  linearSearchIndicators: [
    "indexOf",
    "includes",
    "find",
    "findIndex",
    "some",
    "every",
    "lastIndexOf"
  ],

  // Complexity impact classification (helps prioritize issues)
  highImpactPatterns: [
    "nested-loops",
    "sort-in-loop",
    "exponential-recursion",
    "cartesian-product",
    "factorial-recursion"
  ],

  mediumImpactPatterns: [
    "single-loop",
    "sort",
    "linear-recursion",
    "hash-table-ops"
  ],

  lowImpactPatterns: [
    "direct-access",
    "hash-lookup",
    "constant-time-ops"
  ]

};
