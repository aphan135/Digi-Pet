import { getProblems } from "../../services/problemService";
import ProblemCard from "./ProblemCard";

function ProblemList() {
  const problems = getProblems();

  return (
    <div className="problem-list">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  );
}

export default ProblemList;

