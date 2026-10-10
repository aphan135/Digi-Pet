import type { Problem } from "../../types";

interface ProblemCardProps {
  problem: Problem;
}

function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <article className="problem-card">
      <div>
        <p className="eyebrow">{problem.topic}</p>
        <h3>{problem.title}</h3>
      </div>
      <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
        {problem.difficulty}
      </span>
      <p>{problem.prompt}</p>
    </article>
  );
}

export default ProblemCard;

