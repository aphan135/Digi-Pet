import type { weakSpots } from "../../services/dashboardStats";
import EmptyState from "./EmptyState";
interface Props { spots: ReturnType<typeof weakSpots>; hasAttempts: boolean; onOpenTopic: (id: string) => void; onStartChallenge: () => void }
export default function WeakSpots({ spots, hasAttempts, onOpenTopic, onStartChallenge }: Props) {
  return <section className="dashboard-panel" aria-labelledby="weak-title">
    <div className="dashboard-panel-heading"><div><h3 id="weak-title">Worth another look</h3><p>Concepts that came up in your feedback</p></div></div>
    {!spots.length ? <EmptyState message={hasAttempts ? "No missed concepts recorded. Keep exploring to discover your next learning edge." : "Your feedback will turn into a focused review list here. Start with a problem that interests you."} onStartChallenge={onStartChallenge} /> : <ul className="dashboard-review-list">
      {spots.map((spot) => <li key={`${spot.topic}-${spot.concept}`}>
        <div><strong>{spot.concept}</strong><p>{spot.topic} · {spot.count} {spot.count === 1 ? "mention" : "mentions"}</p></div>
        <button className="dashboard-link" type="button" aria-label={spot.topicId ? `Open ${spot.topic} to review ${spot.concept}` : `Start a challenge to review ${spot.concept}`} onClick={() => spot.topicId ? onOpenTopic(spot.topicId) : onStartChallenge()}>{spot.topicId ? "Open topic" : "Start a challenge"}</button>
      </li>)}
    </ul>}
  </section>;
}
