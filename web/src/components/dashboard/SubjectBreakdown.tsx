import type { subjectBreakdown } from "../../services/dashboardStats";
import EmptyState from "./EmptyState";
interface Props { subjects: ReturnType<typeof subjectBreakdown>; hasAttempts: boolean; onStartChallenge: () => void }
export default function SubjectBreakdown({ subjects, hasAttempts, onStartChallenge }: Props) {
  const max = Math.max(1, ...subjects.map((s) => s.attempted));
  return <section className="dashboard-panel" aria-labelledby="subjects-title">
    <div className="dashboard-panel-heading"><div><h3 id="subjects-title">Across your subjects</h3><p>Different problems solved / attempted</p></div></div>
    {!hasAttempts ? <EmptyState message="Find your range. Coding, systems, math and science will grow with every new problem you try." onStartChallenge={onStartChallenge} /> : <>
      <div className="dashboard-subjects">{subjects.map((s) => <div key={s.type}>
        <div className="dashboard-row"><strong>{s.label}</strong><span>{s.solved} / {s.attempted}</span></div>
        <svg viewBox="0 0 400 14" preserveAspectRatio="none" role="img" aria-label={`${s.label}: ${s.solved} solved of ${s.attempted} different problems attempted`}>
          <rect width="400" height="14" rx="3" fill="#e9e7df" />
          <rect width={s.attempted / max * 400} height="14" rx="3" fill="#b8d3bd" />
          <rect width={s.solved / max * 400} height="14" rx="3" fill="#174f3a" />
        </svg>
      </div>)}</div>
      <p className="dashboard-note">Dark green: solved. Light green: attempted. Retries count once.</p>
    </>}
  </section>;
}
