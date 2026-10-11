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

function mathLevels(title: string): TopicContent["levels"] {
  return [
    {
      label: "Beginner",
      title: "Learn the language",
      explanation: `Build the core vocabulary, notation, and formulas for ${title}.`,
      takeaway: "Know what each symbol represents and what the problem is asking for.",
    },
    {
      label: "Intermediate",
      title: "Choose the method",
      explanation: "Practice selecting the right rule, theorem, or transformation for the problem.",
      takeaway: "Explain why each step is valid before moving to the next one.",
    },
    {
      label: "Advanced",
      title: "Connect the ideas",
      explanation: "Relate the method to graphs, edge cases, alternate solution paths, and real applications.",
      takeaway: "Check your answer, interpret what it means, and compare it with another strategy.",
    },
  ];
}

function mathExercise(
  id: string,
  title: string,
  difficulty: ProblemDifficulty,
  instructions: string,
  expectedAnswer: string,
  hint: string,
): LearningExercise {
  return exercise(id, title, difficulty, instructions, "", expectedAnswer, hint);
}

function mathContent(
  title: string,
  overview: string,
  analogy: string,
  exercises: LearningExercise[],
): TopicContent {
  return {
    overview,
    analogy,
    levels: mathLevels(title),
    exercises,
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
    [
      mathExercise("algebra-quadratic-factor", "Factor a quadratic", "Easy", "Factor x^2 - 7x + 12 completely, then list the zeros of the function.", "(x - 3)(x - 4); zeros: 3 and 4", "Look for two numbers that multiply to 12 and add to -7."),
      mathExercise("algebra-log-equation", "Solve a logarithmic equation", "Medium", "Solve log_2(x - 1) + log_2(x + 3) = 3. Check for extraneous solutions.", "x = 3", "Use the product rule to combine the logs before converting to exponential form."),
      mathExercise("algebra-exponential-model", "Exponential growth model", "Hard", "A value starts at 80 and grows by 12% each year. Write the model V(t), then find V(5) rounded to the nearest tenth.", "V(t) = 80(1.12)^t; V(5) = 141.0", "Growth by 12% means the multiplier is 1.12 each year."),
    ],
  ),
  precalculus: mathContent(
    "Precalculus",
    "Precalculus connects advanced functions, graphs, trigonometry, limits, and modeling before calculus.",
    "Precalculus is the bridge between symbolic algebra and motion/change.",
    [
      mathExercise("precalc-compose-functions", "Compose two functions", "Easy", "Given f(x) = 2x - 5 and g(x) = x^2 + 1, find f(g(3)) and g(f(3)).", "f(g(3)) = 15; g(f(3)) = 2", "Evaluate the inside function first, then substitute into the outside function."),
      mathExercise("precalc-inverse-function", "Find an inverse", "Medium", "Find the inverse of f(x) = (3x - 4) / 2. State f^-1(x).", "f^-1(x) = (2x + 4) / 3", "Set y = (3x - 4) / 2, swap x and y, then solve for y."),
      mathExercise("precalc-limit-table", "Estimate a limit", "Hard", "Evaluate lim as x approaches 2 of (x^2 - 4) / (x - 2). Explain the simplification.", "4", "Factor the numerator as a difference of squares, then cancel the removable factor."),
    ],
  ),
  "calculus-1": mathContent(
    "Calculus 1",
    "Calculus 1 focuses on limits, derivatives, rates of change, tangent lines, and optimization.",
    "A derivative is a speedometer for a changing quantity.",
    [
      mathExercise("calc1-power-rule", "Differentiate a polynomial", "Easy", "Find dy/dx for y = 4x^3 - 7x^2 + 5x - 9.", "dy/dx = 12x^2 - 14x + 5", "Apply the power rule term by term."),
      mathExercise("calc1-tangent-line", "Tangent line equation", "Medium", "For f(x) = x^2 - 3x + 1, find the tangent line at x = 4.", "y = 5x - 15", "Find f(4), find f'(x), then use point-slope form."),
      mathExercise("calc1-optimization", "Optimize area", "Hard", "A rectangle has perimeter 40. What dimensions maximize its area, and what is the maximum area?", "10 by 10; maximum area = 100", "Write area using one variable after using 2L + 2W = 40."),
    ],
  ),
  "calculus-2": mathContent(
    "Calculus 2",
    "Calculus 2 develops integration techniques, accumulation, sequences, and series.",
    "Integration is a way to add infinitely many tiny pieces into one whole.",
    [
      mathExercise("calc2-basic-integral", "Evaluate an indefinite integral", "Easy", "Evaluate the integral of (6x^2 - 4x + 3) dx.", "2x^3 - 2x^2 + 3x + C", "Use the reverse power rule on each term."),
      mathExercise("calc2-substitution", "Use u-substitution", "Medium", "Evaluate the integral of 2x(x^2 + 5)^4 dx.", "(x^2 + 5)^5 / 5 + C", "Let u = x^2 + 5 so du = 2x dx."),
      mathExercise("calc2-series-test", "Test a series", "Hard", "Determine whether the series sum from n=1 to infinity of 1/n^2 converges or diverges, and name the test.", "Converges by the p-series test because p = 2 > 1", "Compare it to the p-series rule for sum 1/n^p."),
    ],
  ),
  trigonometry: mathContent(
    "Trigonometry",
    "Trigonometry studies angles, cycles, unit-circle relationships, identities, and wave behavior.",
    "Trig turns rotation and repeating motion into measurable relationships.",
    [
      mathExercise("trig-unit-circle", "Use the unit circle", "Easy", "Find sin(150 degrees), cos(150 degrees), and tan(150 degrees).", "sin = 1/2; cos = -sqrt(3)/2; tan = -sqrt(3)/3", "150 degrees is in Quadrant II with reference angle 30 degrees."),
      mathExercise("trig-solve-equation", "Solve a trig equation", "Medium", "Solve 2sin(x) - 1 = 0 for 0 <= x < 2pi.", "x = pi/6, 5pi/6", "First solve sin(x) = 1/2, then use the unit circle."),
      mathExercise("trig-identity", "Verify an identity", "Hard", "Verify that (1 - cos^2(x)) / sin(x) = sin(x), stating any restrictions.", "It simplifies to sin(x), with sin(x) not equal to 0", "Use the Pythagorean identity 1 - cos^2(x) = sin^2(x)."),
    ],
  ),
  "calculus-3": mathContent(
    "Calculus 3",
    "Calculus 3 extends calculus into vectors, 3D space, multivariable functions, and partial derivatives.",
    "Instead of walking on a line, Calculus 3 explores movement across landscapes.",
    [
      mathExercise("calc3-gradient", "Find a gradient", "Easy", "For f(x, y) = x^2y + 3y^2, find the gradient vector at (2, 1).", "gradient f(2, 1) = <4, 10>", "Compute partial derivatives with respect to x and y, then substitute the point."),
      mathExercise("calc3-dot-product-angle", "Angle between vectors", "Medium", "Find the angle between a = <1, 2, 2> and b = <2, 0, 1>, rounded to the nearest degree.", "50 degrees", "Use a dot b = |a||b|cos(theta)."),
      mathExercise("calc3-directional-derivative", "Directional derivative", "Hard", "For f(x, y) = x^2 + y^2, find the directional derivative at (1, 2) in the direction of <3, 4>.", "22/5 or 4.4", "Normalize the direction vector, then dot it with the gradient at the point."),
    ],
  ),
  "discrete-math": mathContent(
    "Discrete Math",
    "Discrete Math builds foundations in logic, proofs, sets, counting, recurrence, and graphs.",
    "Discrete math is the grammar of computer science reasoning.",
    [
      mathExercise("discrete-truth-table", "Evaluate a compound statement", "Easy", "Let p be true and q be false. Evaluate (p -> q) OR (not q).", "true", "Remember p -> q is false only when p is true and q is false."),
      mathExercise("discrete-counting", "Count arrangements", "Medium", "How many 5-character strings can be made from A, B, C, D if repetition is allowed?", "4^5 = 1024", "Each position has 4 independent choices."),
      mathExercise("discrete-graph-degree", "Use the handshake lemma", "Hard", "A graph has vertex degrees 3, 3, 2, 2, 2. How many edges does it have?", "6 edges", "The sum of degrees equals twice the number of edges."),
    ],
  ),
  statistics: mathContent(
    "Statistics",
    "Statistics explains data, probability, distributions, inference, and uncertainty.",
    "Statistics is how we make careful claims when the world is noisy.",
    [
      mathExercise("stats-mean-median", "Mean and median", "Easy", "For the data set 4, 7, 7, 10, 12, find the mean and median.", "mean = 8; median = 7", "Mean is the sum divided by count; median is the middle value."),
      mathExercise("stats-probability", "Conditional probability", "Medium", "A bag has 5 red marbles and 3 blue marbles. Two marbles are drawn without replacement. What is the probability both are red?", "5/14", "Multiply P(red first) by P(red second given red first)."),
      mathExercise("stats-z-score", "Compute a z-score", "Hard", "A test has mean 72 and standard deviation 8. A student scores 88. Find the z-score and interpret it.", "z = 2; the score is 2 standard deviations above the mean", "Use z = (x - mean) / standard deviation."),
    ],
  ),
  science: {
    overview: "Science uses observation and evidence to explain patterns in the natural world. Strong explanations connect what happens to the mechanisms that cause it.",
    analogy: "A scientific explanation is a detective story: observations are clues, and evidence supports the best explanation.",
    levels: levels("Describe observations and identify the scientific question.", "Connect evidence to models such as matter, energy, and forces.", "Evaluate explanations by checking predictions against evidence."),
    exercises: [],
  },
};
