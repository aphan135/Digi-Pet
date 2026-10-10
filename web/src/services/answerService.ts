import type { AnswerFeedback, Problem } from "../types";

export async function checkAnswer(
  problem: Problem,
  userAnswer: string,
): Promise<AnswerFeedback> {
  const response = await fetch("/api/check-answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problem, userAnswer }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Could not check answer.");
  }

  return body;
}
