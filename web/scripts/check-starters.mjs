// Run: node scripts/check-starters.mjs [--judge]
// Checks every coding exercise has a spec, the generated JS/TS/React starters print the exact
// expected output when given a reference solution, and (--judge) every language's untouched
// starter compiles and runs on Judge0 (wrong answer is fine, compile/runtime error is not).
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import vm from "node:vm";
import ts from "typescript";

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".")) return next(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const { codeSpecs } = await import("../src/data/codeSpecs.ts");
const { codeRuntimes, createStarterCode } = await import("../src/data/codeRuntimes.ts");
const { learningContent } = await import("../src/data/learningContent.ts");
const { topics } = await import("../src/data/topics.ts");
const { problems } = await import("../src/data/problems.ts");

const codingTopics = topics.filter((topic) => topic.category === "Foundations" || topic.category === "Patterns");
const codingProblems = [
  ...problems.filter((problem) => problem.type === "leetcode"),
  ...codingTopics.flatMap((topic) => learningContent[topic.id].exercises.map((exercise) => ({
    ...exercise, prompt: exercise.instructions, type: "leetcode",
  }))),
];

// 1. Every coding problem has a spec and every spec belongs to a problem.
const ids = new Set(codingProblems.map((problem) => problem.id));
for (const id of ids) assert.ok(codeSpecs[id], `missing spec for ${id}`);
for (const id of Object.keys(codeSpecs)) assert.ok(ids.has(id), `spec without exercise: ${id}`);

// 2. Reference solutions: the JS/TS/React drivers must print exactly expectedOutput.
const listToArray = (head) => { const out = []; for (let n = head; n; n = n.next) out.push(n.val); return out; };
const adjacency = (n, edges, undirected) => {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); if (undirected) graph[b].push(a); }
  return graph;
};
const bfsDistance = (n, edges, start, target) => {
  const graph = adjacency(n, edges, true);
  const dist = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift();
    if (node === target) return dist.get(node);
    for (const next of graph[node]) if (!dist.has(next)) { dist.set(next, dist.get(node) + 1); queue.push(next); }
  }
  return -1;
};
const largestRectangleArea = (heights) => {
  let best = 0;
  heights.forEach((h, i) => {
    let l = i, r = i;
    while (l > 0 && heights[l - 1] >= h) l--;
    while (r < heights.length - 1 && heights[r + 1] >= h) r++;
    best = Math.max(best, h * (r - l + 1));
  });
  return best;
};
const isBalanced = (text) => {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of text) {
    if (!pairs[ch]) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
};
const threeSum = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const seen = new Set();
  const out = [];
  for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) for (let k = j + 1; k < sorted.length; k++) {
    const key = `${sorted[i]},${sorted[j]},${sorted[k]}`;
    if (sorted[i] + sorted[j] + sorted[k] === 0 && !seen.has(key)) { seen.add(key); out.push([sorted[i], sorted[j], sorted[k]]); }
  }
  return out;
};
const minSubArrayLen = (target, values) => {
  let best = Infinity;
  for (let i = 0; i < values.length; i++) { let s = 0; for (let j = i; j < values.length; j++) { s += values[j]; if (s >= target) { best = Math.min(best, j - i + 1); break; } } }
  return best === Infinity ? 0 : best;
};
const climbWays = (n) => { let [a, b] = [1, 1]; for (let i = 1; i < n; i++) [a, b] = [b, a + b]; return b; };
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
const height = (node) => (!node ? -1 : 1 + Math.max(height(node.left), height(node.right)));
const countNodes = (node) => (!node ? 0 : node.next !== undefined ? listToArray(node).length : 1 + countNodes(node.left) + countNodes(node.right));
const naryValues = (node) => [node.val, ...node.children.flatMap(naryValues)];

