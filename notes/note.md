Below is the **master keyword list** that determines **time and space complexity** inside any function/method.

These are the exact structural tokens static analyzers detect.

No explanations — just the keywords/signals you asked for.

---

# ✅ **TIME COMPLEXITY KEYWORDS (JavaScript / TypeScript)**

### **Loops (O(n))**

* `for`
* `while`
* `do`
* `for...of`
* `for...in`
* `forEach`
* `map`
* `filter`
* `reduce`
* `some`
* `every`
* `flatMap`
* `sort` *(O(n log n))*
* `find`
* `findIndex`
* `includes`
* `indexOf`
* `slice`
* `splice` *(loop behavior when array is large)*

---

### **Nested Loop Signals (O(n²), O(n³))**

* loop inside loop
* callback inside loop
* map/filter/reduce inside loop
* `sort` inside loop
* function call inside loop that also loops

---

### **Recursion Signals**

* function calling itself (exact name match)
* `return fn(...)`
* `return this.fn(...)`

---

### **Divide & Conquer Signals (O(log n), O(n log n))**

* `mid = (l + r) / 2`
* `Math.floor`
* `Math.ceil`
* `slice` used recursively
* array split operations (`slice`, `splice`) inside recursion

---

### **Iteration Through Data Structures**

* `.length`
* `.size` (Map/Set)
* `.keys()`
* `.values()`
* `.entries()`

---

### **Expensive Built-ins**

* `JSON.stringify`
* `JSON.parse`
* `RegExp` execution
* `.match`
* `.replace` with regex

---

# ✅ **SPACE COMPLEXITY KEYWORDS**

### **Memory Allocation (O(n))**

* `new Array(...)`
* `[ ...arr ]`
* `new Set()`
* `new Map()`
* `{ ...obj }`
* `arr.push`
* `arr.unshift`
* `arr.concat`
* `array.slice()`
* `array.filter()`
* `array.map()`

---

### **Temporary Structures in Loops**

* any `[]` inside a loop
* any `{}` inside a loop
* maps/sets created inside loops

---

### **Recursion (Stack Space)**

* recursive calls
* building arrays in recursion
* returning arrays/objects from recursion

---

### **Duplicating Data**

* `slice()`
* `splice()`
* `concat()`
* `JSON.parse(JSON.stringify())`
* spread operator:

  * `[...arr]`
  * `{...obj}`

---

# ⚡ **ADDITIONAL COMPLEXITY SIGNALS COMMON IN ANALYSIS**

### **Branches**

* `if`
* `else`
* `switch`
* `case`

### **Input-Dependent Behavior**

* `.length` used to determine loop conditions
* `.size` used in loops
* using function parameters in loop boundaries

---

# 🚀 **FINAL CHECKLIST (What your analyzer should detect)**

Here is the **complete distilled list**:

### 🔷 **Loop Keywords**

```
for
while
do
forEach
map
filter
reduce
every
some
flatMap
for...of
for...in
```

### 🔷 **Recursion Keywords**

```
self function name call
return fn(...)
return this.fn(...)
```

### 🔷 **Data Iteration Keywords**

```
length
size
keys()
values()
entries()
```

### 🔷 **High-Cost Built-ins**

```
sort
JSON.stringify
JSON.parse
match
replace (with regex)
```

### 🔷 **Memory Allocation Keywords**

```
[]
{}
new Array
new Set
new Map
push
concat
slice
splice
spread operator (...)
```

---

Here is the **clean list** — no fluff, no explanations — **EVERY factor that contributes to time/space complexity** (from research, textbooks, and performance engineering).
This is the full checklist you should *note down*.

---

# ✅ **THE COMPLETE LIST OF COMPLEXITY FACTORS**

*(Everything that influences time or space complexity in real code)*

## **A. DIRECT CODE PATTERNS**

These are visible in the AST.

### **Control Flow**

1. `for`
2. `while`
3. `do...while`
4. `for...of`
5. `for...in`
6. `foreach()` (higher-order, hidden loop)
7. Nested loops
8. `if / else if` chains
9. `switch`
10. Ternary `? :`

### **Function/Call Structure**

11. Function calls
12. Recursion
13. Mutual recursion
14. Async/await sequences
15. Call inside loop

### **Data Structure Operations**

16. Array operations (`map`, `filter`, `reduce`, `sort`, `flat`, etc.)
17. Object iteration (`Object.keys`, `entries`, `values`)
18. Map/Set operations
19. Queue/Stack operations
20. Linked list traversal
21. Tree/graph traversal

---

## **B. HIDDEN COMPLEXITY INSIDE OPERATIONS**

Things that look simple but have internal loops/allocations.

22. `.sort()`
23. `.includes()`
24. `.indexOf()` / `.find()`
25. JSON parse/stringify
26. Regex operations
27. String concatenation in loops
28. Cloning objects
29. Copying arrays
30. Spread operator `{...obj}` / `[...arr]`
31. Destructuring large objects
32. Deep comparisons
33. Hashing (Map/Set keys)
34. Serialization
35. Compression/decompression

---

## **C. MEMORY-IMPACTING OPERATIONS (SPACE COMPLEXITY)**

36. Creating large arrays
37. Creating large objects
38. Accumulating lists
39. Caching results
40. Memoization
41. Building temporary buffers
42. Recursion call stack depth
43. Input duplication
44. Returning large objects
45. Keeping references preventing GC

---

## **D. ALGORITHM & DATA STRUCTURE CHOICES**

46. Sorting algorithms
47. Searching algorithms
48. Pathfinding / graph algorithms
49. Tree operations
50. Hash tables
51. Priority queues / heaps
52. Dynamic programming
53. Divide-and-conquer
54. Brute-force enumeration
55. Backtracking
56. Greedy algorithms

---

## **E. INPUT-DEPENDENT FACTORS**

57. Input size
58. Input distribution (sorted/unsorted)
59. Input structure (sparse/dense)
60. Early exit conditions
61. Worst/Best/Average path differences
62. Data locality

---

## **F. RUNTIME & ENVIRONMENT FACTORS**

(Real-world performance, not AST based)

63. Garbage collection pressure
64. Memory allocation cost
65. Cache locality / CPU cache misses
66. JIT optimization or de-optimization
67. Event loop congestion
68. Thread pool saturation
69. I/O latency
70. Network latency
71. Disk access
72. Concurrency/parallelism conflicts
73. Lock contention (in some runtimes)
74. Browser vs Node.js differences

---

## **G. STRUCTURAL / ARCHITECTURAL FACTORS**

75. Complexity added by layers of abstraction
76. Calling external libraries (unknown complexity)
77. Multiple chained transformations
78. High cyclomatic complexity
79. High nesting depth
80. Dynamic typing fallback checks
81. Frequent exception handling
82. Proxy objects / reflection
83. Large dependency graphs (import chains)

---

## **H. LANGUAGE-SPECIFIC FACTORS (JS/TS)**

84. Hidden loops inside promises
85. Hidden loops inside async iterables
86. Spread syntax allocations
87. Runtime coercions (`==`, implicit conversions)
88. V8 optimizable vs V8 deoptimizing patterns
89. TypeScript emit helpers (transformed code)

---

# 🔥 **You now have the full, complete factor list.**

If you want, I can:

* Build a **mapping file** for your analyzer (e.g., keyword → complexity weight).
* Build a **seralizer** that extracts every one of these signals from ts-morph AST.
* Build your **complexity detection pipeline** end-to-end.
* Group these factors into “static-detectable” and “runtime-only”.

Just tell me what you want next.
