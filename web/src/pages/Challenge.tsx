import { useState } from "react";
import ProblemList from "../components/problems/ProblemList";
import { checkAnswer } from "../services/answerService";
import { getFeaturedProblem, getProblemsByType } from "../services/problemService";
import type { AnswerFeedback, Problem, ProblemType } from "../types";

const subjectFilters: { id: ProblemType | "all"; label: string }[] = [
  { id: "all", label: "All subjects" },
  { id: "leetcode", label: "Coding" },
  { id: "system-design", label: "System design" },
  { id: "math", label: "Math" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
];

function getSubjectLabel(type: ProblemType) {
  return subjectFilters.find((filter) => filter.id === type)?.label ?? type;
}

function Challenge() {
  const [selectedType, setSelectedType] = useState<ProblemType | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<string | "all">("all");
  const [selectedProblem, setSelectedProblem] = useState<Problem>(getFeaturedProblem());
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  function selectProblem(problem: Problem) {
    setSelectedProblem(problem);
    setAnswer("");
    setFeedback(null);
    setError("");
  }

  function selectType(type: ProblemType | "all") {
    setSelectedType(type);
    setSelectedTopic("all");
    const [firstProblem] = getProblemsByType(type);
    if (firstProblem) selectProblem(firstProblem);
  }

  function selectTopic(topic: string | "all") {
    setSelectedTopic(topic);
    const [firstProblem] = getProblemsByType(selectedType).filter(
      (problem) => topic === "all" || problem.topic === topic,
    );
    if (firstProblem) selectProblem(firstProblem);
  }

  const availableTopics = Array.from(
    new Set(getProblemsByType(selectedType).map((problem) => problem.topic)),
  );

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
      <div className="challenge-list">
        <h2>Choose a subject and question</h2>
        <div aria-label="Filter questions by subject" className="subject-filters" role="group">
          {subjectFilters.map((filter) => (
            <button
              aria-pressed={selectedType === filter.id}
              className={selectedType === filter.id ? "active" : ""}
              key={filter.id}
              onClick={() => selectType(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <h3>Choose a topic</h3>
        <div aria-label="Filter questions by topic" className="subject-filters" role="group">
          <button
            aria-pressed={selectedTopic === "all"}
            className={selectedTopic === "all" ? "active" : ""}
            onClick={() => selectTopic("all")}
            type="button"
          >
            All topics
          </button>
          {availableTopics.map((topic) => (
            <button
              aria-pressed={selectedTopic === topic}
              className={selectedTopic === topic ? "active" : ""}
              key={topic}
              onClick={() => selectTopic(topic)}
              type="button"
            >
              {topic}
            </button>
          ))}
        </div>
        <ProblemList
          onSelectProblem={selectProblem}
          selectedProblem={selectedProblem}
          selectedTopic={selectedTopic}
          selectedType={selectedType}
        />
      </div>
    </section>
  );
}

export default Challenge;
