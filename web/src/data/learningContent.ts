import type { LearningExercise, ProblemDifficulty, TopicContent } from "../types";

function exercise(
  id: string,
  title: string,
  difficulty: ProblemDifficulty,
  instructions: string,
  starterCode: string,
  expectedOutput: string,
  hint: string,
): LearningExercise {
  return { id, title, difficulty, instructions, starterCode, expectedOutput, hint };
}

function levels(
  basics: string,
  mechanics: string,
  advanced: string,
): TopicContent["levels"] {
  return [
    { label: "Beginner", title: "Build the mental model", explanation: basics, takeaway: "Know what the structure stores and when to reach for it." },
    { label: "Intermediate", title: "Recognize the pattern", explanation: mechanics, takeaway: "Translate a problem statement into the right operations." },
    { label: "Advanced", title: "Reason about tradeoffs", explanation: advanced, takeaway: "Explain complexity, edge cases, and alternative designs." },
  ];
}

function mathContent(title: string, overview: string, analogy: string): TopicContent {
  return {
    overview,
    analogy,
    levels: levels(
      `Learn the core vocabulary and notation for ${title}.`,
      "Practice choosing the right method and explaining each step clearly.",
      "Connect the method to edge cases, alternate strategies, and real applications.",
    ),
    exercises: [
      exercise(
        `${title.toLowerCase().split(" ").join("-")}-reasoning`,
        `${title} reasoning check`,
        "Medium",
        `Solve a representative ${title} problem and explain the reasoning behind each step.`,
        "function explainSolution() {\n  // Write your reasoning in the answer box on the Challenge page\n}\n\nconsole.log('ready');",
        "ready",
        "State what is given, what you need to find, and why each transformation is valid.",
      ),
    ],
  };
}

