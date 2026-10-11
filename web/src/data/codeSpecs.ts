// LeetCode-style function contracts for coding exercises, keyed by exercise id.
// codeRuntimes.ts renders each spec into a typed stub plus test driver for every language.

export type ParamType =
  | "int" | "bool" | "string" | "int[]" | "string[]" | "int[][]" | "string[][]"
  | "ListNode" | "CycleList" | "TreeNode" | "NaryNode";

export interface TreeValue { val: number; left?: TreeValue | null; right?: TreeValue | null }
export interface NaryValue { val: number; children: NaryValue[] }
export interface CycleValue { list: number[]; pos: number }

export interface CodeSpec {
  fn: string;
  params: { name: string; type: ParamType }[];
  returns: ParamType;
  args: unknown[];
}

function spec(fn: string, params: string, returns: ParamType, ...args: unknown[]): CodeSpec {
  return {
    fn,
    params: params.split(",").map((pair) => {
      const [name, type] = pair.trim().split(":");
      return { name, type: type as ParamType };
    }),
    returns,
    args,
  };
}

const tree = (val: number, left: TreeValue | null = null, right: TreeValue | null = null): TreeValue => ({ val, left, right });
const node = (val: number, ...children: NaryValue[]): NaryValue => ({ val, children });

export const codeSpecs: Record<string, CodeSpec> = {
  // problems.ts
  "two-sum": spec("twoSum", "values:int[], target:int", "int[]", [2, 7, 11, 15], 9),
  "valid-parentheses": spec("isValid", "text:string", "bool", "()[]{}"),

  // arrays
  "array-sum": spec("sum", "values:int[]", "int", [1, 2, 3, 4]),
  "array-frequency": spec("countOf", "items:string[], target:string", "int", ["apple", "pear", "apple"], "apple"),
  "array-two-sum": spec("twoSum", "values:int[], target:int", "int[]", [2, 7, 11, 15], 9),
  "arrays-find-the-first-item": spec("firstItem", "values:int[]", "int", [8, 3, 5]),
  "arrays-double-each-value": spec("doubleValues", "values:int[]", "int[]", [2, 4, 6]),
  "arrays-range-sum-queries": spec("rangeSum", "values:int[], left:int, right:int", "int", [2, 4, 1, 5], 1, 3),
  "arrays-group-values-by-key": spec("groupByTeam", "names:string[], teams:string[]", "string[][]", ["Mia", "Leo", "Ava"], ["red", "blue", "red"]),
  "arrays-longest-consecutive-run": spec("longestConsecutive", "values:int[]", "int", [100, 4, 200, 1, 3, 2]),
  "arrays-find-the-largest-value": spec("largest", "values:int[]", "int", [4, 9, 2, 7]),
  "arrays-move-zeroes-to-the-end": spec("moveZeroes", "values:int[]", "int[]", [0, 1, 0, 3, 12]),
  "arrays-count-subarrays-with-target-sum": spec("subarraySum", "values:int[], target:int", "int", [1, 2, 1, 2], 3),

  // two pointers
  "two-pointer-palindrome": spec("isPalindrome", "text:string", "bool", "level"),
  "two-pointer-pair-sum": spec("hasPair", "values:int[], target:int", "bool", [1, 3, 4, 7, 9], 10),
  "two-pointer-three-sum": spec("threeSum", "values:int[]", "int[][]", [-1, 0, 1, 2, -1, -4]),
  "two-pointers-reverse-characters": spec("reverseChars", "chars:string[]", "string[]", ["c", "a", "t"]),
  "two-pointers-remove-duplicates": spec("removeDuplicates", "values:int[]", "int", [1, 1, 2, 3, 3]),
  "two-pointers-merge-sorted-arrays": spec("mergeSorted", "first:int[], second:int[]", "int[]", [1, 4, 6], [2, 3, 7]),
  "two-pointers-container-with-most-water": spec("maxArea", "heights:int[]", "int", [1, 8, 6, 2, 5, 4, 8, 3, 7]),
  "two-pointers-trap-rain-water": spec("trap", "heights:int[]", "int", [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]),
  "two-pointers-compare-from-both-ends": spec("isPalindrome", "text:string", "bool", "level"),
  "two-pointers-pair-sum-in-a-sorted-list": spec("hasPair", "values:int[], target:int", "bool", [1, 2, 4, 6, 9], 10),
  "two-pointers-three-values-sum-to-zero": spec("threeSum", "values:int[]", "int[][]", [-1, 0, 1, 2, -1, -4]),

  // stacks
  "stack-reverse": spec("reverse", "text:string", "string", "xedoc"),
  "stack-balanced": spec("isBalanced", "text:string", "bool", "(()())"),
  "stack-next": spec("nextGreater", "values:int[]", "int[]", [2, 1, 3]),
  "stacks-inspect-the-top": spec("peekTop", "items:string[]", "string", ["red", "blue"]),
  "stacks-undo-the-latest-action": spec("undo", "actions:string[]", "string", ["type", "bold", "save"]),
  "stacks-check-mixed-brackets": spec("isBalanced", "text:string", "bool", "{[()]}"),
  "stacks-simplify-a-file-path": spec("simplifyPath", "path:string", "string", "/home//sam/./docs/../notes"),
  "stacks-largest-rectangle-in-bars": spec("largestRectangleArea", "heights:int[]", "int", [2, 1, 5, 6, 2, 3]),
  "stacks-read-the-latest-page": spec("popTop", "pages:string[]", "string", ["home", "topics", "quiz"]),
  "stacks-evaluate-postfix-notation": spec("evalPostfix", "expression:string", "int", "2 3 4 * +"),
  "stacks-largest-rectangle": spec("largestRectangleArea", "heights:int[]", "int", [2, 4, 2, 1]),

  // queues
  "queue-basic": spec("serveFirst", "jobs:string[]", "string", ["email", "report", "backup"]),
  "queue-recent": spec("recent", "requests:string[], limit:int", "string[]", ["a", "b", "c", "d"], 3),
  "queue-bfs": spec("bfs", "root:NaryNode", "int[]", node(1, node(2, node(4)), node(3))),
  "queues-serve-two-customers": spec("serve", "customers:string[], count:int", "string[]", ["Ari", "Bo", "Cal"], 2),
  "queues-process-jobs": spec("peekFront", "jobs:string[]", "string", ["print", "email"]),
  "queues-round-robin-turns": spec("roundRobin", "names:string[], work:int[]", "string[]", ["A", "B"], [2, 1]),
  "queues-shortest-unweighted-route": spec("shortestPath", "n:int, edges:int[][], start:int, target:int", "int", 4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3),
  "queues-rotting-oranges": spec("orangesRotting", "grid:int[][]", "int", [[2, 1, 1], [1, 1, 0], [0, 1, 1]]),
  "queues-first-in-line": spec("serveFirst", "jobs:string[]", "string", ["A", "B", "C"]),
  "queues-time-to-finish": spec("finishTime", "durations:int[], index:int", "int", [3, 1, 2], 2),
  "queues-shortest-grid-path": spec("shortestGridPath", "grid:int[][]", "int", [[0, 0, 0], [1, 1, 0], [0, 0, 0]]),

  // linked lists
  "linked-list-count": spec("countNodes", "head:ListNode", "int", [1, 2]),
  "linked-list-middle": spec("middle", "head:ListNode", "int", [1, 2, 3]),
  "linked-list-reverse": spec("reverseList", "head:ListNode", "ListNode", [1, 2, 3]),
  "linked-lists-read-the-head": spec("headValue", "head:ListNode", "int", [7, 3, 1]),
  "linked-lists-append-a-node": spec("appendNode","head:ListNode, value:int", "ListNode", [1, 2, 3], 4),
  "linked-lists-remove-a-value": spec("removeValue", "head:ListNode, target:int", "ListNode", [1, 2, 3], 2),
  "linked-lists-detect-a-cycle": spec("hasCycle", "head:CycleList", "bool", { list: [3, 2, 0, -4], pos: 1 }),
  "linked-lists-merge-two-sorted-lists": spec("mergeTwoLists", "first:ListNode, second:ListNode", "ListNode", [1, 3, 5], [2, 4, 6]),
  "linked-lists-read-the-list-head-value": spec("headValue", "head:ListNode", "int", [5, 8, 2]),
  "linked-lists-remove-a-node": spec("removeValue", "head:ListNode, target:int", "ListNode", [5, 8, 2], 8),
  "linked-lists-find-a-cycle": spec("hasCycle", "head:CycleList", "bool", { list: [1, 2, 3, 4], pos: 1 }),

  // sliding window
  "window-first": spec("firstWindowSum", "values:int[], size:int", "int", [2, 4, 6, 8], 3),
  "window-max": spec("maxWindowSum", "values:int[], size:int", "int", [2, 1, 5, 1, 3, 2], 3),
  "window-unique": spec("longestUnique", "text:string", "int", "abcabcbb"),
  "sliding-window-average-of-a-window": spec("windowAverage", "values:int[], size:int", "int", [3, 7, 2], 2),
  "sliding-window-count-matching-window": spec("countWindows", "values:int[], size:int, target:int", "int", [1, 1, 1, 2], 2, 2),
  "sliding-window-minimum-length-at-least-target": spec("minSubArrayLen", "target:int, values:int[]", "int", 7, [2, 3, 1, 2, 4, 3]),
  "sliding-window-longest-two-character-substring": spec("longestTwoDistinct", "text:string", "int", "ccaabbb"),
  "sliding-window-minimum-covering-substring": spec("minWindow", "text:string, required:string", "string", "ADOBECODEBANC", "ABC"),
  "sliding-window-sum-two-values": spec("firstWindowSum", "values:int[], size:int", "int", [6, 2, 9], 2),
  "sliding-window-longest-run-of-ones": spec("longestOnes", "values:int[]", "int", [1, 1, 0, 1, 1, 1]),
  "sliding-window-smallest-subarray-at-least-target": spec("minSubArrayLen", "target:int, values:int[]", "int", 11, [1, 2, 3, 4, 5]),

  // trees and graphs
  "tree-leaves": spec("countLeaves", "root:NaryNode", "int", node(1, node(2), node(3, node(4)))),
  "tree-dfs": spec("contains", "root:NaryNode, target:int", "bool", node(1, node(2)), 2),
  "graph-path": spec("hasPath", "n:int, edges:int[][], start:int, target:int", "bool", 4, [[0, 1], [1, 2], [2, 3]], 0, 3),
  "trees-count-child-nodes": spec("countEdges", "root:NaryNode", "int", node(1, node(2), node(3), node(4))),
  "trees-find-the-tree-height": spec("height", "root:TreeNode", "int", tree(1, tree(2, tree(4, tree(6))), tree(3))),
  "trees-level-order-traversal": spec("levelOrder", "root:TreeNode", "int[]", tree(1, tree(2, tree(4)), tree(3))),
  "trees-detect-a-graph-cycle": spec("hasCycle", "n:int, edges:int[][]", "bool", 3, [[0, 1], [1, 2], [2, 0]]),
  "trees-course-ordering": spec("findOrder", "numCourses:int, prerequisites:int[][]", "int[]", 3, [[1, 0], [2, 1]]),
  "trees-count-the-root": spec("countNodes", "root:TreeNode", "int", tree(1)),
  "trees-inorder-traversal": spec("inorderTraversal", "root:TreeNode", "int[]", tree(2, tree(1), tree(3))),
  "trees-shortest-path-in-an-unweighted-graph": spec("shortestPath", "n:int, edges:int[][], start:int, target:int", "int", 5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0, 4),

  // dynamic programming
  "dp-step": spec("climbWays", "steps:int", "int", 4),
  "dp-fib": spec("fib", "n:int", "int", 10),
  "dp-coins": spec("minCoins", "coins:int[], amount:int", "int", [1, 3, 4], 6),
  "dynamic-programming-base-cases": spec("climbWays", "steps:int", "int", 2),
  "dynamic-programming-reuse-a-subproblem": spec("fib", "n:int", "int", 4),
  "dynamic-programming-grid-path-count": spec("uniquePaths", "rows:int, cols:int", "int", 2, 3),
  "dynamic-programming-minimum-climbing-cost": spec("minCostClimbingStairs", "cost:int[]", "int", [10, 15, 20]),
  "dynamic-programming-longest-increasing-subsequence": spec("lengthOfLIS", "values:int[]", "int", [10, 9, 2, 5, 3, 7, 101, 18]),
  "dynamic-programming-one-step-staircase": spec("climbWays", "steps:int", "int", 1),
  "dynamic-programming-count-coin-combinations": spec("change", "amount:int, coins:int[]", "int", 4, [1, 2]),
  "dynamic-programming-0-1-knapsack": spec("knapsack", "weights:int[], values:int[], capacity:int", "int", [2, 3, 4], [4, 5, 7], 5),
};
