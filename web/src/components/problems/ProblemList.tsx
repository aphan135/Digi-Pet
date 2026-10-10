import type { Problem, ProblemType } from "../../types";
import { getProblemsByType } from "../../services/problemService";
import ProblemCard from "./ProblemCard";

interface ProblemListProps {
  selectedType: ProblemType | "all";
  selectedTopic: string | "all";
  selectedProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
}

function ProblemList({
  selectedType,
  selectedTopic,
  selectedProblem,
  onSelectProblem,
}: ProblemListProps) {
  const problems = getProblemsByType(selectedType).filter(
    (problem) => selectedTopic === "all" || problem.topic === selectedTopic,
  );

  return (
    <div className="problem-list">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          isSelected={problem.id === selectedProblem.id}
          onSelect={onSelectProblem}
          problem={problem}
        />
      ))}
    </div>
  );
}

export default ProblemList;
