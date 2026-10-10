import { useEffect, useState } from "react";
import { checkAnswer } from "../services/answerService";
import { getFeaturedProblem } from "../services/problemService";
import type { AnswerFeedback, Problem, ProblemType } from "../types";

const subjectFilters: { id: ProblemType | "all"; label: string }[] = [
  { id: "all", label: "All subjects" },
  { id: "leetcode", label: "Coding" },
  { id: "system-design", label: "System design" },
  { id: "math", label: "Math" },
  { id: "science", label: "Science" },
];

function getSubjectLabel(type: ProblemType) {
  return subjectFilters.find((filter) => filter.id === type)?.label ?? type;
}

interface ChallengeProps {
  problem?: Problem;
}

function Challenge({ problem }: ChallengeProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(problem ?? getFeaturedProblem());
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!problem) return;
    setSelectedProblem(problem);
    setAnswer("");
    setFeedback(null);
    setError("");
  }, [problem]);

  async function handleSubmit() {
    setError("");
    setFeedback(null);
    setIsChecking(true);

    try {
      const result = await checkAnswer(selectedProblem, answer);
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
        <p className="eyebrow">{getSubjectLabel(selectedProblem.type)}</p>
        <h2>{selectedProblem.title}</h2>
        <span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>
          {selectedProblem.difficulty}
        </span>
        <p>{selectedProblem.prompt}</p>
        {selectedProblem.starterCode && (
          <div className="starter-code-panel">
            <div className="code-window-header">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
              <span className="code-file-name">starter.js</span>
            </div>
            <pre>
              <code>{selectedProblem.starterCode}</code>
            </pre>
          </div>
        )}
        {selectedProblem.expectedOutput && (
          <div className="expected-output-panel">
            <strong>Expected output</strong>
            <code>{selectedProblem.expectedOutput}</code>
          </div>
        )}
        <div className="hint-box">
          <strong>Pet hint</strong>
          <p>{selectedProblem.hint}</p>
        </div>
      </div>
      <div className="workspace-panel">
        <label htmlFor="answer">Your answer</label>
        <textarea
          id="answer"
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Explain your reasoning, show your work, or write your solution idea..."
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
            {(selectedProblem.type === "leetcode" ||
              selectedProblem.type === "system-design") && (
              <div className="complexity-grid">
                <span>Time: {feedback.timeComplexity}</span>
                <span>Space: {feedback.spaceComplexity}</span>
              </div>
            )}
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
