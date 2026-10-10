import type { KeyboardEvent } from "react";
import type { Problem } from "../../types";

interface ProblemCardProps {
  problem: Problem;
  isSelected: boolean;
  onSelect: (problem: Problem) => void;
}

function ProblemCard({ problem, isSelected, onSelect }: ProblemCardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(problem);
    }
  }

  return (
    <article
      aria-pressed={isSelected}
      className={`problem-card${isSelected ? " selected" : ""}`}
      onClick={() => onSelect(problem)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >

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