const reference = {
  twoSum: (values, target) => { const seen = new Map(); for (let i = 0; i < values.length; i++) { if (seen.has(target - values[i])) return [seen.get(target - values[i]), i]; seen.set(values[i], i); } return []; },
  isValid: isBalanced,
  sum: (values) => values.reduce((a, b) => a + b, 0),
  countOf: (items, target) => items.filter((item) => item === target).length,
  firstItem: (values) => values[0],
  doubleValues: (values) => values.map((v) => v * 2),
  rangeSum: (values, left, right) => values.slice(left, right + 1).reduce((a, b) => a + b, 0),
  groupByTeam: (names, teams) => { const groups = new Map(); names.forEach((name, i) => groups.set(teams[i], [...(groups.get(teams[i]) ?? []), name])); return [...groups.values()]; },
  longestConsecutive: (values) => { const set = new Set(values); let best = 0; for (const v of set) if (!set.has(v - 1)) { let len = 1; while (set.has(v + len)) len++; best = Math.max(best, len); } return best; },
  largest: (values) => Math.max(...values),
  moveZeroes: (values) => [...values.filter((v) => v !== 0), ...values.filter((v) => v === 0)],
  subarraySum: (values, target) => { let count = 0; for (let i = 0; i < values.length; i++) { let s = 0; for (let j = i; j < values.length; j++) { s += values[j]; if (s === target) count++; } } return count; },
  isPalindrome: (text) => text === [...text].reverse().join(""),
  hasPair: (values, target) => values.some((a, i) => values.some((b, j) => i !== j && a + b === target)),
  threeSum,
  reverseChars: (chars) => [...chars].reverse(),
  removeDuplicates: (values) => new Set(values).size,
  mergeSorted: (first, second) => [...first, ...second].sort((a, b) => a - b),
  maxArea: (h) => { let best = 0; for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, (j - i) * Math.min(h[i], h[j])); return best; },
  trap: (h) => h.reduce((total, v, i) => total + Math.max(0, Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - v), 0),
  reverse: (text) => [...text].reverse().join(""),
  isBalanced,
  nextGreater: (values) => values.map((v, i) => values.slice(i + 1).find((w) => w > v) ?? -1),
  peekTop: (items) => items[items.length - 1],
  undo: (actions) => actions[actions.length - 2],
  simplifyPath: (path) => { const parts = []; for (const p of path.split("/")) { if (p === "..") parts.pop(); else if (p && p !== ".") parts.push(p); } return `/${parts.join("/")}`; },
  largestRectangleArea,
  popTop: (pages) => pages[pages.length - 1],
  evalPostfix: (expression) => { const stack = []; for (const token of expression.split(" ")) { if (/^-?\d+$/.test(token)) stack.push(Number(token)); else { const b = stack.pop(), a = stack.pop(); stack.push(token === "+" ? a + b : token === "-" ? a - b : token === "*" ? a * b : Math.trunc(a / b)); } } return stack.pop(); },
  serveFirst: (jobs) => jobs[0],
  recent: (requests, limit) => requests.slice(-limit),
  bfs: (root) => { const out = [], queue = [root]; while (queue.length) { const n = queue.shift(); out.push(n.val); queue.push(...n.children); } return out; },
  serve: (customers, count) => customers.slice(0, count),
  peekFront: (jobs) => jobs[0],
  roundRobin: (names, work) => { const left = [...work], queue = names.map((_, i) => i), out = []; while (queue.length) { const i = queue.shift(); out.push(names[i]); if (--left[i] > 0) queue.push(i); } return out; },
  shortestPath: bfsDistance,
  orangesRotting: (grid) => { const g = grid.map((r) => [...r]); let minutes = 0; for (;;) { const rot = []; g.forEach((row, r) => row.forEach((v, c) => { if (v === 1 && [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([y, x]) => g[y]?.[x] === 2)) rot.push([r, c]); })); if (!rot.length) break; rot.forEach(([r, c]) => { g[r][c] = 2; }); minutes++; } return g.flat().includes(1) ? -1 : minutes; },
  finishTime: (durations, index) => durations.slice(0, index + 1).reduce((a, b) => a + b, 0),
  shortestGridPath: (grid) => { const rows = grid.length, cols = grid[0].length, dist = new Map([["0,0", 0]]), queue = [[0, 0]]; while (queue.length) { const [r, c] = queue.shift(); if (r === rows - 1 && c === cols - 1) return dist.get(`${r},${c}`); for (const [y, x] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (grid[y]?.[x] === 0 && !dist.has(`${y},${x}`)) { dist.set(`${y},${x}`, dist.get(`${r},${c}`) + 1); queue.push([y, x]); } } return -1; },
  countNodes,
  middle: (head) => { const values = listToArray(head); return values[Math.floor(values.length / 2)]; },
  reverseList: (head) => { let prev = null; while (head) [head.next, prev, head] = [prev, head, head.next]; return prev; },
  headValue: (head) => head.val,
  appendNode: (head, value) => { let n = head; while (n.next) n = n.next; n.next = new head.constructor(value); return head; },
  removeValue: (head, target) => { const dummy = { next: head }; for (let n = dummy; n.next;) { if (n.next.val === target) n.next = n.next.next; else n = n.next; } return dummy.next; },
  hasCycle: (...args) => {
    if (args.length === 2) { const graph = adjacency(args[0], args[1]), state = []; const dfs = (n) => { state[n] = 1; for (const m of graph[n]) if (state[m] === 1 || (!state[m] && dfs(m))) return true; state[n] = 2; return false; }; return graph.some((_, n) => !state[n] && dfs(n)); }
    let slow = args[0], fast = args[0]; while (fast && fast.next) { slow = slow.next; fast = fast.next.next; if (slow === fast) return true; } return false;
  },
  mergeTwoLists: (a, b) => { const dummy = { next: null }; let tail = dummy; while (a && b) { if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; } tail = tail.next; } tail.next = a || b; return dummy.next; },
  firstWindowSum: (values, size) => values.slice(0, size).reduce((a, b) => a + b, 0),
  maxWindowSum: (values, size) => Math.max(...values.slice(0, values.length - size + 1).map((_, i) => values.slice(i, i + size).reduce((a, b) => a + b, 0))),
  longestUnique: (text) => { let best = 0; for (let i = 0; i < text.length; i++) { const seen = new Set(); for (let j = i; j < text.length && !seen.has(text[j]); j++) { seen.add(text[j]); best = Math.max(best, j - i + 1); } } return best; },
  windowAverage: (values, size) => Math.trunc(values.slice(0, size).reduce((a, b) => a + b, 0) / size),
  countWindows: (values, size, target) => values.slice(0, values.length - size + 1).filter((_, i) => values.slice(i, i + size).reduce((a, b) => a + b, 0) === target).length,
  minSubArrayLen,
  longestTwoDistinct: (text) => { let best = 0; for (let i = 0; i < text.length; i++) for (let j = i; j < text.length; j++) if (new Set(text.slice(i, j + 1)).size <= 2) best = Math.max(best, j - i + 1); return best; },
  minWindow: (text, required) => { let best = ""; for (let i = 0; i < text.length; i++) for (let j = i + 1; j <= text.length; j++) { const window = text.slice(i, j); if ([...required].every((ch) => window.includes(ch)) && (!best || window.length < best.length)) best = window; } return best; },
  longestOnes: (values) => Math.max(...values.join("").split("0").map((run) => run.length)),
  countLeaves: (node) => (node.children.length ? node.children.reduce((total, child) => total + reference.countLeaves(child), 0) : 1),
  contains: (node, target) => naryValues(node).includes(target),
  hasPath: (n, edges, start, target) => { const graph = adjacency(n, edges), seen = new Set([start]), stack = [start]; while (stack.length) { const node = stack.pop(); if (node === target) return true; for (const next of graph[node]) if (!seen.has(next)) { seen.add(next); stack.push(next); } } return false; },
  countEdges: (root) => naryValues(root).length - 1,
  height,
  levelOrder: (root) => { const out = [], queue = [root]; while (queue.length) { const n = queue.shift(); if (!n) continue; out.push(n.val); queue.push(n.left, n.right); } return out; },
  findOrder: (n, prerequisites) => { const indegree = Array(n).fill(0), graph = adjacency(n, prerequisites.map(([course, req]) => [req, course])); prerequisites.forEach(([course]) => indegree[course]++); const queue = indegree.flatMap((d, i) => (d ? [] : [i])), out = []; while (queue.length) { const node = queue.shift(); out.push(node); for (const next of graph[node]) if (--indegree[next] === 0) queue.push(next); } return out.length === n ? out : []; },
  inorderTraversal: (root) => (!root ? [] : [...reference.inorderTraversal(root.left), root.val, ...reference.inorderTraversal(root.right)]),
  climbWays,
  fib,
  minCoins: (coins, amount) => { const dp = [0, ...Array(amount).fill(Infinity)]; for (let x = 1; x <= amount; x++) for (const c of coins) if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1); return dp[amount] === Infinity ? -1 : dp[amount]; },
  uniquePaths: (rows, cols) => { const dp = Array(cols).fill(1); for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++) dp[c] += dp[c - 1]; return dp[cols - 1]; },
  minCostClimbingStairs: (cost) => { let [a, b] = [0, 0]; for (let i = 2; i <= cost.length; i++) [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])]; return b; },
  lengthOfLIS: (values) => { const dp = values.map(() => 1); values.forEach((v, i) => { for (let j = 0; j < i; j++) if (values[j] < v) dp[i] = Math.max(dp[i], dp[j] + 1); }); return Math.max(...dp); },
  change: (amount, coins) => { const dp = [1, ...Array(amount).fill(0)]; for (const c of coins) for (let x = c; x <= amount; x++) dp[x] += dp[x - c]; return dp[amount]; },
  knapsack: (weights, values, capacity) => { const dp = Array(capacity + 1).fill(0); weights.forEach((w, i) => { for (let cap = capacity; cap >= w; cap--) dp[cap] = Math.max(dp[cap], dp[cap - w] + values[i]); }); return dp[capacity]; },
};

