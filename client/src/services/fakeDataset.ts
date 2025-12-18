import type { MethodPreview } from "../types/fileUploadInterface";

export const MOCK_METHOD_COMPLEXITY: MethodPreview[] = [
  {
    id: "constantOperation:13",
    kind: "method",
    name: "constantOperation",
    startLine: 13,
    endLine: 15,
    text: "constantOperation(): number { return 1 + 1; }",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    timeScore: 5,
    spaceScore: 5,
    totalScore: 10,
    riskLevel: "LOW",
    confidence: 90,
    reasons: [],
  },
  {
    id: "linearSearch:41",
    kind: "method",
    name: "linearSearch",
    startLine: 41,
    endLine: 46,
    text: "for (...) { if (...) return i }",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    timeScore: 18,
    spaceScore: 5,
    totalScore: 23,
    riskLevel: "MEDIUM",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements",
        impact: "medium",
        confidence: 80,
        lineNumber: 41,
      },
    ],
  },
  {
    id: "binarySearch:23",
    kind: "method",
    name: "binarySearch",
    startLine: 23,
    endLine: 34,
    text: "while (left <= right) { ... }",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    timeScore: 12,
    spaceScore: 5,
    totalScore: 17,
    riskLevel: "LOW",
    confidence: 85,
    reasons: [],
  },
  {
    id: "nestedLoop:69",
    kind: "method",
    name: "nestedLoop",
    startLine: 69,
    endLine: 79,
    text: "for (...) { for (...) {...} }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    timeScore: 33,
    spaceScore: 5,
    totalScore: 38,
    riskLevel: "MEDIUM",
    confidence: 82,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Two nested loops produce quadratic time",
        impact: "high",
        confidence: 85,
        lineNumber: 69,
      },
    ],
  },
  {
    id: "mergeSort:54",
    kind: "method",
    name: "mergeSort",
    startLine: 54,
    endLine: 62,
    text: "recursive split and merge",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 25,
    spaceScore: 20,
    totalScore: 45,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "space",
        pattern: "array-copy",
        detail: "Temporary arrays created during merge",
        impact: "medium",
        confidence: 70,
        lineNumber: 54,
      },
    ],
  },
  {
    id: "fibonacci:104",
    kind: "method",
    name: "exponentialFibonacci",
    startLine: 104,
    endLine: 107,
    text: "return fib(n-1) + fib(n-2)",
    timeComplexity: "O(2^n)",
    spaceComplexity: "O(n)",
    timeScore: 45,
    spaceScore: 10,
    totalScore: 55,
    riskLevel: "HIGH",
    confidence: 90,
    reasons: [
      {
        type: "time",
        pattern: "recursive-branching",
        detail: "Exponential recursion growth",
        impact: "critical",
        confidence: 90,
        lineNumber: 104,
      },
    ],
  },
  {
    id: "logarithmicSearch:23",
    kind: "method",
    name: "logarithmicSearch",
    startLine: 23,
    endLine: 34,
    text: "logarithmicSearch(arr: number[], target: number): number {\r\n    let left = 0, right = arr.length - 1;\r\n\r\n    while (left <= right) {\r\n      let mid = Math.floor((left + right) / 2);\r\n      if (arr[mid] === target) return mid;\r\n      if (arr[mid] < target) left = mid + 1;\r\n      else right = mid - 1;\r\n    }\r\n\r\n    return -1;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 20,
    spaceScore: 10,
    totalScore: 30,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 23
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'logarithmicSearch' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 23
      }
    ],
  },
  {
    id: "linearSearch:41",
    kind: "method",
    name: "linearSearch",
    startLine: 41,
    endLine: 46,
    text: "linearSearch(arr: number[], target: number): number {\r\n    for (let i = 0; i < arr.length; i++) {\r\n      if (arr[i] === target) return i;\r\n    }\r\n    return -1;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 20,
    spaceScore: 10,
    totalScore: 30,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 41
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'linearSearch' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 41
      }
    ]
  },
  {
    id: "nLogNExample:54",
    kind: "method",
    name: "nLogNExample",
    startLine: 54,
    endLine: 62,
    text: "nLogNExample(arr: number[]): number[] {\r\n    if (arr.length <= 1) return arr;\r\n\r\n    const mid = Math.floor(arr.length / 2);\r\n    const left = this.nLogNExample(arr.slice(0, mid));\r\n    const right = this.nLogNExample(arr.slice(mid));\r\n\r\n    return [...left, ...right].sort((a, b) => a - b);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 25,
    spaceScore: 20,
    totalScore: 45,
    riskLevel: "MEDIUM",
    confidence: 72,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'nLogNExample' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 54
      },
      {
        type: "time",
        pattern: "sort",
        detail: "Comparison-based sorting algorithms (like quicksort, mergesort) have a theoretical lower bound of O(n log n) time complexity",
        impact: "medium",
        confidence: 70,
        lineNumber: 54
      },
      {
        type: "space",
        pattern: "spread-operator",
        detail: "Spread operator creates a shallow copy of the entire array/object, requiring both time and space proportional to size",
        impact: "medium",
        confidence: 65,
        lineNumber: 54
      }
    ]
  },
  {
    id: "quadraticPairs:69",
    kind: "method",
    name: "quadraticPairs",
    startLine: 69,
    endLine: 79,
    text: "quadraticPairs(arr: number[]): number[][] {\r\n    const pairs: number[][] = [];\r\n\r\n    for (let i = 0; i < arr.length; i++) {\r\n      for (let j = 0; j < arr.length; j++) {\r\n        pairs.push([arr[i], arr[j]]);\r\n      }\r\n    }\r\n\r\n    return pairs;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 33,
    spaceScore: 16,
    totalScore: 49,
    riskLevel: "MEDIUM",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 69
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'quadraticPairs' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 69
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows quadratically - this can cause significant memory pressure with large inputs.",
        impact: "critical",
        confidence: 75,
        lineNumber: 69
      }
    ]
  },
  {
    id: "cubicLoop:86",
    kind: "method",
    name: "cubicLoop",
    startLine: 86,
    endLine: 96,
    text: "cubicLoop(n: number): number {\r\n    let count = 0;\r\n    for (let i = 0; i < n; i++) {\r\n      for (let j = 0; j < n; j++) {\r\n        for (let k = 0; k < n; k++) {\r\n          count++;\r\n        }\r\n      }\r\n    }\r\n    return count;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 38,
    spaceScore: 10,
    totalScore: 48,
    riskLevel: "MEDIUM",
    confidence: 83,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 86
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'cubicLoop' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 86
      }
    ]
  },
  {
    id: "exponentialFibonacci:104",
    kind: "method",
    name: "exponentialFibonacci",
    startLine: 104,
    endLine: 107,
    text: "exponentialFibonacci(n: number): number {\r\n    if (n <= 1) return n;\r\n    return this.exponentialFibonacci(n - 1) + this.exponentialFibonacci(n - 2);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'exponentialFibonacci' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 104
      }
    ]
  },
  {
    id: "factorialPermutations:115",
    kind: "method",
    name: "factorialPermutations",
    startLine: 115,
    endLine: 131,
    text: "factorialPermutations(arr: number[]): number[][] {\r\n    if (arr.length === 0) return [[]];\r\n\r\n    const result: number[][] = [];\r\n\r\n    for (let i = 0; i < arr.length; i++) {\r\n      const current = arr[i];\r\n      const remaining = arr.filter((_, idx) => idx !== i);\r\n      const perms = this.factorialPermutations(remaining);\r\n\r\n      for (const perm of perms) {\r\n        result.push([current, ...perm]);\r\n      }\r\n    }\r\n\r\n    return result;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 38,
    spaceScore: 21,
    totalScore: 59,
    riskLevel: "MEDIUM",
    confidence: 81,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 115
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'factorialPermutations' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 115
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows quadratically - this can cause significant memory pressure with large inputs.",
        impact: "critical",
        confidence: 75,
        lineNumber: 115
      },
      {
        type: "space",
        pattern: "spread-operator",
        detail: "Spread operator creates a shallow copy of the entire array/object, requiring both time and space proportional to size This allocation occurs inside a loop, causing memory to grow with each iteration.",
        impact: "high",
        confidence: 85,
        lineNumber: 115
      }
    ]
  },
  {
    id: "linearSpace:138",
    kind: "method",
    name: "linearSpace",
    startLine: 138,
    endLine: 140,
    text: "linearSpace(n: number): number[] {\r\n    return new Array(n).fill(0);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n²)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'linearSpace' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 138
      }
    ]
  },
  {
    id: "quadraticSpace:147",
    kind: "method",
    name: "quadraticSpace",
    startLine: 147,
    endLine: 154,
    text: "quadraticSpace(n: number): number[][] {\r\n    const grid: number[][] = [];\r\n    for (let i = 0; i < n; i++) {\r\n      const row = new Array(n).fill(0);\r\n      grid.push(row);\r\n    }\r\n    return grid;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n²)",
    timeScore: 20,
    spaceScore: 22,
    totalScore: 42,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 147
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'quadraticSpace' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 147
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows linearly with input size.",
        impact: "medium",
        confidence: 75,
        lineNumber: 147
      }
    ]
  },
  {
    id: "getAllComplexities:160",
    kind: "method",
    name: "getAllComplexities",
    startLine: 160,
    endLine: 173,
    text: "getAllComplexities() {\r\n    return {\r\n      constant: \"O(1)\",\r\n      logarithmic: \"O(log n)\",\r\n      linear: \"O(n)\",\r\n      linearithmic: \"O(n log n)\",\r\n      quadratic: \"O(n²)\",\r\n      cubic: \"O(n³)\",\r\n      exponential: \"O(2ⁿ)\",\r\n      factorial: \"O(n!)\",\r\n      space_linear: \"O(n)\",\r\n      space_quadratic: \"O(n²)\"\r\n    };\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'getAllComplexities' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 160
      }
    ]
  },
  {
    id: "constantOperation:13",
    kind: "method",
    name: "constantOperation",
    startLine: 13,
    endLine: 15,
    text: "constantOperation(): number {\r\n    return 1 + 1;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'constantOperation' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 13
      }
    ]
  },
  {
    id: "logarithmicSearch:23",
    kind: "method",
    name: "logarithmicSearch",
    startLine: 23,
    endLine: 34,
    text: "logarithmicSearch(arr: number[], target: number): number {\r\n    let left = 0, right = arr.length - 1;\r\n\r\n    while (left <= right) {\r\n      let mid = Math.floor((left + right) / 2);\r\n      if (arr[mid] === target) return mid;\r\n      if (arr[mid] < target) left = mid + 1;\r\n      else right = mid - 1;\r\n    }\r\n\r\n    return -1;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 20,
    spaceScore: 10,
    totalScore: 30,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 23
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'logarithmicSearch' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 23
      }
    ]
  },
  {
    id: "linearSearch:41",
    kind: "method",
    name: "linearSearch",
    startLine: 41,
    endLine: 46,
    text: "linearSearch(arr: number[], target: number): number {\r\n    for (let i = 0; i < arr.length; i++) {\r\n      if (arr[i] === target) return i;\r\n    }\r\n    return -1;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 20,
    spaceScore: 10,
    totalScore: 30,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 41
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'linearSearch' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 41
      }
    ]
  },
  {
    id: "nLogNExample:54",
    kind: "method",
    name: "nLogNExample",
    startLine: 54,
    endLine: 62,
    text: "nLogNExample(arr: number[]): number[] {\r\n    if (arr.length <= 1) return arr;\r\n\r\n    const mid = Math.floor(arr.length / 2);\r\n    const left = this.nLogNExample(arr.slice(0, mid));\r\n    const right = this.nLogNExample(arr.slice(mid));\r\n\r\n    return [...left, ...right].sort((a, b) => a - b);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 25,
    spaceScore: 20,
    totalScore: 45,
    riskLevel: "MEDIUM",
    confidence: 72,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'nLogNExample' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 54
      },
      {
        type: "time",
        pattern: "sort",
        detail: "Comparison-based sorting algorithms (like quicksort, mergesort) have a theoretical lower bound of O(n log n) time complexity",
        impact: "medium",
        confidence: 70,
        lineNumber: 54
      },
      {
        type: "space",
        pattern: "spread-operator",
        detail: "Spread operator creates a shallow copy of the entire array/object, requiring both time and space proportional to size",
        impact: "medium",
        confidence: 65,
        lineNumber: 54
      }
    ]
  },
  {
    id: "quadraticPairs:69",
    kind: "method",
    name: "quadraticPairs",
    startLine: 69,
    endLine: 79,
    text: "quadraticPairs(arr: number[]): number[][] {\r\n    const pairs: number[][] = [];\r\n\r\n    for (let i = 0; i < arr.length; i++) {\r\n      for (let j = 0; j < arr.length; j++) {\r\n        pairs.push([arr[i], arr[j]]);\r\n      }\r\n    }\r\n\r\n    return pairs;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 33,
    spaceScore: 16,
    totalScore: 49,
    riskLevel: "MEDIUM",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 69
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'quadraticPairs' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 69
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows quadratically - this can cause significant memory pressure with large inputs.",
        impact: "critical",
        confidence: 75,
        lineNumber: 69
      }
    ]
  },
  {
    id: "cubicLoop:86",
    kind: "method",
    name: "cubicLoop",
    startLine: 86,
    endLine: 96,
    text: "cubicLoop(n: number): number {\r\n    let count = 0;\r\n    for (let i = 0; i < n; i++) {\r\n      for (let j = 0; j < n; j++) {\r\n        for (let k = 0; k < n; k++) {\r\n          count++;\r\n        }\r\n      }\r\n    }\r\n    return count;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 38,
    spaceScore: 10,
    totalScore: 48,
    riskLevel: "MEDIUM",
    confidence: 83,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 86
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'cubicLoop' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 86
      }
    ]
  },
  {
    id: "exponentialFibonacci:104",
    kind: "method",
    name: "exponentialFibonacci",
    startLine: 104,
    endLine: 107,
    text: "exponentialFibonacci(n: number): number {\r\n    if (n <= 1) return n;\r\n    return this.exponentialFibonacci(n - 1) + this.exponentialFibonacci(n - 2);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'exponentialFibonacci' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 104
      }
    ]
  },
  {
    id: "factorialPermutations:115",
    kind: "method",
    name: "factorialPermutations",
    startLine: 115,
    endLine: 131,
    text: "factorialPermutations(arr: number[]): number[][] {\r\n    if (arr.length === 0) return [[]];\r\n\r\n    const result: number[][] = [];\r\n\r\n    for (let i = 0; i < arr.length; i++) {\r\n      const current = arr[i];\r\n      const remaining = arr.filter((_, idx) => idx !== i);\r\n      const perms = this.factorialPermutations(remaining);\r\n\r\n      for (const perm of perms) {\r\n        result.push([current, ...perm]);\r\n      }\r\n    }\r\n\r\n    return result;\r\n  }",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n²)",
    timeScore: 38,
    spaceScore: 21,
    totalScore: 59,
    riskLevel: "MEDIUM",
    confidence: 81,
    reasons: [
      {
        type: "time",
        pattern: "nested-loop-2",
        detail: "Nested loop with 2 levels: outer loop runs n times, inner loop runs n times for each outer iteration, resulting in n × n = n² operations. Nesting depth of 2 multiplies the complexity.",
        impact: "high",
        confidence: 85,
        lineNumber: 115
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'factorialPermutations' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 115
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows quadratically - this can cause significant memory pressure with large inputs.",
        impact: "critical",
        confidence: 75,
        lineNumber: 115
      },
      {
        type: "space",
        pattern: "spread-operator",
        detail: "Spread operator creates a shallow copy of the entire array/object, requiring both time and space proportional to size This allocation occurs inside a loop, causing memory to grow with each iteration.",
        impact: "high",
        confidence: 85,
        lineNumber: 115
      }
    ]
  },
  {
    id: "linearSpace:138",
    kind: "method",
    name: "linearSpace",
    startLine: 138,
    endLine: 140,
    text: "linearSpace(n: number): number[] {\r\n    return new Array(n).fill(0);\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n²)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'linearSpace' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 138
      }
    ]
  },
  {
    id: "quadraticSpace:147",
    kind: "method",
    name: "quadraticSpace",
    startLine: 147,
    endLine: 154,
    text: "quadraticSpace(n: number): number[][] {\r\n    const grid: number[][] = [];\r\n    for (let i = 0; i < n; i++) {\r\n      const row = new Array(n).fill(0);\r\n      grid.push(row);\r\n    }\r\n    return grid;\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n²)",
    timeScore: 20,
    spaceScore: 22,
    totalScore: 42,
    riskLevel: "MEDIUM",
    confidence: 75,
    reasons: [
      {
        type: "time",
        pattern: "single-loop",
        detail: "Single loop iterates through n elements once, performing constant work per iteration",
        impact: "medium",
        confidence: 70,
        lineNumber: 147
      },
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'quadraticSpace' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 147
      },
      {
        type: "space",
        pattern: "array-allocation-loop",
        detail: "Allocating or growing arrays inside a loop creates O(n) space complexity as memory grows proportionally with input size This allocation occurs inside a loop, causing memory to grow with each iteration. Allocation type: array/object. Memory grows linearly with input size.",
        impact: "medium",
        confidence: 75,
        lineNumber: 147
      }
    ]
  },
  {
    id: "getAllComplexities:160",
    kind: "method",
    name: "getAllComplexities",
    startLine: 160,
    endLine: 173,
    text: "getAllComplexities() {\r\n    return {\r\n      constant: \"O(1)\",\r\n      logarithmic: \"O(log n)\",\r\n      linear: \"O(n)\",\r\n      linearithmic: \"O(n log n)\",\r\n      quadratic: \"O(n²)\",\r\n      cubic: \"O(n³)\",\r\n      exponential: \"O(2ⁿ)\",\r\n      factorial: \"O(n!)\",\r\n      space_linear: \"O(n)\",\r\n      space_quadratic: \"O(n²)\"\r\n    };\r\n  }",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    timeScore: 15,
    spaceScore: 10,
    totalScore: 25,
    riskLevel: "LOW",
    confidence: 80,
    reasons: [
      {
        type: "time",
        pattern: "recursion-simple",
        detail: "Linear recursion creates a call stack of depth n, with each recursive call consuming stack space The method 'getAllComplexities' is the source of this complexity.",
        impact: "medium",
        confidence: 80,
        lineNumber: 160
      }
    ]
  }
  // 4 more similar entries…
];
