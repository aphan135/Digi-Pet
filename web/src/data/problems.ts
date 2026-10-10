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
    id: "url-shortener",
    title: "Design a URL Shortener",
    difficulty: "Medium",
    type: "system-design",
    topic: "System Design",
    prompt:
      "Design a service that converts long URLs into short links and redirects users back to the original URL.",
    hint: "Start with the data model, then think about ID generation, redirects, and scaling reads.",
    expectedConcepts: ["requirements", "URL mapping table", "ID generation", "redirect latency"],
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
  {
    id: "adding-fractions",
    title: "Adding Fractions",
    difficulty: "Easy",
    type: "math",
    topic: "Fractions",
    prompt:
      "What is 3/4 + 2/3? Show how you find a common denominator and simplify your answer.",
    hint: "Find the least common denominator of 4 and 3, then convert both fractions.",
    expectedConcepts: ["common denominator", "equivalent fractions", "simplifying"],
  },
  {
    id: "why-ice-floats",
    title: "Why Does Ice Float?",
    difficulty: "Easy",
    type: "science",
    topic: "Matter and Density",
    prompt:
      "Explain why a piece of ice floats in liquid water, using particle arrangement and density in your answer.",
    hint: "Think about how water molecules arrange themselves when water freezes and what that does to the same amount of matter's volume.",
    expectedConcepts: ["molecular arrangement", "volume increases when freezing", "lower density than liquid water"],
  },
  {
    id: "american-revolution-causes",
    title: "Causes of the American Revolution",
    difficulty: "Medium",
    type: "history",
    topic: "American Revolution",
    prompt:
      "Name two causes of the American Revolution and explain how each increased tensions between Britain and the colonies.",
    hint: "Consider taxation and colonial representation, then connect each cause to how colonists responded.",
    expectedConcepts: ["taxation", "representation", "colonial response", "cause and effect"],
  },
];
