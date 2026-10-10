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

  const text = await response.text();
  let body: Partial<AnswerFeedback> & { error?: string } = {};

  try {
    body = text ? (JSON.parse(text) as typeof body) : {};
  } catch {
    throw new Error("The answer checker returned an invalid response. Check the API server logs.");
  }

  if (!response.ok) {
    throw new Error(body.error || "Could not check answer.");
  }

  return body as AnswerFeedback;
}
