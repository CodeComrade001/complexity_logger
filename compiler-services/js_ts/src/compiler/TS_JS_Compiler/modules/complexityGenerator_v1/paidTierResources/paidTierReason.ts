import { SignalProfile, ComplexityNotation } from "../../../interfaces/complexityGeneratorInterface.js";

/**
 * Reason rule structure: each rule has a condition and a human-readable explanation
 */
export interface ReasonRule {
  /** Condition function that checks if this reason applies to the signal profile */
  condition: (signals: SignalProfile) => boolean;
  /** Human-readable explanation for why this complexity was detected */
  reason: string;
  /** Optional priority (higher = more specific/relevant). Default: 1 */
  priority?: number;
}

/**
 * Database of reasons organized by complexity notation and type (time/space)
 */
export const COMPLEXITY_REASONS: {
  time: Record<string, ReasonRule[]>;
  space: Record<string, ReasonRule[]>;
} = {
  // ============================================================================
  // TIME COMPLEXITY REASONS
  // ============================================================================
  time: {
    // ------------------------------------------------------------------------
    // O(1) - Constant Time
    // ------------------------------------------------------------------------
    "O(1)": [
      {
        condition: (s) => !s.loops && !s.recursion && s.isConstantBody,
        reason: "No loops or recursion detected; operations execute in constant time",
        priority: 3
      },
      {
        condition: (s) => !s.loops && !s.recursion,
        reason: "Function performs fixed operations regardless of input size",
        priority: 2
      },
      {
        condition: (s) => s.isConstantWithReturn,
        reason: "Direct return without iteration indicates constant-time execution",
        priority: 3
      },
      {
        condition: (s) => s.variables <= 3 && !s.loops,
        reason: "Minimal variable usage with no iteration maintains O(1) complexity",
        priority: 2
      },
      {
        condition: (s) => s.hasEarlyReturn && !s.loops,
        reason: "Early return prevents iteration, keeping execution constant",
        priority: 2
      },
      {
        condition: (s) => s.conditionals > 0 && !s.loops && !s.recursion,
        reason: "Conditional branches without loops execute in constant time",
        priority: 2
      },
      {
        condition: (s) => !s.usesDataStructures && !s.loops,
        reason: "No data structure operations or loops limits runtime to O(1)",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Algorithm completes in fixed steps independent of input",
        priority: 1
      },
      {
        condition: (s) => !s.allocations && !s.loops,
        reason: "Zero dynamic allocation and no iteration guarantee constant execution",
        priority: 2
      },
      {
        condition: (s) => s.hasBreakOrContinue && s.loops === 1,
        reason: "Single loop with guaranteed early exit maintains constant time",
        priority: 2
      },
      {
        condition: (s) => s.dataSizeHint === "SMALL" && !s.recursion,
        reason: "Small, fixed data size ensures operations complete in constant time",
        priority: 1
      },
      {
        condition: (s) => !s.functionalLoopCount && !s.loops,
        reason: "Absence of functional and imperative loops indicates O(1) behavior",
        priority: 2
      },
      {
        condition: (s) => !s.hasJSONOperations && !s.loops,
        reason: "No serialization or iteration keeps complexity constant",
        priority: 1
      },
      {
        condition: (s) => !s.hasSpreadOperator && !s.loops,
        reason: "No spread operations or loops maintain fixed execution time",
        priority: 1
      },
      {
        condition: (s) => s.isConstantBody && s.variables === 0,
        reason: "Stateless constant body executes instantly regardless of input",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Direct memory access or indexing without traversal is O(1)",
        priority: 1
      },
      {
        condition: (s) => !s.hasSorting && !s.loops,
        reason: "No sorting or iteration detected; runtime remains constant",
        priority: 2
      },
      {
        condition: (s) => !s.hasNestedArrayMethods && !s.loops,
        reason: "Flat operations without nested methods maintain O(1) performance",
        priority: 1
      },
      {
        condition: (s) => s.conditionals <= 2 && !s.loops && !s.recursion,
        reason: "Simple conditional logic without loops executes in constant time",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Mathematical or bitwise operations complete in constant time",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(log n) - Logarithmic Time
    // ------------------------------------------------------------------------
    "O(log n)": [
      {
        condition: (s) => s.recursion && !s.loops,
        reason: "Recursive halving reduces problem size logarithmically each step",
        priority: 3
      },
      {
        condition: (s) => s.loops === 1 && s.hasBreakOrContinue,
        reason: "Loop divides input space repeatedly, producing logarithmic growth",
        priority: 3
      },
      {
        condition: (s) => s.recursion && s.hasEarlyReturn,
        reason: "Recursive division with early termination yields O(log n) behavior",
        priority: 2
      },
      {
        condition: (s) => s.loops === 1 && !s.nestedLoops,
        reason: "Single loop with halving logic (e.g., binary search) is logarithmic",
        priority: 3
      },
      {
        condition: (s) => s.recursion && s.variables <= 3,
        reason: "Tail recursion with minimal state indicates logarithmic time",
        priority: 2
      },
      {
        condition: (s) => s.conditionals > 1 && s.loops === 1,
        reason: "Conditional branching in loop reduces search space logarithmically",
        priority: 2
      },
      {
        condition: (s) => s.dataSizeHint === "LARGE" && s.loops === 1,
        reason: "Large input handled via divide-and-conquer suggests O(log n)",
        priority: 2
      },
      {
        condition: (s) => !s.nestedLoops && s.loops === 1,
        reason: "Non-nested loop with exponential reduction is logarithmic",
        priority: 2
      },
      {
        condition: (s) => s.recursion && !s.loopWithAllocation,
        reason: "Recursion without allocation per call indicates logarithmic depth",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Input divided by constant factor each iteration yields O(log n)",
        priority: 1
      },
      {
        condition: (s) => s.hasEarlyReturn && s.loops === 1,
        reason: "Early exit from halving loop maintains logarithmic complexity",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.conditionals >= 2,
        reason: "Recursive branching with pruning reduces calls logarithmically",
        priority: 2
      },
      {
        condition: (s) => !s.usesDataStructures && s.recursion,
        reason: "Pure recursive division without data structures is O(log n)",
        priority: 2
      },
      {
        condition: (s) => s.loops === 1 && s.variables <= 2,
        reason: "Minimal state in single loop suggests logarithmic reduction",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Tree traversal with height h = log n produces logarithmic time",
        priority: 1
      },
      {
        condition: (s) => s.recursion && s.hasBreakOrContinue,
        reason: "Recursive pruning with early termination yields O(log n)",
        priority: 2
      },
      {
        condition: (s) => !s.hasLinearSearchInLoop && s.loops === 1,
        reason: "Loop without linear search uses binary reduction for log time",
        priority: 2
      },
      {
        condition: (s) => s.conditionals > 0 && s.recursion,
        reason: "Conditional recursion with halving logic is logarithmic",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Balanced tree operations (search/insert) run in O(log n)",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Repeated division by 2 or similar factor produces log complexity",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n) - Linear Time
    // ------------------------------------------------------------------------
    "O(n)": [
      {
        condition: (s) => s.loops === 1 && !s.nestedLoops,
        reason: "Single loop traverses input once, producing linear time complexity",
        priority: 3
      },
      {
        condition: (s) => s.functionalLoopCount === 1 && !s.loops,
        reason: "Single functional loop (.map, .filter, etc.) processes each element once",
        priority: 3
      },
      {
        condition: (s) => s.functionalLoopCount > 1 && !s.nestedLoops,
        reason: "Multiple sequential functional loops sum to O(n) total iterations",
        priority: 2
      },
      {
        condition: (s) => s.hasFilterOrSlice && !s.nestedLoops,
        reason: "Array filtering or slicing requires single pass over input",
        priority: 2
      },
      {
        condition: (s) => s.recursion && !s.recursionDoubled && !s.loops,
        reason: "Linear recursion processes each element once without branching",
        priority: 3
      },
      {
        condition: (s) => s.usesDataStructures && !s.nestedLoops,
        reason: "Data structure operations with single traversal scale linearly",
        priority: 2
      },
      {
        condition: (s) => s.allocations > 0 && s.loops === 1,
        reason: "Memory allocation inside single loop scales with input size",
        priority: 2
      },
      {
        condition: (s) => s.hasJSONOperations && !s.loops,
        reason: "JSON serialization/parsing processes every element linearly",
        priority: 2
      },
      {
        condition: (s) => s.hasSpreadOperator && !s.nestedLoops,
        reason: "Spread operator copies all elements, resulting in O(n) time",
        priority: 2
      },
      {
        condition: (s) => s.loops === 1 && s.hasBreakOrContinue,
        reason: "Loop with break/continue still averages linear traversal",
        priority: 2
      },
      {
        condition: (s) => s.dataSizeHint === "LARGE" && s.loops === 1,
        reason: "Large input processed once indicates linear scaling",
        priority: 2
      },
      {
        condition: (s) => !s.nestedLoops && s.loops === 1,
        reason: "Flat loop structure without nesting ensures O(n) behavior",
        priority: 2
      },
      {
        condition: (s) => s.functionalLoopCount >= 1 && s.loops === 0,
        reason: "Functional iteration without imperative loops maintains linearity",
        priority: 2
      },
      {
        condition: (s) => s.conditionals > 0 && s.loops === 1,
        reason: "Conditional logic in single loop doesn't change O(n) complexity",
        priority: 1
      },
      {
        condition: (s) => s.variables > 3 && s.loops === 1,
        reason: "Variable tracking in single loop scales linearly with input",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Algorithm visits each element exactly once in sequence",
        priority: 1
      },
      {
        condition: (s) => s.hasEarlyReturn && s.loops === 1,
        reason: "Early return in single loop averages to linear time in worst case",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.hasLoopInRecursion,
        reason: "Recursion with internal loop sums to O(n) across all calls",
        priority: 2
      },
      {
        condition: (s) => !s.hasSorting && s.loops === 1,
        reason: "Single pass without sorting maintains linear complexity",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Linear scan or traversal dominates runtime at O(n)",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n log n) - Linearithmic Time
    // ------------------------------------------------------------------------
    "O(n log n)": [
      {
        condition: (s) => s.hasSorting,
        reason: "Sorting algorithm (merge/quick/heap sort) drives O(n log n) complexity",
        priority: 4
      },
      {
        condition: (s) => s.hasSorting && s.loops === 1,
        reason: "Sort followed by linear traversal maintains n log n time",
        priority: 3
      },
      {
        condition: (s) => s.recursion && s.loops === 1,
        reason: "Recursive divide-and-conquer with linear merge is O(n log n)",
        priority: 3
      },
      {
        condition: (s) => s.hasSorting && s.functionalLoopCount > 0,
        reason: "Sorting combined with functional loops yields linearithmic growth",
        priority: 3
      },
      {
        condition: (s) => s.recursion && s.allocations > 0,
        reason: "Recursive splitting with linear-time merge allocates O(n log n)",
        priority: 2
      },
      {
        condition: (s) => s.hasSorting && s.usesDataStructures,
        reason: "Sorting data structure elements produces n log n operations",
        priority: 3
      },
      {
        condition: (s) => s.loops === 1 && s.recursion && !s.nestedLoops,
        reason: "Loop inside recursive division yields O(n log n) total work",
        priority: 3
      },
      {
        condition: (s) => s.hasSorting && s.dataSizeHint === "LARGE",
        reason: "Large dataset sorting scales at n log n regardless of constants",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.variables > 3,
        reason: "Divide-and-conquer with state management suggests n log n complexity",
        priority: 2
      },
      {
        condition: (s) => s.hasSorting && s.hasSpreadOperator,
        reason: "Sorting with spread operations combines to O(n log n)",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Balanced divide-and-conquer with linear merge is linearithmic",
        priority: 1
      },
      {
        condition: (s) => s.hasSorting && s.conditionals > 0,
        reason: "Conditional sorting logic doesn't reduce n log n lower bound",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.usesDataStructures,
        reason: "Recursive tree operations with linear node processing is O(n log n)",
        priority: 2
      },
      {
        condition: (s) => s.hasSorting && s.hasFilterOrSlice,
        reason: "Filter/slice followed by sort maintains linearithmic complexity",
        priority: 2
      },
      {
        condition: (s) => s.loops === 1 && s.recursion && s.allocations > 0,
        reason: "Linear work per recursive level with log levels is O(n log n)",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Merge sort, heap sort, or efficient sorting dominates at n log n",
        priority: 1
      },
      {
        condition: (s) => s.hasSorting && s.hasJSONOperations,
        reason: "Sorting JSON data requires O(n log n) comparisons",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.functionalLoopCount > 0,
        reason: "Functional loops in divide-and-conquer sum to n log n",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Optimal comparison-based sorting cannot be faster than n log n",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Log-depth recursion with O(n) work per level yields linearithmic time",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n²) - Quadratic Time
    // ------------------------------------------------------------------------
    "O(n²)": [
      {
        condition: (s) => s.nestedLoops === 2,
        reason: "Two nested loops iterate over input, producing quadratic complexity",
        priority: 4
      },
      {
        condition: (s) => s.hasLinearSearchInLoop,
        reason: "Linear search (.includes, .indexOf) inside loop amplifies to O(n²)",
        priority: 4
      },
      {
        condition: (s) => s.nestedLoops >= 2 && s.dataSizeHint === "LARGE",
        reason: "Large input with nested loops scales quadratically",
        priority: 3
      },
      {
        condition: (s) => s.hasNestedArrayMethods,
        reason: "Nested array methods (.map inside .map) produce quadratic operations",
        priority: 3
      },
      {
        condition: (s) => s.functionalLoopCount >= 2 && s.hasLinearSearchInLoop,
        reason: "Functional loops with embedded linear search create n² iterations",
        priority: 3
      },
      {
        condition: (s) => s.loops === 2 && s.usesDataStructures,
        reason: "Nested loops over data structures scale quadratically with input",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops === 2 && s.allocations > 0,
        reason: "Memory allocation in nested loops compounds to O(n²) total",
        priority: 2
      },
      {
        condition: (s) => s.loops === 2 && s.hasSpreadOperator,
        reason: "Spread operator in nested loop copies n² elements total",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops === 2 && s.conditionals > 0,
        reason: "Conditional logic in nested loops doesn't reduce quadratic bound",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.loops === 1 && s.recursionDoubled,
        reason: "Branching recursion with loop inside produces quadratic calls",
        priority: 3
      },
      {
        condition: (s) => s.hasLinearSearchInLoop && s.loops >= 1,
        reason: "Array search inside iteration visits n×n elements in worst case",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops === 2 && s.hasBreakOrContinue,
        reason: "Early exit in nested loops averages to quadratic in worst case",
        priority: 2
      },
      {
        condition: (s) => s.functionalLoopCount === 2 && !s.loops,
        reason: "Chained functional loops (e.g., .flatMap inside .map) scale quadratically",
        priority: 2
      },
      {
        condition: (s) => s.nestedLoops === 2 && s.variables > 5,
        reason: "Complex state tracking in nested loops indicates O(n²) operations",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Double iteration over input produces n² total operations",
        priority: 1
      },
      {
        condition: (s) => s.hasFilterOrSlice && s.loops === 1,
        reason: "Filter/slice inside loop copies n elements n times = O(n²)",
        priority: 2
      },
      {
        condition: (s) => s.nestedLoops === 2 && s.hasJSONOperations,
        reason: "JSON serialization in nested loop processes n² data points",
        priority: 2
      },
      {
        condition: (s) => s.loops === 2 && s.usesNestedDataStructures,
        reason: "Nested data structures with double iteration scale quadratically",
        priority: 3
      },
      {
        condition: () => true,
        reason: "Pairwise comparison or nested traversal creates quadratic growth",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Bubble sort, insertion sort, or similar algorithms exhibit O(n²)",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n³) - Cubic Time
    // ------------------------------------------------------------------------
    "O(n³)": [
      {
        condition: (s) => s.nestedLoops >= 3,
        reason: "Three nested loops iterate over input, creating cubic complexity",
        priority: 4
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.dataSizeHint === "LARGE",
        reason: "Large input with triple nesting scales cubically",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops >= 3 && s.usesDataStructures,
        reason: "Triple-nested loops over data structures produce O(n³) operations",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.allocations > 0,
        reason: "Allocation in triply-nested loop creates cubic memory/time cost",
        priority: 3
      },
      {
        condition: (s) => s.hasLinearSearchInLoop && s.nestedLoops === 2,
        reason: "Linear search inside double-nested loop amplifies to cubic time",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.conditionals > 0,
        reason: "Conditional branching in cubic loops doesn't reduce complexity",
        priority: 2
      },
      {
        condition: (s) => s.functionalLoopCount >= 3,
        reason: "Three levels of functional loops (nested maps) yield O(n³)",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops >= 3 && s.hasSpreadOperator,
        reason: "Spread operator in cubic loop copies n³ elements total",
        priority: 2
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.variables > 5,
        reason: "Complex state in triply-nested structure indicates cubic operations",
        priority: 2
      },
      {
        condition: (s) => s.loops === 3 && s.usesNestedDataStructures,
        reason: "Three-dimensional data structure traversal scales cubically",
        priority: 3
      },
      {
        condition: () => true,
        reason: "Triple iteration over input produces n³ total operations",
        priority: 1
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.hasBreakOrContinue,
        reason: "Early exit in cubic loops averages to O(n³) in worst case",
        priority: 2
      },
      {
        condition: (s) => s.nestedLoops >= 3 && s.hasJSONOperations,
        reason: "JSON processing in triply-nested loop handles n³ data points",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.nestedLoops === 2,
        reason: "Recursion with double-nested loop can produce cubic total calls",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Matrix multiplication or similar algorithm exhibits O(n³)",
        priority: 1
      },
      {
        condition: (s) => s.nestedLoops === 3 && s.hasFilterOrSlice,
        reason: "Filter/slice in cubic loop creates n³ copy operations",
        priority: 2
      },
      {
        condition: (s) => s.functionalLoopCount === 3 && s.hasNestedArrayMethods,
        reason: "Deeply nested array methods compound to cubic complexity",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Three-way nested comparison or traversal grows cubically",
        priority: 1
      },
      {
        condition: (s) => s.loops === 3 && s.dataSizeHint === "MEDIUM",
        reason: "Medium-sized triple-nested iteration already shows cubic scaling",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Naive matrix operations or triple-loop algorithms are O(n³)",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(2^n) - Exponential Time
    // ------------------------------------------------------------------------
    "O(2^n)": [
      {
        condition: (s) => s.recursionDoubled,
        reason: "Branching recursion doubles calls at each level, producing exponential growth",
        priority: 4
      },
      {
        condition: (s) => s.recursionDoubled && s.loops >= 1,
        reason: "Exponential recursion with loop inside amplifies to 2^n operations",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && !s.hasBreakOrContinue,
        reason: "Unbounded recursive branching without pruning explodes exponentially",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.allocations > 0,
        reason: "Memory allocation in branching recursion creates exponential cost",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.usesDataStructures,
        reason: "Data structure operations in exponential recursion scale at 2^n",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.conditionals > 1,
        reason: "Conditional branching in recursive calls produces exponential paths",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.nestedLoops >= 2,
        reason: "Nested loops inside recursion can create exponential total calls",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.dataSizeHint === "MEDIUM",
        reason: "Even medium input becomes intractable with exponential growth",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.variables > 3,
        reason: "State tracking in exponential recursion compounds complexity",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Recursive tree with branching factor 2 produces 2^n nodes",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasFilterOrSlice,
        reason: "Array operations in exponential recursion create massive overhead",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.functionalLoopCount > 0,
        reason: "Functional loops in branching recursion amplify to exponential",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Subset generation or powerset enumeration grows at O(2^n)",
        priority: 1
      },
      {
        condition: (s) => s.recursion && s.conditionDoubled,
        reason: "Doubled conditional paths in recursion create exponential branching",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.hasJSONOperations,
        reason: "JSON processing in exponential recursion handles 2^n objects",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Naive Fibonacci or similar recursive approach exhibits O(2^n)",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasSpreadOperator,
        reason: "Spread operator in exponential recursion copies 2^n elements",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Binary decision tree traversal visits 2^n paths without memoization",
        priority: 1
      },
      {
        condition: (s) => s.recursion && s.hasLoopInRecursion && s.recursionDoubled,
        reason: "Loop inside exponential recursion creates catastrophic scaling",
        priority: 3
      },
      {
        condition: () => true,
        reason: "Brute-force combinatorial search explores 2^n possibilities",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n!) - Factorial Time
    // ------------------------------------------------------------------------
    "O(n!)": [
      {
        condition: (s) => s.recursionDoubled && s.nestedLoops >= 2,
        reason: "Nested loops inside exponential recursion produce factorial growth",
        priority: 4
      },
      {
        condition: (s) => s.recursionDoubled && s.loops >= 2,
        reason: "Multiple loops in branching recursion generate n! permutations",
        priority: 4
      },
      {
        condition: (s) => s.recursionDoubled && s.usesNestedDataStructures,
        reason: "Nested structures in factorial recursion create catastrophic scaling",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.functionalLoopCount >= 2,
        reason: "Functional loops in factorial recursion multiply to n! operations",
        priority: 3
      },
      {
        condition: (s) => s.nestedLoops >= 3 && s.recursion,
        reason: "Triple nesting with recursion can produce factorial total calls",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.allocations > 2,
        reason: "Heavy allocation in factorial recursion creates n! memory cost",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Permutation generation explores all n! orderings of input",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasLinearSearchInLoop,
        reason: "Linear search in factorial recursion visits n! elements total",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.dataSizeHint === "LARGE",
        reason: "Large input with factorial growth becomes computationally infeasible",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Traveling salesman or similar exhaustive search is O(n!)",
        priority: 1
      },
      {
        condition: (s) => s.loops >= 2 && s.recursion && s.conditionDoubled,
        reason: "Conditional branching with nested loops in recursion yields factorial",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.hasSpreadOperator && s.loops >= 1,
        reason: "Spread operations in factorial recursion copy n! elements",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Brute-force permutation enumeration exhibits factorial complexity",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasNestedArrayMethods,
        reason: "Nested array methods in factorial recursion compound exponentially",
        priority: 2
      },
      {
        condition: (s) => s.nestedLoops >= 2 && s.recursionDoubled && s.variables > 5,
        reason: "Complex state in factorial algorithm indicates n! operations",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Full permutation tree has n! leaves at maximum depth",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasJSONOperations && s.loops >= 1,
        reason: "JSON processing in factorial recursion handles n! objects",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Naive backtracking with all permutations grows factorially",
        priority: 1
      },
      {
        condition: (s) => s.recursion && s.loops >= 3,
        reason: "Triple loops in recursion can create factorial total iterations",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Exhaustive search over all orderings scales at O(n!)",
        priority: 1
      }
    ]
  },

  // ============================================================================
  // SPACE COMPLEXITY REASONS
  // ============================================================================
  space: {
    // ------------------------------------------------------------------------
    // O(1) - Constant Space
    // ------------------------------------------------------------------------
    "O(1)": [
      {
        condition: (s) => !s.allocations && !s.usesDataStructures,
        reason: "No dynamic allocation or data structures; memory usage is constant",
        priority: 3
      },
      {
        condition: (s) => s.variables <= 3 && !s.allocations,
        reason: "Minimal variables with no allocation maintains O(1) space",
        priority: 3
      },
      {
        condition: (s) => !s.usesDataStructures && !s.recursion,
        reason: "No recursion or data structures limits memory to constant",
        priority: 2
      },
      {
        condition: (s) => s.isConstantBody && !s.allocations,
        reason: "Constant operations without allocation use fixed memory",
        priority: 2
      },
      {
        condition: (s) => !s.loopWithAllocation && !s.recursionWithAllocation,
        reason: "No allocation in loops or recursion keeps space constant",
        priority: 3
      },
      {
        condition: (s) => !s.hasSpreadOperator && !s.allocations,
        reason: "No spread or allocation prevents memory scaling with input",
        priority: 2
      },
      {
        condition: (s) => !s.hasJSONOperations && !s.usesDataStructures,
        reason: "No JSON or data structures means no dynamic memory growth",
        priority: 2
      },
      {
        condition: () => true,
        reason: "In-place operations without extra storage maintain O(1) space",
        priority: 1
      },
      {
        condition: (s) => s.variables === 0 && !s.allocations,
        reason: "Stateless execution with no allocation uses zero extra memory",
        priority: 2
      },
      {
        condition: (s) => !s.hasFilterOrSlice && !s.allocations,
        reason: "No array copying or allocation keeps memory constant",
        priority: 2
      },
      {
        condition: (s) => !s.recursion && s.variables <= 2,
        reason: "Non-recursive with minimal state requires constant space",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Fixed-size variables independent of input maintain O(1) space",
        priority: 1
      },
      {
        condition: (s) => !s.usesNestedDataStructures && !s.allocations,
        reason: "Flat operations without nested structures use constant memory",
        priority: 1
      },
      {
        condition: (s) => s.dataSizeHint === "SMALL" && !s.allocations,
        reason: "Small, fixed data with no allocation ensures constant space",
        priority: 1
      },
      {
        condition: (s) => !s.functionalLoopCount && !s.allocations,
        reason: "No functional loops or allocation prevents memory scaling",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Pointer manipulation without copying maintains O(1) space",
        priority: 1
      },
      {
        condition: (s) => !s.hasNestedArrayMethods && !s.allocations,
        reason: "Flat array operations without copying use constant memory",
        priority: 1
      },
      {
        condition: (s) => s.isConstantWithReturn && !s.allocations,
        reason: "Direct return without allocation requires no extra space",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Algorithm modifies input in-place, using O(1) auxiliary space",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Iterative approach with fixed variables uses constant memory",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n) - Linear Space
    // ------------------------------------------------------------------------
    "O(n)": [
      {
        condition: (s) => s.allocations > 0 && !s.usesNestedDataStructures,
        reason: "Memory allocation scales linearly with input size",
        priority: 3
      },
      {
        condition: (s) => s.usesDataStructures && !s.usesNestedDataStructures,
        reason: "Single-level data structure stores n elements",
        priority: 3
      },
      {
        condition: (s) => s.loopWithAllocation,
        reason: "Allocation inside loop creates n total memory units",
        priority: 3
      },
      {
        condition: (s) => s.recursion && !s.recursionDoubled,
        reason: "Linear recursion depth of n creates O(n) call stack",
        priority: 3
      },
      {
        condition: (s) => s.hasSpreadOperator,
        reason: "Spread operator copies entire array, allocating O(n) memory",
        priority: 3
      },
      {
        condition: (s) => s.hasFilterOrSlice,
        reason: "Filter/slice creates new array with up to n elements",
        priority: 3
      },
      {
        condition: (s) => s.hasJSONOperations,
        reason: "JSON serialization allocates string/object of size n",
        priority: 2
      },
      {
        condition: (s) => s.functionalLoopCount > 0,
        reason: "Functional loops (.map, .filter) create new arrays of size n",
        priority: 3
      },
      {
        condition: (s) => s.variables > 3 && s.loops === 1,
        reason: "Multiple variables tracking state across n iterations use O(n) space",
        priority: 2
      },
      {
        condition: (s) => s.usesDataStructures && s.dataSizeHint === "LARGE",
        reason: "Large input stored in data structure allocates linear memory",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Auxiliary array or structure proportional to input size is O(n)",
        priority: 1
      },
      {
        condition: (s) => s.recursionWithAllocation,
        reason: "Allocation at each recursive call creates n total memory",
        priority: 3
      },
      {
        condition: (s) => s.hasNestedArrayMethods && s.functionalLoopCount === 1,
        reason: "Single-level nested array method allocates O(n) total",
        priority: 2
      },
      {
        condition: (s) => s.allocations > 0 && s.conditionals > 0,
        reason: "Conditional allocation still scales linearly in worst case",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Hash table or set storing n unique elements uses O(n) space",
        priority: 1
      },
      {
        condition: (s) => s.hasSpreadOperator && s.loops === 1,
        reason: "Spread in loop creates cumulative O(n) memory",
        priority: 2
      },
      {
        condition: (s) => s.usesDataStructures && s.variables > 5,
        reason: "Data structure with complex state tracking uses linear space",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Result array built incrementally grows to size n",
        priority: 1
      },
      {
        condition: (s) => s.allocations > 0 && s.hasEarlyReturn,
        reason: "Early return doesn't prevent worst-case O(n) allocation",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Queue or stack holding up to n elements uses linear space",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(n²) - Quadratic Space
    // ------------------------------------------------------------------------
    "O(n²)": [
      {
        condition: (s) => s.usesNestedDataStructures,
        reason: "Nested data structures (e.g., 2D arrays) allocate n² memory",
        priority: 4
      },
      {
        condition: (s) => s.nestedLoops >= 2 && s.loopWithAllocation,
        reason: "Allocation in nested loops creates quadratic total memory",
        priority: 4
      },
      {
        condition: (s) => s.usesNestedDataStructures && s.dataSizeHint === "LARGE",
        reason: "Large nested structure stores n² elements",
        priority: 3
      },
      {
        condition: (s) => s.hasSpreadOperator && s.nestedLoops >= 2,
        reason: "Spread operator in nested loop copies n² elements total",
        priority: 3
      },
      {
        condition: (s) => s.hasNestedArrayMethods && s.functionalLoopCount >= 2,
        reason: "Nested functional loops allocate n² intermediate arrays",
        priority: 3
      },
      {
        condition: (s) => s.allocations > 2 && s.nestedLoops >= 2,
        reason: "Multiple allocations in quadratic loops produce n² memory",
        priority: 3
      },
      {
        condition: (s) => s.usesNestedDataStructures && s.variables > 5,
        reason: "Complex state in 2D structure indicates quadratic space",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Matrix or grid storing n×n elements uses O(n²) space",
        priority: 1
      },
      {
        condition: (s) => s.recursion && s.loopWithAllocation && s.nestedLoops >= 1,
        reason: "Recursion with nested allocation creates quadratic memory",
        priority: 2
      },
      {
        condition: (s) => s.hasFilterOrSlice && s.nestedLoops >= 2,
        reason: "Filter/slice in nested loop creates n² copied elements",
        priority: 2
      },
      {
        condition: (s) => s.usesNestedDataStructures && s.hasJSONOperations,
        reason: "JSON serialization of nested structure allocates n² memory",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Adjacency matrix for graph stores n² edges",
        priority: 1
      },
      {
        condition: (s) => s.nestedLoops >= 2 && s.hasSpreadOperator && s.allocations > 0,
        reason: "Spread and allocation in quadratic loop creates massive overhead",
        priority: 3
      },
      {
        condition: (s) => s.functionalLoopCount >= 2 && s.hasNestedArrayMethods,
        reason: "Chained nested array methods allocate quadratic memory",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Two-dimensional result array grows to n² total elements",
        priority: 1
      },
      {
        condition: (s) => s.usesNestedDataStructures && s.conditionals > 0,
        reason: "Conditional logic doesn't reduce quadratic space requirement",
        priority: 1
      },
      {
        condition: (s) => s.allocations > 0 && s.hasLinearSearchInLoop && s.loops >= 1,
        reason: "Allocation with nested search creates quadratic memory usage",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Dynamic programming table storing n² subproblem results",
        priority: 1
      },
      {
        condition: (s) => s.usesNestedDataStructures && s.hasSpreadOperator,
        reason: "Spread operator on nested structure copies n² elements",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Pairwise relationship storage requires O(n²) space",
        priority: 1
      }
    ],

    // ------------------------------------------------------------------------
    // O(2^n) - Exponential Space
    // ------------------------------------------------------------------------
    "O(2^n)": [
      {
        condition: (s) => s.recursionDoubled && s.recursionWithAllocation,
        reason: "Branching recursion with allocation creates exponential memory",
        priority: 4
      },
      {
        condition: (s) => s.recursionDoubled && s.usesDataStructures,
        reason: "Data structure allocation in exponential recursion uses 2^n space",
        priority: 4
      },
      {
        condition: (s) => s.recursionDoubled && s.allocations > 0,
        reason: "Memory allocated at each of 2^n recursive calls",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.hasSpreadOperator,
        reason: "Spread operator in exponential recursion copies 2^n elements",
        priority: 3
      },
      {
        condition: (s) => s.recursionDoubled && s.variables > 3,
        reason: "State tracking in 2^n recursive calls uses exponential space",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Binary tree with all nodes stored requires 2^n memory",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasFilterOrSlice,
        reason: "Array operations in branching recursion create 2^n copies",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.hasJSONOperations,
        reason: "JSON allocation in exponential recursion uses 2^n space",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Powerset generation stores all 2^n subsets",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.functionalLoopCount > 0,
        reason: "Functional loops in exponential recursion allocate 2^n arrays",
        priority: 2
      },
      {
        condition: (s) => s.recursionDoubled && s.usesNestedDataStructures,
        reason: "Nested structures in branching recursion create exponential memory",
        priority: 3
      },
      {
        condition: () => true,
        reason: "Full decision tree storage requires exponential space",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.dataSizeHint === "MEDIUM",
        reason: "Even medium input creates massive memory with exponential growth",
        priority: 2
      },
      {
        condition: (s) => s.recursion && s.loopWithAllocation && s.recursionDoubled,
        reason: "Loop allocation in exponential recursion compounds to 2^n",
        priority: 3
      },
      {
        condition: () => true,
        reason: "Memoization table for exponential recursion stores 2^n results",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.hasNestedArrayMethods,
        reason: "Nested array methods in branching recursion create exponential copies",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Subset enumeration with storage uses O(2^n) space",
        priority: 1
      },
      {
        condition: (s) => s.recursionDoubled && s.allocations > 2,
        reason: "Multiple allocations per call in 2^n calls create massive overhead",
        priority: 2
      },
      {
        condition: () => true,
        reason: "Recursive tree exploration stores all 2^n paths",
        priority: 1
      },
      {
        condition: () => true,
        reason: "Combinatorial explosion with full storage requires exponential space",
        priority: 1
      }
    ]
  }
};