const STUB = "  // Write your solution here\n";
function runWithReference(code, fn) {
  const output = [];
  const injected = code.replace(/  \/\/ Write your solution here\n(  return [^\n]*\n)?/, "  return __ref(...arguments);\n");
  assert.notEqual(injected, code, `stub marker not found for ${fn}`);
  vm.runInNewContext(injected, { console: { log: (value) => output.push(String(value)) }, __ref: reference[fn] });
  return output.join("\n");
}
const reactShim = "const React = { createElement(type, props, ...children) { return { type, props: { ...(props || {}), children } }; } };\n";

for (const problem of codingProblems) {
  const spec = codeSpecs[problem.id];
  assert.ok(reference[spec.fn], `no reference solution for ${spec.fn}`);
  const js = createStarterCode(problem, "javascript");
  assert.ok(js.includes(STUB));
  assert.equal(runWithReference(js, spec.fn), problem.expectedOutput, `${problem.id} (javascript)`);
  const tsCode = ts.transpileModule(createStarterCode(problem, "typescript"), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  assert.equal(runWithReference(tsCode, spec.fn), problem.expectedOutput, `${problem.id} (typescript)`);
  const jsx = ts.transpileModule(createStarterCode(problem, "react"), { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
  assert.equal(runWithReference(reactShim + jsx, spec.fn), problem.expectedOutput, `${problem.id} (react)`);

  for (const language of Object.keys(codeRuntimes)) {
    const code = createStarterCode(problem, language);
    const name = language === "csharp" ? spec.fn[0].toUpperCase() + spec.fn.slice(1)
      : language === "rust" || language === "ruby" ? spec.fn.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) : spec.fn;
    assert.ok(code.includes(name), `${problem.id} (${language}) missing ${name}`);
    assert.ok(!/[(,=[] ?undefined[),;\]]/.test(code) && !code.includes("unsupported"), `${problem.id} (${language}) has a bad literal`);
  }
}
console.log(`ok: ${codingProblems.length} coding problems, reference outputs match for JS/TS/React`);

// 3. --judge: compile and run one untouched starter per (language, signature shape) on Judge0.
if (process.argv.includes("--judge")) {
  const judge0 = (process.env.JUDGE0_API_URL || "https://ce.judge0.com").replace(/\/$/, "");
  const shapes = new Map();
  for (const problem of codingProblems) {
    const spec = codeSpecs[problem.id];
    const key = `${spec.params.map((p) => p.type).join(",")}->${spec.returns}`;
    if (!shapes.has(key)) shapes.set(key, problem);
  }
  const languages = process.argv.find((arg) => arg.startsWith("--lang="))?.slice(7).split(",")
    ?? Object.keys(codeRuntimes).filter((language) => !["javascript", "typescript", "react"].includes(language));
  const failures = [];
  for (const language of languages) {
    const versions = codeRuntimes[language].versions;
    for (const version of [versions[0], versions[versions.length - 1]]) {
      for (const [shape, problem] of shapes) {
        const response = await fetch(`${judge0}/submissions?base64_encoded=false&wait=true`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: createStarterCode(problem, language),
            language_id: version.languageId,
            expected_output: problem.expectedOutput,
          }),
        });
        const result = await response.json();
        const status = result.status?.id;
        const ok = status === 3 || status === 4;
        if (!ok) failures.push({ language, version: version.label, shape, id: problem.id, status: result.status?.description ?? JSON.stringify(result), output: result.compile_output || result.stderr || result.message });
        process.stdout.write(ok ? "." : "x");
      }
    }
    console.log(` ${language}`);
  }
  for (const failure of failures) console.log(`\nFAIL ${failure.language} ${failure.version} ${failure.id} [${failure.shape}] ${failure.status}\n${failure.output ?? ""}`);
  assert.equal(failures.length, 0, `${failures.length} starters failed to compile/run`);
  console.log(`ok: ${shapes.size} signature shapes compile on Judge0 for ${languages.join(", ")}`);
}
