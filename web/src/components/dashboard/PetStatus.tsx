import { ProfileCatIcon } from "../layout/Navbar";
import type { petState } from "../../services/dashboardStats";
interface Props { state: ReturnType<typeof petState>; hasAttempts: boolean; onStartChallenge: () => void }
export default function PetStatus({ state, hasAttempts, onStartChallenge }: Props) {
  const messages = { celebrate: "Growing right alongside you.", encourage: "Every attempt helps us grow.", nudge: "Ready when you are." };
  return <div className="dashboard-pet">
    <div className="dashboard-pet-heading"><ProfileCatIcon /><div><h3>Your study companion</h3><p>{messages[state.mood]}</p></div></div>
    <div className="dashboard-row"><span>Energy from recent practice</span><strong>{state.energy}%</strong></div>
    <div className="dashboard-energy" role="meter" aria-label="Pet energy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.energy}><span style={{ width: `${state.energy}%` }} /></div>
    <div className="dashboard-row"><span>Today's practice goal</span><strong>{state.today} / {state.goal}</strong></div>
    <div className="dashboard-goal" role="img" aria-label={`${Math.min(state.today, state.goal)} of 3 daily goal segments complete`}>
      {[0, 1, 2].map((i) => <span key={i} className={i < state.today ? "complete" : ""} />)}
    </div>
    <p className="dashboard-pet-note">{state.today >= 3 ? "Daily goal reached. Nicely done." : `${3 - state.today} more ${state.today === 2 ? "attempt" : "attempts"} to reach today's goal.`}</p>
    {!hasAttempts && <button className="dashboard-link" onClick={onStartChallenge} type="button">Start a challenge</button>}
  </div>;
}
