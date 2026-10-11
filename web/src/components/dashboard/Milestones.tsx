import type { milestones } from "../../services/dashboardStats";
import EmptyState from "./EmptyState";
interface Props { items: ReturnType<typeof milestones>; hasAttempts: boolean; onStartChallenge: () => void }
export default function Milestones({ items, hasAttempts, onStartChallenge }: Props) {
  return <section className="dashboard-panel" aria-labelledby="milestones-title">
    <div className="dashboard-panel-heading"><div><h3 id="milestones-title">Small wins, lasting growth</h3><p>{items.filter((item) => item.earned).length} of {items.length} milestones earned</p></div></div>
    {!hasAttempts ? <EmptyState message="Your first solve, a steady streak, a new subject. Make room for the moments that matter." onStartChallenge={onStartChallenge} /> : <ul className="dashboard-milestones">
      {items.map((item) => <li key={item.title} className={item.earned ? "earned" : ""}>
        <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          {item.earned ? <><circle cx="14" cy="14" r="11" /><path d="m8 14 4 4 8-8" /></> : <><rect x="6" y="12" width="16" height="12" rx="3" /><path d="M9 12V8a5 5 0 0 1 10 0v4m-5 5v3" /></>}
        </svg><div><strong>{item.title}</strong><p>{item.condition}</p><span>{item.earned ? "Earned" : "Not yet earned"}</span></div>
      </li>)}
    </ul>}
  </section>;
}
