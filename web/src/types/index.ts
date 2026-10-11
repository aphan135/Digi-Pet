export type PageName = "dashboard" | "learn" | "map" | "challenge";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemType = "leetcode";

export interface Problem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  type: ProblemType;
  topic: string;
  prompt: string;
  hint: string;
  starterCode?: string;
  expectedOutput?: string;
  expectedConcepts?: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  category: "Foundations" | "Patterns";
  level: ProblemDifficulty;
  lessons: number;
  minutes: number;
  progress: number;
  accent: string;
  icon: string;
}

export interface LearningLevel {
  label: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  explanation: string;
  takeaway: string;
}

export interface LearningExercise {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  instructions: string;
  starterCode: string;
  expectedOutput: string;
  hint: string;
}

export interface TopicContent {
  overview: string;
  analogy: string;
  levels: LearningLevel[];
  exercises: LearningExercise[];
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
