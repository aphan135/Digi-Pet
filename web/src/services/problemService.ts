import { problems } from "../data/problems";
import type { ProblemType } from "../types";

export function getProblems() {
  return problems;
}

export function getFeaturedProblem() {
  return problems[0];
}

export function getProblemsByType(type: ProblemType | "all") {
  return type === "all" ? problems : problems.filter((problem) => problem.type === type);
}
