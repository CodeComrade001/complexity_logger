/**
 * ComplexityShowcase
 * A teaching class demonstrating all major time + space complexities.
 * Each method is short, clear, and represents one complexity category.
 */

export class ComplexityShowcase {

  /**
   * O(1) Time — Constant
   * O(1) Space — Constant
   */
  constantOperation(): number {
    return 1 + 1;
  }


  /**
   * O(log n) Time — Logarithmic
   * O(1) Space — Constant
   * Example: Binary Search
   */
  logarithmicSearch(arr: number[], target: number): number {
    let left = 0, right = arr.length - 1;

    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      if (arr[mid] === target) return mid;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }


  /**
   * O(n) Time — Linear
   * O(1) Space — Constant
   */
  linearSearch(arr: number[], target: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i;
    }
    return -1;
  }


  /**
   * O(n log n) Time — Linearithmic
   * O(log n) Space — Recursion stack
   * Example: Merge Sort (showing structure only)
   */
  nLogNExample(arr: number[]): number[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = this.nLogNExample(arr.slice(0, mid));
    const right = this.nLogNExample(arr.slice(mid));

    return [...left, ...right].sort((a, b) => a - b);
  }


  /**
   * O(n²) Time — Quadratic
   * O(1) Space — Constant
   */
  quadraticPairs(arr: number[]): number[][] {
    const pairs: number[][] = [];

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        pairs.push([arr[i], arr[j]]);
      }
    }

    return pairs;
  }


  /**
   * O(n³) Time — Cubic
   * O(1) Space — Constant
   */
  cubicLoop(n: number): number {
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          count++;
        }
      }
    }
    return count;
  }


  /**
   * O(2ⁿ) Time — Exponential
   * O(n) Space — Call stack grows with depth
   * Example: Fibonacci (naive recursion)
   */
  exponentialFibonacci(n: number): number {
    if (n <= 1) return n;
    return this.exponentialFibonacci(n - 1) + this.exponentialFibonacci(n - 2);
  }


  /**
   * O(n!) Time — Factorial
   * O(n) Space — Recursion depth
   * Example: Generate all permutations
   */
  factorialPermutations(arr: number[]): number[][] {
    if (arr.length === 0) return [[]];

    const result: number[][] = [];

    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.filter((_, idx) => idx !== i);
      const perms = this.factorialPermutations(remaining);

      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }

    return result;
  }


  /**
   * O(n) Space — Linear
   * Creates a new array of size n
   */
  linearSpace(n: number): number[] {
    return new Array(n).fill(0);
  }


  /**
   * O(n²) Space — Quadratic
   * Creates a 2D grid
   */
  quadraticSpace(n: number): number[][] {
    const grid: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row = new Array(n).fill(0);
      grid.push(row);
    }
    return grid;
  }


  /**
   * Summary method to show your students all complexities at once
   */
  getAllComplexities() {
    return {
      constant: "O(1)",
      logarithmic: "O(log n)",
      linear: "O(n)",
      linearithmic: "O(n log n)",
      quadratic: "O(n²)",
      cubic: "O(n³)",
      exponential: "O(2ⁿ)",
      factorial: "O(n!)",
      space_linear: "O(n)",
      space_quadratic: "O(n²)"
    };
  }
}
