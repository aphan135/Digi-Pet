export type PageName = "dashboard" | "learn" | "challenge" | "profile";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemType = "leetcode" | "system-design";

export interface Problem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  type: ProblemType;
  topic: string;
  prompt: string;
  hint: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

