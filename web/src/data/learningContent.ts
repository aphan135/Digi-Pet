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

type SupplementalQuestion = [
  title: string,
  difficulty: ProblemDifficulty,
  instructions: string,
  expectedOutput: string,
  hint: string,
];

const supplementalPractice: Record<string, SupplementalQuestion[]> = {
  arrays: [
    ["Find the first item", "Easy", "Return the first value in [8, 3, 5] and print it.", "8", "Array indexes start at zero, so the first value is at index 0."],
    ["Double each value", "Easy", "Transform [2, 4, 6] into a new array with every value doubled, then print it as JSON.", "[4,8,12]", "Map each value to value * 2."],
    ["Range sum queries", "Medium", "For values [2, 4, 1, 5], answer the sum from index 1 through index 3 in constant time after preprocessing.", "10", "Build prefix sums so a range sum is one prefix difference."],
    ["Group values by key", "Medium", "Group [{name:'Mia', team:'red'}, {name:'Leo', team:'blue'}, {name:'Ava', team:'red'}] by team and print each team's names as JSON.", "{\"red\":[\"Mia\",\"Ava\"],\"blue\":[\"Leo\"]}", "Use a hash map whose keys are team names and whose values are arrays."],
    ["Longest consecutive run", "Hard", "Find the length of the longest consecutive integer sequence in [100, 4, 200, 1, 3, 2] using expected O(n) time.", "4", "Put values in a Set and only grow a sequence from a value with no predecessor."],
  ],
  stacks: [
    ["Inspect the top", "Easy", "Push 'red', then 'blue' onto a stack. Print the top item without removing it.", "blue", "Peek at the last array element."],
    ["Undo the latest action", "Easy", "Push 'type', 'bold', and 'save', then undo once and print the new top action.", "bold", "Undo removes only the most recent item."],
    ["Check mixed brackets", "Medium", "Return whether the string '{[()]}' is balanced, respecting bracket types.", "true", "When a closer appears, it must match the most recently pushed opener."],
    ["Simplify a file path", "Medium", "Normalize '/home//sam/./docs/../notes' and print the absolute path.", "/home/sam/notes", "Ignore empty and '.' parts; '..' removes the previous directory."],
    ["Largest rectangle in bars", "Hard", "Find the largest rectangle area in histogram heights [2, 1, 5, 6, 2, 3] using a monotonic stack.", "10", "For each bar, determine the nearest shorter bar on both sides."],
  ],
  queues: [
    ["Serve two customers", "Easy", "Enqueue 'Ari', 'Bo', and 'Cal'. Dequeue twice and print the names in order as JSON.", "[\"Ari\",\"Bo\"]", "A queue serves items in the order they were added."],
    ["Process jobs", "Easy", "Start with an empty queue, add 'print' and 'email', then print the next job without removing it.", "print", "The front of the queue is the next item to serve."],
    ["Round-robin turns", "Medium", "Give jobs A and B one unit of work per turn until their remaining work [2, 1] is finished. Print the run order.", "[\"A\",\"B\",\"A\"]", "Re-enqueue a job after a turn only if it still has work."],
    ["Shortest unweighted route", "Medium", "Use breadth-first search to find the fewest edges from A to D in A-B, A-C, B-D, C-D.", "2 edges", "A FIFO queue explores all nodes one step away before nodes two steps away."],
    ["Rotting oranges", "Hard", "In a grid, each minute rotten oranges infect adjacent fresh ones. Describe an algorithm that returns the minutes needed, or -1 if some cannot be reached.", "Multi-source BFS from every initially rotten orange; return the greatest infection minute, or -1 if any fresh orange remains.", "Start the queue with all rotten cells and process them level by level."],
  ],
  "sliding-window": [
    ["Average of a window", "Easy", "Find the average of the first two values in [3, 7, 2].", "5", "Add the window values and divide by the window size."],
    ["Count matching window", "Easy", "How many length-2 windows in [1, 1, 2, 1] contain a sum of 2?", "2", "Check the windows [1,1], [1,2], and [2,1]."],
    ["Minimum length at least target", "Medium", "Find the shortest contiguous subarray with sum at least 7 in [2, 3, 1, 2, 4, 3].", "2", "Expand the right edge until the sum reaches 7, then shrink from the left."],
    ["Longest two-character substring", "Medium", "Find the longest substring containing at most two distinct characters in 'ccaabbb'.", "5", "Track character counts and shrink while more than two remain."],
    ["Minimum covering substring", "Hard", "Find the shortest substring of 'ADOBECODEBANC' containing A, B, and C.", "BANC", "Maintain required character counts and record the smallest valid window."],
  ],
  trees: [
    ["Count child nodes", "Easy", "A root has three direct children. How many edges connect the root to those children?", "3", "Each child has one connecting edge from its parent."],
    ["Find the tree height", "Easy", "A tree's longest root-to-leaf path has 3 edges. What is its height measured in edges?", "3", "Height is the number of edges on the longest downward path."],
    ["Level-order traversal", "Medium", "Return the breadth-first order for root 1 with children 2 and 3, where 2 has child 4.", "[1,2,3,4]", "Use a queue and add each node's children after visiting it."],
    ["Detect a graph cycle", "Medium", "Describe how to detect a cycle in a directed graph using depth-first search.", "Track unvisited, active, and completed nodes; an edge to an active node identifies a cycle.", "A node on the current recursion path is active."],
    ["Course ordering", "Hard", "Find a valid order for courses 0, 1, 2 where 1 depends on 0 and 2 depends on 1; report whether a cycle exists.", "A valid order is [0,1,2]; no cycle exists.", "Use topological sorting and count incoming prerequisite edges."],
  ],
  "dynamic-programming": [
    ["Base cases", "Easy", "If ways(0)=1 and ways(1)=1 and ways(n)=ways(n-1)+ways(n-2), find ways(2).", "2", "Apply the recurrence using the two given base cases."],
    ["Reuse a subproblem", "Easy", "For Fibonacci with F(0)=0 and F(1)=1, find F(4).", "3", "Compute each value once: F(2)=1, F(3)=2, F(4)=3."],
    ["Grid path count", "Medium", "Count paths through a 2-by-3 grid when moving only right or down from the top-left to the bottom-right.", "3", "Each cell's path count is the sum from the cell above and the cell to its left."],
    ["Minimum climbing cost", "Medium", "Find the minimum cost to reach the top for costs [10, 15, 20], where each move climbs one or two steps.", "15", "For each step, take its cost plus the smaller of the previous one- or two-step totals."],
    ["Longest increasing subsequence", "Hard", "Find the length of the longest strictly increasing subsequence in [10, 9, 2, 5, 3, 7, 101, 18].", "4", "Define a state for the best subsequence ending at each value, or maintain minimal tails."],
  ],
  "system-design": [
    ["List core requirements", "Easy", "For a URL shortener, name two essential user actions and one reliability requirement.", "Create a short link, redirect a short link, and keep redirects available and reliable.", "Separate what users do from qualities the service must maintain."],
    ["Estimate request volume", "Easy", "A service has 10,000 users, each making 20 requests per day. Estimate its average requests per second over a day.", "About 2.3 requests per second (200,000 / 86,400).", "Multiply users by daily requests, then divide by seconds per day."],
    ["Choose storage", "Medium", "For a photo-sharing service, choose where to store original image bytes and where to store captions and ownership.", "Store image bytes in object storage and captions/ownership in a database with a reference to each image.", "Use storage suited to large binary objects and queryable structured records."],
    ["Design an API", "Medium", "Propose an endpoint to create a short URL and name two fields in its request and response.", "For example POST /links with targetUrl; respond with shortCode and shortUrl.", "State the method, resource, input, and useful response."],
    ["Handle a failing worker", "Hard", "Image resizing workers can fail after accepting a job. Describe how to avoid losing work and prevent duplicate processing.", "Persist jobs in a durable queue, retry with backoff, and make processing idempotent using a job/image version key.", "Consider durable delivery, retries, and safe repeated execution."],
  ],
  "algebra-2": [
    ["Solve a linear equation", "Easy", "Solve 3x - 5 = 16 and show the inverse operations.", "x = 7", "Add 5 to both sides, then divide both sides by 3."],
    ["Evaluate an exponent", "Easy", "Evaluate 2^3 * 2^2 using exponent rules.", "2^5 = 32", "When multiplying powers with the same base, add the exponents."],
    ["Solve a quadratic", "Medium", "Solve x^2 - 9 = 0 and give both real solutions.", "x = -3 and x = 3", "Factor as (x - 3)(x + 3) and use the zero-product property."],
    ["Find exponential growth", "Medium", "A $200 balance grows by 5% per year. Write a model and find the balance after two years.", "A(t) = 200(1.05)^t; A(2) = $220.50", "A 5% increase multiplies the balance by 1.05 each year."],
    ["Solve for an exponent", "Hard", "Solve 3^(x+1) = 81 and explain how you identify x.", "x = 3, because 81 = 3^4", "Rewrite both sides with the same base, then equate exponents."],
  ],
  precalculus: [
    ["Evaluate a function", "Easy", "For f(x) = 3x + 2, find f(4).", "14", "Substitute 4 everywhere you see x."],
    ["Identify a domain restriction", "Easy", "State the real-number domain of f(x) = 1/(x - 5).", "All real numbers except x = 5", "A denominator cannot equal zero."],
    ["Transform a graph", "Medium", "Describe how y = (x - 2)^2 + 3 is shifted compared with y = x^2.", "2 units right and 3 units up", "The value inside the squared expression shifts horizontally in the opposite sign direction."],
    ["Find a sine value", "Medium", "Use the unit circle to find cos(2pi/3) and explain its sign.", "-1/2; cosine is the x-coordinate in Quadrant II", "The reference angle is pi/3 and the angle lies in Quadrant II."],
    ["Model periodic motion", "Hard", "A wave has midline 4, amplitude 3, and period 2pi. Give one sine model with no horizontal shift.", "y = 4 + 3sin(x)", "Use midline + amplitude times sine; a period of 2pi gives frequency 1."],
  ],
  "calculus-1": [
    ["Find a limit by substitution", "Easy", "Evaluate the limit of x + 4 as x approaches 3.", "7", "For a continuous linear function, substitute the approaching value."],
    ["Interpret a derivative", "Easy", "A position function is s(t) = t^2. What does s'(3) represent, and what is its value?", "The instantaneous velocity at t = 3; s'(3) = 6", "Differentiate position with respect to time, then substitute t = 3."],
    ["Use the chain rule", "Medium", "Differentiate y = (3x^2 + 1)^4.", "dy/dx = 24x(3x^2 + 1)^3", "Differentiate the outside power, then multiply by the derivative of the inside."],
    ["Find critical points", "Medium", "Find the critical x-value of f(x) = x^2 - 6x + 5.", "x = 3", "Set f'(x) = 2x - 6 equal to zero."],
    ["Optimize a rectangle", "Hard", "A rectangle has perimeter 24. Find the dimensions that maximize its area and justify why they are optimal.", "The maximizing dimensions are 6 by 6, giving a maximum area of 36 square units.", "Use 2L + 2W = 24, express area in one variable, and find its maximum."],
  ],
  "calculus-2": [
    ["Find an antiderivative", "Easy", "Find an antiderivative of 5x^4.", "x^5 + C", "Increase the exponent by one and divide by the new exponent."],
    ["Evaluate a definite integral", "Easy", "Evaluate the integral of 3 from x = 0 to x = 4.", "12", "The area is a rectangle with height 3 and width 4."],
    ["Use substitution", "Medium", "Evaluate the integral of 2x cos(x^2) dx.", "sin(x^2) + C", "Let u = x^2, so du = 2x dx."],
    ["Test a geometric series", "Medium", "Does the infinite series 6 + 3 + 1.5 + 0.75 + ... converge? If so, find its sum.", "It converges to 12 because |r| = 1/2 < 1.", "Use the geometric series sum a/(1-r) when the common ratio has magnitude less than 1."],
    ["Integration by parts", "Hard", "Evaluate the integral of x e^x dx.", "e^x(x - 1) + C", "Choose u = x and dv = e^x dx, then apply integral u dv = uv - integral v du."],
  ],
  trigonometry: [
    ["Convert degrees to radians", "Easy", "Convert 60 degrees to radians.", "pi/3", "Multiply degrees by pi/180."],
    ["Find a right-triangle ratio", "Easy", "In a right triangle, the side opposite angle theta is 3 and the hypotenuse is 5. Find sin(theta).", "3/5", "Sine is opposite divided by hypotenuse."],
    ["Use a Pythagorean identity", "Medium", "If sin(theta) = 3/5 and theta is in Quadrant I, find cos(theta).", "4/5", "Use sin^2(theta) + cos^2(theta) = 1 and choose the positive value in Quadrant I."],
    ["Find wave features", "Medium", "For y = 2cos(3x), state the amplitude and period.", "Amplitude = 2; period = 2pi/3", "For A cos(Bx), amplitude is |A| and period is 2pi/|B|."],
    ["Solve across a cycle", "Hard", "Solve 2cos(x) = -1 for 0 <= x < 2pi.", "x = 2pi/3 and x = 4pi/3", "Cosine is -1/2 in Quadrants II and III."],
  ],
  "calculus-3": [
    ["Add two vectors", "Easy", "Add vectors <2, -1> and <3, 4>.", "<5, 3>", "Add corresponding components."],
    ["Find a vector's magnitude", "Easy", "Find the magnitude of vector <3, 4>.", "5", "Use the square root of the sum of squared components."],
    ["Compute a partial derivative", "Medium", "For f(x,y) = x^2y + 3y, find the partial derivative with respect to x.", "partial f / partial x = 2xy", "Treat y as a constant while differentiating with respect to x."],
    ["Find a gradient", "Medium", "For f(x,y) = x^2 + y^2, find the gradient at (1,2).", "gradient f(1,2) = <2,4>", "The gradient contains the partial derivatives with respect to each variable."],
    ["Find a directional derivative", "Hard", "For f(x,y) = x^2 + y^2, find the directional derivative at (1,2) in the direction of <3,4>.", "The unit direction is <3/5,4/5>; the directional derivative is 22/5.", "Take the dot product of the gradient at the point with the unit direction vector."],
  ],
  "discrete-math": [
    ["Evaluate a proposition", "Easy", "If p is true and q is false, determine the truth value of p AND q.", "False", "AND is true only when both statements are true."],
    ["Count a set", "Easy", "How many elements are in the set {2, 4, 6, 8}?", "4", "Count the distinct elements; a set does not count duplicates."],
    ["Use a conditional", "Medium", "The statement p -> q is false only when p is true and q is false. Evaluate it when p is false and q is false.", "True", "An implication with a false premise is true under the standard truth table."],
    ["Count combinations", "Medium", "How many ways can 2 students be chosen from 5 when order does not matter?", "10", "Use 5 choose 2, which is 5! / (2! 3!)."],
    ["Prove a divisibility claim", "Hard", "Show that the sum of two even integers is even using a direct proof.", "Let the integers be 2a and 2b. Their sum is 2(a+b), which is divisible by 2.", "Represent each even integer as 2 times an integer."],
  ],
  statistics: [
    ["Find the range", "Easy", "Find the range of the data 3, 8, 8, 11.", "8", "Subtract the minimum value from the maximum value."],
    ["Find a simple probability", "Easy", "A fair six-sided die is rolled once. What is the probability of rolling a number greater than 4?", "1/3", "The successful outcomes are 5 and 6 out of 6 equally likely outcomes."],
    ["Find an interquartile range", "Medium", "For sorted data 1, 2, 3, 4, 5, 6, 7, find Q1, Q3, and the interquartile range using the median-of-halves method.", "Q1 = 2; Q3 = 6; IQR = 4", "Find the medians of the lower and upper halves, excluding the overall median."],
    ["Interpret a confidence interval", "Medium", "A 95% confidence interval for a population mean is [12, 16]. State a careful interpretation.", "We are 95% confident that the interval-making method captures the true population mean; this interval estimates it as 12 to 16.", "Interpret confidence as a property of the repeated sampling method, not a probability assigned to this fixed interval."],
    ["Compare two groups", "Hard", "A study finds that students who sleep more have higher test scores. Explain why this association alone does not prove that more sleep caused the higher scores, and name one possible confounder.", "Association alone does not establish causation; prior achievement, health, or study time could affect both sleep and scores.", "Identify a third variable that could influence both measured quantities."],
  ],
  biology: [
    ["Identify a cell structure", "Easy", "Which cell structure contains most DNA and helps direct many cell activities?", "The nucleus", "It is the membrane-bound structure that stores most genetic material in eukaryotic cells."],
    ["Trace food-chain energy", "Easy", "In grass -> rabbit -> fox, identify the producer and the primary consumer.", "Grass is the producer; the rabbit is the primary consumer.", "Producers make their own food; primary consumers eat producers."],
    ["Use a microscope scale", "Easy", "A cell image is 2 mm wide at 400x magnification. What is the cell's actual width?", "0.005 mm, or 5 micrometers", "Actual size equals image size divided by magnification."],
    ["Explain photosynthesis", "Medium", "Describe how light energy, carbon dioxide, and water are used by a plant to make sugar, and name the gas released.", "Photosynthesis uses light energy to convert carbon dioxide and water into glucose; oxygen is released.", "Recall the reactants and products of photosynthesis."],
    ["Predict inheritance", "Medium", "For a cross Aa x Aa where A is dominant, what fraction of offspring are expected to show the recessive trait?", "1/4 (25%), with genotype aa", "List the four equally likely allele combinations in a Punnett square."],
    ["Explain natural selection", "Hard", "A bacterial population has heritable variation in antibiotic resistance. Explain how antibiotic use can change the frequency of resistance over generations.", "Antibiotics create a selection pressure; resistant bacteria are more likely to survive and reproduce, so resistance becomes more common in the population.", "Distinguish individuals surviving from inherited trait frequencies changing across generations."],
    ["Analyze a food-web change", "Hard", "If a disease sharply reduces a prey population, predict one likely short-term effect on its predator and explain one possible indirect effect elsewhere in the food web.", "Predators may have less food and decline or switch prey; the alternative prey may decrease, or organisms eaten by the original prey may increase.", "Trace at least two linked feeding relationships and explain that the outcome depends on the web."],
  ],
  chemistry: [
    ["Count subatomic particles", "Easy", "A neutral carbon-12 atom has atomic number 6. How many protons, neutrons, and electrons does it have?", "6 protons, 6 neutrons, and 6 electrons", "Atomic number gives protons; mass number minus atomic number gives neutrons."],
    ["Classify a change", "Easy", "Is melting solid water a physical or chemical change? Explain briefly.", "A physical change; it changes state but remains H2O.", "Ask whether the substance's chemical identity changes."],
    ["Read a chemical formula", "Easy", "How many hydrogen atoms are in one molecule of H2O?", "2 hydrogen atoms", "The subscript after an element symbol gives its atom count."],
    ["Balance a reaction", "Medium", "Balance N2 + H2 -> NH3 using the smallest whole-number coefficients.", "N2 + 3H2 -> 2NH3", "Balance nitrogen first, then hydrogen, without changing subscripts."],
    ["Explain reaction rate", "Medium", "Explain why crushing a solid reactant into a powder can make a reaction faster.", "Powder exposes more surface area, allowing more frequent effective collisions between reactant particles.", "Connect exposed surface area to opportunities for particle collisions."],
    ["Determine limiting reactant", "Hard", "The reaction 2H2 + O2 -> 2H2O starts with 5 mol H2 and 2 mol O2. Identify the limiting reactant and maximum moles of water.", "O2 is limiting; at most 4 mol H2O form.", "Two moles of hydrogen are needed per mole of oxygen; compare the available mole ratio."],
    ["Explain conservation of mass", "Hard", "A sealed container has 10 g of reactants before a reaction. What total mass of products should it have afterward, and why?", "10 g; atoms are rearranged during a chemical reaction, so total mass is conserved in a closed system.", "Count the system as closed and distinguish rearrangement from matter entering or leaving."],
  ],
  physics: [
    ["Calculate average speed", "Easy", "A cyclist travels 120 meters in 20 seconds. Find the average speed and include units.", "6 m/s", "Average speed equals distance divided by elapsed time."],
    ["Identify a net force", "Easy", "A box is pushed right with 10 N while friction pushes left with 4 N. Find the net force and direction.", "6 N to the right", "Choose a positive direction and combine forces with their signs."],
    ["Convert a unit", "Easy", "Convert 2.5 kilometers to meters.", "2500 m", "One kilometer equals 1000 meters."],
    ["Use Newton's second law", "Medium", "What acceleration results when a 4 kg object experiences a net force of 12 N?", "3 m/s^2", "Use F = ma and solve for acceleration."],
    ["Calculate kinetic energy", "Medium", "Find the kinetic energy of a 2 kg object moving at 3 m/s.", "9 J", "Use KE = (1/2)mv^2."],
    ["Explain momentum conservation", "Hard", "A moving cart collides with a stationary cart on a nearly frictionless track and they stick together. Explain what is conserved and how their shared speed can be found.", "Total momentum is conserved: m1v1 = (m1 + m2)vf, so vf = m1v1/(m1 + m2).", "Treat both carts as one isolated system and equate initial and final total momentum."],
    ["Analyze a falling object", "Hard", "Ignoring air resistance, describe how a dropped object's speed and gravitational potential energy change as it falls, and explain where the energy goes.", "Speed increases, gravitational potential energy decreases, and that energy becomes kinetic energy; total mechanical energy is conserved.", "Use conservation of mechanical energy for the falling object-Earth system."],
  ],
};

for (const [topicId, questions] of Object.entries(supplementalPractice)) {
  const topicContent = learningContent[topicId];
  if (!topicContent) {
    throw new Error(`Supplemental practice references unknown topic "${topicId}".`);
  }

  topicContent.exercises.push(
    ...questions.map(([title, difficulty, instructions, expectedOutput, hint]) =>
      exercise(
        `${topicId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title,
        difficulty,
        instructions,
        "",
        expectedOutput,
        hint,
      ),
    ),
  );
}
