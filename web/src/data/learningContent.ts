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
  examples: [string, string][],
): TopicContent["levels"] {
  return [
    { label: "Beginner", title: "Build the mental model", explanation: basics, examples: examples[0], takeaway: "Know what the structure stores and when to reach for it." },
    { label: "Intermediate", title: "Recognize the pattern", explanation: mechanics, examples: examples[1], takeaway: "Translate a problem statement into the right operations." },
    { label: "Advanced", title: "Reason about tradeoffs", explanation: advanced, examples: examples[2], takeaway: "Explain complexity, edge cases, and alternative designs." },
  ];
}

function mathLevels(
  title: string,
  explanations: [string, string, string],
  examples: [string, string][],
): TopicContent["levels"] {
  return [
    {
      label: "Beginner",
      title: "Learn the language",
      explanation: explanations[0],
      examples: examples[0],
      takeaway: "Know what each symbol represents and what the problem is asking for.",
    },
    {
      label: "Intermediate",
      title: "Choose the method",
      explanation: explanations[1],
      examples: examples[1],
      takeaway: "Explain why each step is valid before moving to the next one.",
    },
    {
      label: "Advanced",
      title: "Connect the ideas",
      explanation: explanations[2],
      examples: examples[2],
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
  explanations: [string, string, string],
  examples: [string, string][],
  exercises: LearningExercise[],
): TopicContent {
  return {
    overview,
    analogy,
    levels: mathLevels(title, explanations, examples),
    exercises,
  };
}

function scienceContent(
  id: string,
  title: string,
  overview: string,
  analogy: string,
  explanations: [string, string, string],
  examples: [[string, string], [string, string], [string, string]],
  exercisePrompt: string,
  exerciseHint: string,
): TopicContent {
  return {
    overview,
    analogy,
    levels: [
      {
        label: "Beginner",
        title: "Learn the foundations",
        explanation: explanations[0],
        examples: examples[0],
        takeaway: "Describe the key parts and use the correct scientific vocabulary.",
      },
      {
        label: "Intermediate",
        title: "Connect evidence and ideas",
        explanation: explanations[1],
        examples: examples[1],
        takeaway: "Use evidence and a scientific model to explain what is happening.",
      },
      {
        label: "Advanced",
        title: "Apply and evaluate",
        explanation: explanations[2],
        examples: examples[2],
        takeaway: "Make a testable prediction and evaluate how well evidence supports it.",
      },
    ],
    exercises: [
      exercise(
        `${id}-explain`,
        `${title} explanation check`,
        "Medium",
        exercisePrompt,
        "Write your explanation in the answer box.",
        "A clear explanation supported by relevant evidence.",
        exerciseHint,
      ),
    ],
  };
}

export const learningContent: Record<string, TopicContent> = {
  arrays: {
    overview: "Arrays keep values in an ordered sequence. Hash maps pair unique keys with values for fast lookup. Together they solve a huge range of counting, lookup, and grouping problems.",
    analogy: "An array is a numbered row of lockers; a hash map is a labeled index telling you which locker to open.",
    levels: levels(
      "An array keeps items in order, so each item can be reached by its position. A hash map stores key-value pairs so you can look up information by a meaningful key.",
      "Use a map to remember useful information while scanning an array once. This often replaces a nested search with a fast lookup.",
      "Choose between extra memory and fewer passes. Account for duplicate values, missing keys, hash collisions, and whether changing the original array is allowed.",
      [
        ["Read the value at index 1 in [4, 9, 12].", "Store a student's name as a key and their score as its value."],
        ["Count how many times each word appears in a sentence.", "Find two numbers that add to a target by remembering values already seen."],
        ["Compare a one-pass hash-map solution with a nested-loop solution for Two Sum.", "Remove duplicates in place when changing the input is allowed, or build a new array when it is not."],
      ],
    ),
    exercises: [
      exercise("array-sum", "Sum an array", "Easy", "Complete sum so it returns the total. The final log must print 10.", "function sum(values) {\n  // Your code here\n}\n\nconsole.log(sum([1, 2, 3, 4]));", "10", "Start with a total of zero and visit every value."),
      exercise("array-frequency", "Build a frequency map", "Medium", "Count each fruit and print the number of apples.", "function frequencies(items) {\n  // Return an object of counts\n}\n\nconst counts = frequencies(['apple', 'pear', 'apple']);\nconsole.log(counts.apple);", "2", "Use the item as an object key and default missing counts to zero."),
      exercise("array-two-sum", "Two sum", "Hard", "Return the two indices whose values total 9, formatted as JSON.", "function twoSum(values, target) {\n  // Solve in one pass\n}\n\nconsole.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));", "[0,1]", "Store each value's index, then look for target - value."),
    ],
  },
  stacks: {
    overview: "A stack stores items in last-in, first-out order. The newest item is always the first one removed, which makes stacks ideal for nested work and undo history.",
    analogy: "Think of a stack of plates: you add and remove from the top.",
    levels: levels(
      "A stack is last-in, first-out: the newest item is the first one removed. Its basic operations are push (add), pop (remove), and peek (inspect the top).",
      "Stacks are useful whenever the latest unfinished item must be handled first, including nested brackets, undo history, and depth-first search.",
      "A monotonic stack keeps values in sorted order as items arrive. Remove entries that can no longer be answers, and track indices when distance or position matters.",
      [
        ["Push three books, then pop to get the top book first.", "Peek at the latest browser-history entry without removing it."],
        ["Check whether ([{}]) has correctly matched brackets.", "Use a stack to visit each branch of a tree before returning to earlier branches."],
        ["For each day's temperature, find how many days until a warmer one.", "Find the next greater value for every item in an array in linear time."],
      ],
    ),
    exercises: [
      exercise("stack-reverse", "Reverse with a stack", "Easy", "Use stack operations to reverse the word and print 'codex'.", "function reverse(text) {\n  const stack = text.split('');\n  // Use the stack to build the result\n}\n\nconsole.log(reverse('xedoc'));", "codex", "Repeatedly pop until the stack is empty."),
      exercise("stack-balanced", "Balanced parentheses", "Medium", "Return true only when every opening bracket is properly closed.", "function isBalanced(text) {\n  // Your code here\n}\n\nconsole.log(isBalanced('(()())'));", "true", "Push openers; each closer must have an opener to pop."),
      exercise("stack-next", "Next greater value", "Hard", "Print the next greater value for each item, or -1.", "function nextGreater(values) {\n  // Try a stack of unresolved indices\n}\n\nconsole.log(JSON.stringify(nextGreater([2, 1, 3])));", "[3,3,-1]", "When a larger value arrives, resolve smaller indices from the stack."),
    ],
  },
  queues: {
    overview: "A queue stores items in first-in, first-out order. Work enters at the back and leaves from the front, preserving arrival order.",
    analogy: "Like a checkout line: the first person to join is the first person served.",
    levels: levels(
      "A queue is first-in, first-out: the earliest item added is served first. Enqueue adds to the back, and dequeue removes from the front.",
      "Queues preserve arrival order, making them useful for service lines, task scheduling, and breadth-first traversal through nearby nodes first.",
      "Use a deque when work must be added or removed at both ends, or a priority queue when urgency matters more than arrival time. Avoid costly front-removal operations on large arrays.",
      [
        ["Enqueue three support tickets and serve the oldest ticket first.", "Check whether a queue is empty before trying to serve the next job."],
        ["Process print jobs in the order they were submitted.", "Visit every node one edge farther from the start using breadth-first search."],
        ["Keep the latest five events in a deque by removing old events from the front.", "Use a priority queue to process the most urgent support ticket first."],
      ],
    ),
    exercises: [
      exercise("queue-basic", "Serve the first item", "Easy", "Add three jobs, remove the first, and print it.", "const queue = [];\nqueue.push('email');\nqueue.push('report');\nqueue.push('backup');\n\n// Remove and print the first job\n", "email", "Array shift removes the front item."),
      exercise("queue-recent", "Recent requests", "Medium", "Keep only the last three requests and print them as JSON.", "function recent(requests, limit) {\n  const queue = [];\n  // Add each request and trim the front\n}\n\nconsole.log(JSON.stringify(recent(['a', 'b', 'c', 'd'], 3)));", "[\"b\",\"c\",\"d\"]", "After enqueueing, dequeue while the queue is too large."),
      exercise("queue-bfs", "Breadth-first traversal", "Hard", "Traverse this tree level by level and print the values as JSON.", "function bfs(root) {\n  // Use a queue beginning with root\n}\n\nconst tree = { value: 1, children: [\n  { value: 2, children: [{ value: 4, children: [] }] },\n  { value: 3, children: [] }\n]};\nconsole.log(JSON.stringify(bfs(tree)));", "[1,2,3,4]", "Dequeue one node, record it, then enqueue all of its children."),
    ],
  },
  "sliding-window": {
    overview: "A sliding window tracks one contiguous section of a sequence and updates it as the boundaries move, avoiding repeated work.",
    analogy: "Move a picture frame across a long photo and study only what is inside the frame.",
    levels: levels(
      "A sliding window represents a contiguous part of an array or string. For a fixed-size window, move both boundaries together and update the value instead of recalculating everything.",
      "For a variable-size window, expand it to include new items and move the left edge when a condition is broken. Keep only the state needed to test the current window.",
      "Show that each item enters and leaves the window at most once. Handle empty inputs, repeated values, and conditions that do not become valid until the window shrinks.",
      [
        ["Add the first three numbers in [2, 4, 6, 8] to get a window sum of 12.", "Find the average score across every group of four consecutive scores."],
        ["Find the shortest substring containing all required characters.", "Find the longest run of items whose sum stays below a given limit."],
        ["Find the maximum sum of any k consecutive values in one pass.", "Find the longest substring with no repeated characters using a moving boundary and last-seen indices."],
      ],
    ),
    exercises: [
      exercise("window-first", "First window sum", "Easy", "Print the sum of the first three values.", "const values = [2, 4, 6, 8];\nconst size = 3;\n// Calculate the first window\n", "12", "Slice the first size values and add them."),
      exercise("window-max", "Maximum window sum", "Medium", "Find the largest sum among windows of size three.", "function maxWindowSum(values, size) {\n  // Reuse the previous window sum\n}\n\nconsole.log(maxWindowSum([2, 1, 5, 1, 3, 2], 3));", "9", "Subtract the item leaving and add the item entering."),
      exercise("window-unique", "Longest unique substring", "Hard", "Print the length of the longest substring without repeated characters.", "function longestUnique(text) {\n  // Track each character's latest index\n}\n\nconsole.log(longestUnique('abcabcbb'));", "3", "Move the left edge beyond a repeated character's previous position."),
    ],
  },
  trees: {
    overview: "Trees model parent-child relationships; graphs generalize connections between any nodes. Traversal lets you systematically visit their structure.",
    analogy: "A family tree branches from ancestors; a transit map is a graph of stations and routes.",
    levels: levels(
      "A tree connects parent nodes to child nodes without cycles; a graph can connect nodes in many directions. Learn to identify roots, leaves, edges, and neighbors.",
      "Depth-first search follows a path deeply using recursion or a stack. Breadth-first search uses a queue to visit the closest nodes first. A visited set prevents repeated work.",
      "Choose algorithms based on graph shape and the question: shortest unweighted path, connectivity, cycles, or dependency order. Consider disconnected components and the cost of visiting every node.",
      [
        ["Identify the root and leaf nodes in a family tree.", "Represent city connections as graph nodes and roads as edges."],
        ["Use depth-first search to check whether a folder contains a file.", "Use breadth-first search to find the fewest flights in an unweighted route map."],
        ["Use a visited set to avoid looping forever in a cyclic graph.", "Use topological ordering to schedule courses after their prerequisites."],
      ],
    ),
    exercises: [
      exercise("tree-leaves", "Count leaves", "Easy", "Count nodes with no children.", "function countLeaves(node) {\n  // Base case: no children\n}\n\nconst tree = { children: [{ children: [] }, { children: [{ children: [] }] }] };\nconsole.log(countLeaves(tree));", "2", "A leaf contributes one; otherwise sum the child results."),
      exercise("tree-dfs", "Depth-first search", "Medium", "Return true when the target exists in the tree.", "function contains(node, target) {\n  // Search recursively or with a stack\n}\n\nconst tree = { value: 1, children: [{ value: 2, children: [] }] };\nconsole.log(contains(tree, 2));", "true", "Check the current node, then search its children."),
      exercise("graph-path", "Graph reachability", "Hard", "Determine whether d can be reached from a.", "function hasPath(graph, start, target) {\n  // Remember visited nodes\n}\n\nconst graph = { a: ['b'], b: ['c'], c: ['d'], d: [] };\nconsole.log(hasPath(graph, 'a', 'd'));", "true", "Traverse neighbors and use a Set to avoid revisiting nodes."),
    ],
  },
  "dynamic-programming": {
    overview: "Dynamic programming solves overlapping subproblems once and reuses their answers, trading memory for speed.",
    analogy: "Keep your completed puzzle pieces instead of rebuilding each one every time it is needed.",
    levels: levels(
      "Dynamic programming saves answers to smaller problems so the same work is not repeated. Start by noticing when a recursive solution solves identical subproblems many times.",
      "Define what each state means, write how a state depends on smaller states, set base cases, and choose a safe order to compute the answers.",
      "Prove that the state captures all information needed for future choices. Reduce memory when older states are no longer needed, and distinguish overlapping subproblems from greedy choices.",
      [
        ["Cache Fibonacci results so fib(5) does not recompute fib(3) repeatedly.", "Count ways to climb a staircase using one- or two-step moves."],
        ["Build a table for the fewest coins needed to make each amount.", "Use a grid of states to find the number of paths from the top-left to the bottom-right."],
        ["Keep only the previous two values when computing Fibonacci iteratively.", "Use a knapsack table to maximize value under a weight limit, then explain why each state is sufficient."],
      ],
    ),
    exercises: [
      exercise("dp-step", "Ways to climb", "Easy", "Print the number of ways to climb four steps using moves of one or two.", "function climbWays(steps) {\n  // Build from the first two base cases\n}\n\nconsole.log(climbWays(4));", "5", "Ways(n) equals ways(n - 1) plus ways(n - 2)."),
      exercise("dp-fib", "Memoized Fibonacci", "Medium", "Implement memoized Fibonacci and print fib(10).", "function fib(n, memo = {}) {\n  // Cache computed values\n}\n\nconsole.log(fib(10));", "55", "Return n for n below 2; otherwise cache the recursive sum."),
      exercise("dp-coins", "Minimum coins", "Hard", "Find the fewest coins needed to make amount 6.", "function minCoins(coins, amount) {\n  // dp[x] is the best answer for amount x\n}\n\nconsole.log(minCoins([1, 3, 4], 6));", "2", "Initialize unreachable amounts to Infinity and build upward."),
    ],
  },
  "system-design": {
    overview: "System design turns product requirements into cooperating services, APIs, data stores, caches, and queues that remain reliable as usage grows.",
    analogy: "Designing a city means planning roads, utilities, capacity, and failure recovery before adding buildings.",
    levels: levels(
      "Begin with who uses the product and what they need to do. Separate essential behaviors from qualities such as speed, reliability, privacy, and availability.",
      "Turn requirements into a request flow, API, and data model. Decide where persistent storage, caching, queues, and service boundaries help.",
      "Evaluate bottlenecks and failure modes as traffic grows. Compare consistency, availability, operational complexity, and cost instead of assuming one architecture is always best.",
      [
        ["For a photo-sharing app, list the actions a viewer and creator need.", "Estimate daily active users and how many photos each user uploads."],
        ["Design an endpoint to upload and retrieve a photo with metadata.", "Use object storage for image files and a database for captions and ownership."],
        ["Add a queue so image resizing can continue after a worker fails.", "Compare a cache's faster reads against stale data and extra operating cost."],
      ],
    ),
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
      "An equation says two expressions have the same value, and a variable such as x stands for an unknown number. Solve by doing the same operation to both sides; this keeps the equality true. Expressions can also be rewritten in equivalent forms, such as factoring a polynomial into simpler pieces.",
      "Choose a tool based on the form of the problem: factoring can reveal when a product equals zero, while exponent rules simplify repeated multiplication. Exponential functions model repeated percent change, and logarithms help solve for an unknown exponent.",
      "Connect an equation to its graph and check whether the answer makes sense in context. A quadratic may have two, one, or no real roots; exponential growth and decay behave differently over time. Compare methods for accuracy and identify values that are not allowed, such as a logarithm input of zero or less.",
    ],
    [
      ["Solve 2x + 3 = 11 by undoing the operations to find x = 4.", "Read 3² as 3 × 3, not 3 × 2."],
      ["Factor x² - 5x + 6 into (x - 2)(x - 3).", "Model a savings balance that grows by 4% each year with an exponential function."],
      ["Use logarithms to find how long it takes an investment to reach a target.", "Compare a quadratic model's roots with the x-intercepts on its graph."],
    ],
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
      "A function is a rule that assigns one output to each allowed input. Learn how to read function notation, identify the domain (allowed inputs), and see how a graph shows the function's behavior. Trigonometric functions such as sine and cosine describe repeating patterns.",
      "Combine functions by substituting one rule into another, and use transformations to shift or stretch a graph. The unit circle connects angles to sine and cosine values. These tools help translate between equations, graphs, and real situations.",
      "Use functions to model changing quantities, such as circular motion or seasonal patterns. Compare a model's predictions with the situation, pay attention to its domain and units, and use limits to describe what a function approaches near a point.",
    ],
    [
      ["Evaluate f(2) for f(x) = x² + 1.", "Read the period and amplitude from a basic sine graph."],
      ["Combine f(x) = 2x and g(x) = x + 3 to find f(g(x)).", "Use a unit-circle angle to determine an exact sine or cosine value."],
      ["Model a Ferris wheel seat's height over time with a sinusoidal function.", "Explore a function's behavior near a value to anticipate its limit."],
    ],
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
      "A limit describes the value a function gets close to as its input approaches a particular number. The derivative is the function's instantaneous rate of change, or the slope of the graph at one point. It extends the familiar idea of slope between two points to a single point.",
      "Use derivative rules to calculate rates of change: the power rule handles powers of x, and the chain rule handles one function inside another. The sign and size of a derivative tell you whether a quantity is increasing, decreasing, or changing quickly.",
      "Apply derivatives to locate high and low points, understand motion, and optimize a quantity. Check endpoints and points where the derivative is zero or undefined, then explain what the result means in the original context rather than reporting a number alone.",
    ],
    [
      ["Estimate a limit by checking function values close to x = 2.", "Find the slope of the line through (1, 3) and (4, 9)."],
      ["Differentiate x³ to find the rate of change 3x².", "Use the chain rule to differentiate (2x + 1)²."],
      ["Find the dimensions of a rectangle with maximum area for a fixed perimeter.", "Use a derivative to determine when a moving object's velocity changes direction."],
    ],
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
      "An integral can measure accumulated change, such as the area under a curve. A sequence is an ordered list of numbers, and a series is what you get when you add the terms of a sequence. Learn how notation describes the quantity being accumulated or summed.",
      "Choose an integration technique by looking for structure: substitution reverses the chain rule, while integration by parts is useful for products. For sequences and series, test whether terms approach zero and whether the total sum settles toward a finite value.",
      "Improper integrals and infinite series require checking behavior as a boundary grows without limit. Use convergence tests carefully—the test's conditions matter—and interpret whether the total is finite. When finding accumulated area, account for the interval and whether the function crosses the axis.",
    ],
    [
      ["Interpret the area under y = 2 from x = 0 to x = 3 as 6.", "Continue the sequence 2, 5, 8, 11 by identifying its common difference."],
      ["Use substitution to evaluate an integral containing 2x(x² + 1)⁴.", "Use integration by parts to handle an integral containing x·eˣ."],
      ["Test whether the infinite geometric series 1 + 1/2 + 1/4 + ... converges.", "Choose a comparison test to decide whether an improper integral is finite."],
    ],
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
      "Angles measure rotation, and the unit circle links each angle to coordinates: cosine is the horizontal coordinate and sine is the vertical coordinate. In a right triangle, the same relationships appear as ratios between side lengths.",
      "Use identities to rewrite expressions without changing their value, and use graphs to understand repeating behavior. Amplitude describes a wave's height from its middle line, while period describes how long one full cycle takes.",
      "Solve trigonometric equations by finding every angle that works in the requested interval; repeating cycles can create multiple answers. Use sine and cosine models for real periodic motion, and check that the chosen amplitude, period, and phase match the situation.",
    ],
    [
      ["Use the unit circle to find sin(π/6) = 1/2.", "Use sine as opposite over hypotenuse in a right triangle."],
      ["Simplify sin²(x) + cos²(x) using the Pythagorean identity.", "Sketch y = 2 sin(x) and identify its amplitude and period."],
      ["Solve 2 sin(x) = 1 across one full rotation.", "Model the height of a tide as a repeating sinusoidal function."],
    ],
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
      "Calculus 3 works with points and vectors in two or three dimensions. A multivariable function takes several inputs, like a landscape whose height depends on both x and y. A partial derivative measures change in one direction while holding the other inputs fixed.",
      "Use gradients to find the direction of steepest increase, and use multiple integrals to add quantities over a region or volume. Vector fields assign a direction and size to every point, which can represent flow, force, or motion.",
      "Choose coordinates and bounds that match the shape of the region, then interpret what the result measures. Connect line, surface, and volume integrals to the physical quantity involved, and check orientation, units, and boundary conditions.",
    ],
    [
      ["Add vectors ⟨1, 2⟩ and ⟨3, -1⟩ component by component.", "Locate the point (2, -1, 4) in three-dimensional coordinates."],
      ["Find the partial derivative of x²y with respect to x.", "Use a gradient to identify the direction a landscape rises most quickly."],
      ["Set up a double integral to find the volume beneath a surface.", "Use a vector field to describe fluid flowing through a region."],
    ],
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
        "Discrete math studies separate, countable objects rather than continuously changing quantities. Logic gives precise ways to combine true-or-false statements, while sets collect objects and describe relationships between collections.",
        "Build a proof by starting from definitions and using valid steps to reach a conclusion. Counting rules help find how many outcomes are possible, and recurrence relations describe a sequence using earlier terms.",
        "Use induction to prove a claim for every natural number, and use graphs to model connections. Carefully state assumptions, check small cases for mistakes, and distinguish evidence for a claim from a proof that it is always true.",
      ],
    [
      ["Make a truth table for the statement p AND NOT q.", "Find the union of {1, 2} and {2, 3}."],
      ["Use induction to prove that 1 + 2 + ... + n = n(n + 1)/2.", "Count the two-character codes that can be formed from four symbols."],
      ["Solve a recurrence by relating each term to earlier terms.", "Use graph coloring to assign exam times without conflicts."],
    ],
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
      "Statistics describes data and helps reason about uncertainty. The mean is an average that uses every value; the median is the middle after sorting. Probability measures how likely an outcome is, from impossible to certain.",
      "A sample is a smaller group used to learn about a larger population. Distributions show how data values vary, and confidence intervals give a range of plausible values for a population quantity. Larger, representative samples usually provide more reliable estimates.",
      "Use statistical tests and models to judge whether a pattern is meaningful, while remembering that association alone does not prove cause. Check sample selection, variability, assumptions, and possible confounding factors before drawing a conclusion.",
    ],
    [
      ["Find the median of 2, 4, 7, 9, 100 and notice how it resists the outlier.", "Compute the chance of rolling an even number on a fair six-sided die."],
      ["Use a confidence interval to estimate an average from a sample.", "Compare two groups while accounting for sample size and variability."],
      ["Use a normal model to estimate how unusual a measurement is.", "Check whether an observed relationship could be explained by chance or confounding."],
    ],
    [
      mathExercise("stats-mean-median", "Mean and median", "Easy", "For the data set 4, 7, 7, 10, 12, find the mean and median.", "mean = 8; median = 7", "Mean is the sum divided by count; median is the middle value."),
      mathExercise("stats-probability", "Conditional probability", "Medium", "A bag has 5 red marbles and 3 blue marbles. Two marbles are drawn without replacement. What is the probability both are red?", "5/14", "Multiply P(red first) by P(red second given red first)."),
      mathExercise("stats-z-score", "Compute a z-score", "Hard", "A test has mean 72 and standard deviation 8. A student scores 88. Find the z-score and interpret it.", "z = 2; the score is 2 standard deviations above the mean", "Use z = (x - mean) / standard deviation."),
    ],
  ),
  biology: scienceContent(
    "biology",
    "Biology",
    "Biology studies living things and how they work, from molecules and cells to organisms, populations, and ecosystems. It connects structure and function with heredity, evolution, and the flow of energy through life.",
    "An ecosystem is like a neighborhood: each organism has needs, plays a role, and affects the other residents.",
    [
      "Living things are made of cells, the smallest units that can carry out the processes of life. Some organisms have one cell; others, like people and trees, have many specialized cells. Learn how cell parts have different jobs and how groups of cells form tissues, organs, and whole organisms.",
      "A trait is a feature of an organism. DNA contains instructions that help build and operate an organism, and genes are sections of DNA related to traits. Organisms also need energy and materials: for example, plants capture light to make sugars, while animals get energy by eating food.",
      "Populations contain individuals with inherited differences. If a difference helps some individuals survive and reproduce in a particular environment, that trait may become more common over many generations; this is natural selection. To evaluate a claim, look at evidence across organisms and generations, and consider how the environment and other species affect the outcome.",
    ],
    [
      ["Identify the nucleus as a cell structure that contains most of a cell's DNA.", "Explain why a leaf's broad surface helps it capture light for photosynthesis."],
      ["Trace how information in DNA can be used to make a protein.", "Predict how a change in one food-web population could affect its predators and prey."],
      ["Use inherited variation and differences in survival to explain a population change over generations.", "Compare two ecosystem explanations using evidence about organisms, resources, and environmental conditions."],
    ],
    "A population of insects includes light and dark color variations. Explain how a change in the environment could affect the frequency of each variation over generations. Use evidence and natural-selection ideas in your response.",
    "Describe the environmental pressure, how color variation affects survival or reproduction, and how that can change trait frequency across generations.",
  ),
  chemistry: scienceContent(
    "chemistry",
    "Chemistry",
    "Chemistry explains what matter is made of, how its particles are arranged, and how substances change during reactions. It connects atomic structure and bonding to observable properties, energy, and conservation.",
    "Atoms are building pieces; chemical reactions rearrange those pieces into new combinations without making the atoms disappear.",
    [
      "All matter is made from particles. An atom has a nucleus containing protons and usually neutrons, with electrons around it; the number of protons identifies the element. An element contains one kind of atom, a compound has different elements chemically joined, and a mixture contains substances together without joining them chemically.",
      "Atoms can bond by sharing or transferring electrons, forming molecules or ionic compounds. During a chemical reaction, atoms are rearranged into new substances rather than created or destroyed, so a balanced equation has the same number of each kind of atom on both sides. The periodic table helps predict patterns in how elements behave.",
      "Reactions involve energy: some release heat to their surroundings, while others absorb it. Temperature, concentration, and surface area can affect how often particles collide and how quickly a reaction happens. Use measurements and particle models together, and check conservation of matter when evaluating an explanation.",
    ],
    [
      ["Classify pure water as a compound made from hydrogen and oxygen.", "Explain why melting ice changes its state but does not create a new substance."],
      ["Balance H₂ + O₂ → H₂O as 2H₂ + O₂ → 2H₂O.", "Use valence electrons to explain why sodium and chlorine can form an ionic compound."],
      ["Use particle collisions to explain why higher temperature can increase reaction rate.", "Compare reactant and product masses to check whether a reaction follows conservation of matter."],
    ],
    "When vinegar and baking soda react, bubbles form and the container may feel cooler. Explain what the observations suggest about gas production and energy transfer, and describe one measurement that could help test your explanation.",
    "Separate the observations from your explanation. Identify the bubbles as evidence of gas formation and suggest a measurable before-and-after comparison.",
  ),
  physics: scienceContent(
    "physics",
    "Physics",
    "Physics uses models and measurements to describe motion, forces, energy, waves, electricity, and matter. It looks for rules that connect quantities and predict how a system will behave.",
    "A physics model is like a map: it simplifies the details while keeping the features needed to predict what happens.",
    [
      "Physics describes how objects and energy behave using observations and measurements. Position tells where something is, speed describes how quickly its position changes, and velocity includes direction. A force is a push or pull that can change an object's motion; measurements need units so results can be compared.",
      "Forces explain changes in motion: for the same object, a stronger net force causes greater acceleration, while a heavier object needs more force for the same acceleration. Energy is a quantity that can move between objects or change form, such as stored gravitational energy becoming motion as a ball falls. Diagrams, graphs, and equations help make these relationships visible.",
      "A model is a simplified description used to make a prediction. State what it assumes—for example, whether air resistance is ignored—then compare its prediction with measurements. If results differ, consider measurement uncertainty, friction, or other forces the model left out, and revise the explanation.",
    ],
    [
      ["Calculate average speed when a cyclist travels 12 meters in 3 seconds.", "Draw arrows to compare the size and direction of forces acting on a resting book."],
      ["Predict how acceleration changes if the same force acts on twice the mass.", "Trace energy changes as a ball falls and speeds up."],
      ["Use position-time data to compare constant speed with acceleration.", "Explain how friction changes a prediction made by an ideal no-friction model."],
    ],
    "A cart rolls down a ramp and travels farther when the ramp is made steeper. Describe a force-and-motion explanation for this observation, name one variable to measure, and suggest how to make the comparison fair.",
    "Connect the ramp to the cart's motion, propose a measurable quantity such as travel time or distance, and keep the cart and surface conditions consistent.",
  ),
};
