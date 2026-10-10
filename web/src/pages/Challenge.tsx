import { useState } from "react";
import { checkAnswer } from "../services/answerService";
import { getFeaturedProblem } from "../services/problemService";
import type { AnswerFeedback } from "../types";

function Challenge() {
  const featuredProblem = getFeaturedProblem();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit() {
    setError("");
    setFeedback(null);
    setIsChecking(true);

    try {
      const result = await checkAnswer(featuredProblem, answer);
      setFeedback(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not check answer.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="challenge-layout">
      <div className="problem-panel">
        <p className="eyebrow">{featuredProblem.type}</p>
        <h2>{featuredProblem.title}</h2>
        <span className={`difficulty ${featuredProblem.difficulty.toLowerCase()}`}>
          {featuredProblem.difficulty}
        </span>
        <p>{featuredProblem.prompt}</p>
        <div className="hint-box">
          <strong>Pet hint</strong>
          <p>{featuredProblem.hint}</p>
        </div>
      </div>
      <div className="workspace-panel">
        <label htmlFor="answer">Your approach</label>
        <textarea
          id="answer"
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Write your solution idea, pseudocode, or system design notes..."
          value={answer}
        />
        <button disabled={isChecking || !answer.trim()} onClick={handleSubmit} type="button">
          {isChecking ? "Checking..." : "Submit attempt"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {feedback && (
          <div className={`feedback-panel ${feedback.petMood}`}>
            <div>
              <p className="eyebrow">AI review</p>
              <h3>{feedback.score}/10</h3>
            </div>
            <p>{feedback.feedback}</p>
            <div className="complexity-grid">
              <span>Time: {feedback.timeComplexity}</span>
              <span>Space: {feedback.spaceComplexity}</span>
            </div>
            {feedback.missedConcepts.length > 0 && (
              <p>Missed: {feedback.missedConcepts.join(", ")}</p>
            )}
            <div className="hint-box">
              <strong>Next hint</strong>
              <p>{feedback.hint}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Challenge;
