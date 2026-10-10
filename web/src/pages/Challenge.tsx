import ProblemList from "../components/problems/ProblemList";
import { getFeaturedProblem } from "../services/problemService";

function Challenge() {
  const featuredProblem = getFeaturedProblem();

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
          placeholder="Write your solution idea, pseudocode, or system design notes..."
        />
        <button type="button">Submit attempt</button>
      </div>
      <div className="challenge-list">
        <h2>Question queue</h2>
        <ProblemList />
      </div>
    </section>
  );
}

export default Challenge;

