# API Contract

This is a placeholder for the shared backend contract.

## Problem

```ts
interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "leetcode" | "system-design";
  topic: string;
  prompt: string;
  hint: string;
}
```

## Attempt

```ts
interface Attempt {
  problemId: string;
  answer: string;
  submittedAt: string;
}
```

