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
  expectedConcepts?: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  score: number;
  feedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  missedConcepts: string[];
  hint: string;
  petMood: "celebrate" | "encourage" | "nudge";
}
