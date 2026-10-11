import type { Problem } from "../types";

export const problems: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    type: "leetcode",
    topic: "Arrays + Hash Maps",
    prompt:
      "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
    hint: "Store each number you have seen in a map, then check whether target - current exists.",
    expectedConcepts: ["hash map lookup", "single pass", "return indices", "O(n) time"],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    type: "leetcode",
    topic: "Stacks",
    prompt:
      "Given a string containing brackets, determine whether every opening bracket is closed in the correct order.",
    hint: "Push opening brackets onto a stack and match each closing bracket against the latest opener.",
    expectedConcepts: ["stack", "matching pairs", "empty stack check", "O(n) time"],
  },
];