export const learningContent: Record<string, TopicContent> = {
  arrays: {
    overview: "Arrays keep values in an ordered sequence. Hash maps pair unique keys with values for fast lookup. Together they solve a huge range of counting, lookup, and grouping problems.",
    analogy: "An array is a numbered row of lockers; a hash map is a labeled index telling you which locker to open.",
    levels: levels("Read and update values by index, then learn key-value storage.", "Combine one pass with a map to avoid repeated searches.", "Handle collisions, memory tradeoffs, and in-place transformations."),
    exercises: [
      exercise("array-sum", "Sum an array", "Easy", "Complete sum so it returns the total. The final log must print 10.", "function sum(values) {\n  // Your code here\n}\n\nconsole.log(sum([1, 2, 3, 4]));", "10", "Start with a total of zero and visit every value."),
      exercise("array-frequency", "Build a frequency map", "Medium", "Count each fruit and print the number of apples.", "function frequencies(items) {\n  // Return an object of counts\n}\n\nconst counts = frequencies(['apple', 'pear', 'apple']);\nconsole.log(counts.apple);", "2", "Use the item as an object key and default missing counts to zero."),
      exercise("array-two-sum", "Two sum", "Hard", "Return the two indices whose values total 9, formatted as JSON.", "function twoSum(values, target) {\n  // Solve in one pass\n}\n\nconsole.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));", "[0,1]", "Store each value's index, then look for target - value."),
    ],
  },
  stacks: {
    overview: "A stack stores items in last-in, first-out order. The newest item is always the first one removed, which makes stacks ideal for nested work and undo history.",
    analogy: "Think of a stack of plates: you add and remove from the top.",
    levels: levels("Practice push, pop, and peek operations.", "Use stacks for matching pairs, undo, and depth-first traversal.", "Design monotonic stacks that discard values which can no longer help."),
    exercises: [
      exercise("stack-reverse", "Reverse with a stack", "Easy", "Use stack operations to reverse the word and print 'codex'.", "function reverse(text) {\n  const stack = text.split('');\n  // Use the stack to build the result\n}\n\nconsole.log(reverse('xedoc'));", "codex", "Repeatedly pop until the stack is empty."),
      exercise("stack-balanced", "Balanced parentheses", "Medium", "Return true only when every opening bracket is properly closed.", "function isBalanced(text) {\n  // Your code here\n}\n\nconsole.log(isBalanced('(()())'));", "true", "Push openers; each closer must have an opener to pop."),
      exercise("stack-next", "Next greater value", "Hard", "Print the next greater value for each item, or -1.", "function nextGreater(values) {\n  // Try a stack of unresolved indices\n}\n\nconsole.log(JSON.stringify(nextGreater([2, 1, 3])));", "[3,3,-1]", "When a larger value arrives, resolve smaller indices from the stack."),
    ],
  },
  queues: {
    overview: "A queue stores items in first-in, first-out order. Work enters at the back and leaves from the front, preserving arrival order.",
    analogy: "Like a checkout line: the first person to join is the first person served.",
    levels: levels("Learn enqueue, dequeue, front, and empty checks.", "Use queues for breadth-first search, scheduling, and buffering.", "Build deques and priority queues when plain arrival order is not enough."),
    exercises: [
      exercise("queue-basic", "Serve the first item", "Easy", "Add three jobs, remove the first, and print it.", "const queue = [];\nqueue.push('email');\nqueue.push('report');\nqueue.push('backup');\n\n// Remove and print the first job\n", "email", "Array shift removes the front item."),
      exercise("queue-recent", "Recent requests", "Medium", "Keep only the last three requests and print them as JSON.", "function recent(requests, limit) {\n  const queue = [];\n  // Add each request and trim the front\n}\n\nconsole.log(JSON.stringify(recent(['a', 'b', 'c', 'd'], 3)));", "[\"b\",\"c\",\"d\"]", "After enqueueing, dequeue while the queue is too large."),
      exercise("queue-bfs", "Breadth-first traversal", "Hard", "Traverse this tree level by level and print the values as JSON.", "function bfs(root) {\n  // Use a queue beginning with root\n}\n\nconst tree = { value: 1, children: [\n  { value: 2, children: [{ value: 4, children: [] }] },\n  { value: 3, children: [] }\n]};\nconsole.log(JSON.stringify(bfs(tree)));", "[1,2,3,4]", "Dequeue one node, record it, then enqueue all of its children."),
    ],
  },
  "sliding-window": {
    overview: "A sliding window tracks one contiguous section of a sequence and updates it as the boundaries move, avoiding repeated work.",
    analogy: "Move a picture frame across a long photo and study only what is inside the frame.",
    levels: levels("Compute values for fixed-size windows.", "Grow and shrink a dynamic window while maintaining its state.", "Prove when each item enters and exits at most once for linear time."),
    exercises: [
      exercise("window-first", "First window sum", "Easy", "Print the sum of the first three values.", "const values = [2, 4, 6, 8];\nconst size = 3;\n// Calculate the first window\n", "12", "Slice the first size values and add them."),
      exercise("window-max", "Maximum window sum", "Medium", "Find the largest sum among windows of size three.", "function maxWindowSum(values, size) {\n  // Reuse the previous window sum\n}\n\nconsole.log(maxWindowSum([2, 1, 5, 1, 3, 2], 3));", "9", "Subtract the item leaving and add the item entering."),
      exercise("window-unique", "Longest unique substring", "Hard", "Print the length of the longest substring without repeated characters.", "function longestUnique(text) {\n  // Track each character's latest index\n}\n\nconsole.log(longestUnique('abcabcbb'));", "3", "Move the left edge beyond a repeated character's previous position."),
    ],
  },
  trees: {
    overview: "Trees model parent-child relationships; graphs generalize connections between any nodes. Traversal lets you systematically visit their structure.",
    analogy: "A family tree branches from ancestors; a transit map is a graph of stations and routes.",
    levels: levels("Identify nodes, edges, roots, leaves, and neighbors.", "Implement depth-first and breadth-first traversal with visited state.", "Reason about cycles, shortest paths, topological order, and connectivity."),
    exercises: [
      exercise("tree-leaves", "Count leaves", "Easy", "Count nodes with no children.", "function countLeaves(node) {\n  // Base case: no children\n}\n\nconst tree = { children: [{ children: [] }, { children: [{ children: [] }] }] };\nconsole.log(countLeaves(tree));", "2", "A leaf contributes one; otherwise sum the child results."),
      exercise("tree-dfs", "Depth-first search", "Medium", "Return true when the target exists in the tree.", "function contains(node, target) {\n  // Search recursively or with a stack\n}\n\nconst tree = { value: 1, children: [{ value: 2, children: [] }] };\nconsole.log(contains(tree, 2));", "true", "Check the current node, then search its children."),
      exercise("graph-path", "Graph reachability", "Hard", "Determine whether d can be reached from a.", "function hasPath(graph, start, target) {\n  // Remember visited nodes\n}\n\nconst graph = { a: ['b'], b: ['c'], c: ['d'], d: [] };\nconsole.log(hasPath(graph, 'a', 'd'));", "true", "Traverse neighbors and use a Set to avoid revisiting nodes."),
    ],
  },
  "dynamic-programming": {
    overview: "Dynamic programming solves overlapping subproblems once and reuses their answers, trading memory for speed.",
    analogy: "Keep your completed puzzle pieces instead of rebuilding each one every time it is needed.",
    levels: levels("Spot repeated recursive work and cache it.", "Define state, transitions, base cases, and evaluation order.", "Compress state and prove optimal substructure."),
    exercises: [
      exercise("dp-step", "Ways to climb", "Easy", "Print the number of ways to climb four steps using moves of one or two.", "function climbWays(steps) {\n  // Build from the first two base cases\n}\n\nconsole.log(climbWays(4));", "5", "Ways(n) equals ways(n - 1) plus ways(n - 2)."),
      exercise("dp-fib", "Memoized Fibonacci", "Medium", "Implement memoized Fibonacci and print fib(10).", "function fib(n, memo = {}) {\n  // Cache computed values\n}\n\nconsole.log(fib(10));", "55", "Return n for n below 2; otherwise cache the recursive sum."),
      exercise("dp-coins", "Minimum coins", "Hard", "Find the fewest coins needed to make amount 6.", "function minCoins(coins, amount) {\n  // dp[x] is the best answer for amount x\n}\n\nconsole.log(minCoins([1, 3, 4], 6));", "2", "Initialize unreachable amounts to Infinity and build upward."),
    ],
  },
  "system-design": {
    overview: "System design turns product requirements into cooperating services, APIs, data stores, caches, and queues that remain reliable as usage grows.",
    analogy: "Designing a city means planning roads, utilities, capacity, and failure recovery before adding buildings.",
    levels: levels("Clarify users, requirements, and the core data flow.", "Choose APIs, storage, caching, and scaling boundaries.", "Analyze consistency, hot spots, failures, observability, and cost."),
    exercises: [
      exercise("system-id", "Generate a short ID", "Easy", "Convert the number to base 36 and print the result.", "function shortId(number) {\n  // Use a compact alphanumeric representation\n}\n\nconsole.log(shortId(12345));", "9ix", "JavaScript numbers can be converted with toString(radix)."),
      exercise("system-shard", "Choose a shard", "Medium", "Route each numeric user ID to one of four shards.", "function shardFor(userId, shardCount) {\n  // Return a stable shard number\n}\n\nconsole.log(shardFor(42, 4));", "2", "Modulo gives a stable value from zero to shardCount - 1."),
      exercise("system-rate", "Fixed-window limiter", "Hard", "Allow only the first three calls and print the decisions as JSON.", "function createLimiter(limit) {\n  // Return a function that tracks calls\n}\n\nconst allow = createLimiter(3);\nconsole.log(JSON.stringify([allow(), allow(), allow(), allow()]));", "[true,true,true,false]", "Close over a counter and compare it with the limit."),
    ],
  },
  "algebra-2": mathContent(
    "Algebra 2",
    "Algebra 2 builds fluency with functions, polynomials, exponentials, logarithms, and equation solving.",
    "Think of algebra as a toolkit for transforming expressions without changing their meaning.",
  ),
  precalculus: mathContent(
    "Precalculus",
    "Precalculus connects advanced functions, graphs, trigonometry, limits, and modeling before calculus.",
    "Precalculus is the bridge between symbolic algebra and motion/change.",
  ),
  "calculus-1": mathContent(
    "Calculus 1",
    "Calculus 1 focuses on limits, derivatives, rates of change, tangent lines, and optimization.",
    "A derivative is a speedometer for a changing quantity.",
  ),
  "calculus-2": mathContent(
    "Calculus 2",
    "Calculus 2 develops integration techniques, accumulation, sequences, and series.",
    "Integration is a way to add infinitely many tiny pieces into one whole.",
  ),
  trigonometry: mathContent(
    "Trigonometry",
    "Trigonometry studies angles, cycles, unit-circle relationships, identities, and wave behavior.",
    "Trig turns rotation and repeating motion into measurable relationships.",
  ),
  "calculus-3": mathContent(
    "Calculus 3",
    "Calculus 3 extends calculus into vectors, 3D space, multivariable functions, and partial derivatives.",
    "Instead of walking on a line, Calculus 3 explores movement across landscapes.",
  ),
  "discrete-math": mathContent(
    "Discrete Math",
    "Discrete Math builds foundations in logic, proofs, sets, counting, recurrence, and graphs.",
    "Discrete math is the grammar of computer science reasoning.",
  ),
  statistics: mathContent(
    "Statistics",
    "Statistics explains data, probability, distributions, inference, and uncertainty.",
    "Statistics is how we make careful claims when the world is noisy.",
  ),
  science: {
    overview: "Science uses observation and evidence to explain patterns in the natural world. Strong explanations connect what happens to the mechanisms that cause it.",
    analogy: "A scientific explanation is a detective story: observations are clues, and evidence supports the best explanation.",
    levels: levels("Describe observations and identify the scientific question.", "Connect evidence to models such as matter, energy, and forces.", "Evaluate explanations by checking predictions against evidence."),
    exercises: [],
  },
};
