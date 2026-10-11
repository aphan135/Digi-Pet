import { useEffect, useState } from "react";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import SubjectBreakdown from "../components/dashboard/SubjectBreakdown";
import ScoreTrend from "../components/dashboard/ScoreTrend";
import PetStatus from "../components/dashboard/PetStatus";
import WeakSpots from "../components/dashboard/WeakSpots";
import Milestones from "../components/dashboard/Milestones";
import { getAttempts, getCompletedProblemIds, isDemoMode, setDemoMode, subscribeToProgressUpdates } from "../services/progressService";
import { currentStreak, dailyActivity, localDateKey, longestStreak, milestones, petState, recordedAttempts, scoreTrend, subjectBreakdown, weakSpots, xp } from "../services/dashboardStats";
import { topics } from "../data/topics";

interface DashboardProps { onOpenTopic: (id: string) => void; onStartChallenge: () => void }
function snapshot() {
  const now = new Date();
  return { now, attempts: recordedAttempts(getAttempts(now), now), demo: isDemoMode(), completed: getCompletedProblemIds() };
}
export default function Dashboard({ onOpenTopic, onStartChallenge }: DashboardProps) {
  const [data, setData] = useState(snapshot);
  useEffect(() => {
    const refresh = () => setData(snapshot());
    const unsubscribe = subscribeToProgressUpdates(refresh);
    // Refresh at midnight and after a sleeping/background tab returns.
    let midnight: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const next = new Date();
      next.setHours(24, 0, 0, 0);
      midnight = setTimeout(() => { refresh(); schedule(); }, next.getTime() - Date.now() + 50);
    };
    schedule();
    window.addEventListener("focus", refresh);
    return () => { unsubscribe(); clearTimeout(midnight); window.removeEventListener("focus", refresh); };
  }, []);
  const { attempts, now, demo } = data;
  const hasAttempts = attempts.length > 0;
  const streak = currentStreak(attempts, now);
  const breakdown = subjectBreakdown(attempts);
  const solved = breakdown.reduce((sum, s) => sum + s.solved, 0);
  const average = hasAttempts ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1) : null;
  const untracked = demo ? 0 : data.completed.filter((id) => !attempts.some((a) => a.problemId === id && a.isCorrect)).length;
  return <section className="dashboard-page content-stack">
    <header className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <h2>See how far<br />you've grown.</h2>
        <p>A practice at a time. A clearer picture of your learning.</p>
        <dl className="dashboard-kpis">
          <div><dt>Streak</dt><dd>{streak} <span>days</span></dd></div>
          <div><dt>XP earned</dt><dd>{xp(attempts).toLocaleString()}</dd></div>
          <div><dt>Solved</dt><dd>{solved.toLocaleString()}</dd></div>
          <div><dt>Avg. score</dt><dd>{average ?? "N/A"}{average && <span> /10</span>}</dd></div>
        </dl>
        <div className="dashboard-demo-controls">
          <button type="button" role="switch" aria-checked={demo} onClick={() => setDemoMode(!demo)} className="dashboard-demo-switch"><span className="dashboard-switch-track" aria-hidden="true"><span /></span>Load demo data</button>
          {demo && <span className="dashboard-demo-badge" role="status">Demo data</span>}
        </div>
        <p className="dashboard-data-note">{demo ? "Illustrative activity. Your real progress is kept separately." : "Based on graded attempts tracked on this browser."}</p>
      </div>
      <PetStatus state={petState(attempts, now)} hasAttempts={hasAttempts} onStartChallenge={onStartChallenge} />
    </header>
    {untracked > 0 && <p className="dashboard-history-note">{untracked} earlier {untracked === 1 ? "completion is" : "completions are"} still saved in Learn and Map. Analytics starts with dated attempts; earlier scores and dates are unknown.</p>}
    <ActivityHeatmap days={dailyActivity(attempts, 84, now)} hasAttempts={hasAttempts} current={streak} longest={longestStreak(attempts, now)} onStartChallenge={onStartChallenge} />
    <div className="dashboard-columns">
      <SubjectBreakdown subjects={breakdown} hasAttempts={hasAttempts} onStartChallenge={onStartChallenge} />
      <ScoreTrend key={`${demo}-${localDateKey(now)}`} points={scoreTrend(attempts)} onStartChallenge={onStartChallenge} />
    </div>
    <div className="dashboard-columns">
      <WeakSpots spots={weakSpots(attempts, topics)} hasAttempts={hasAttempts} onOpenTopic={onOpenTopic} onStartChallenge={onStartChallenge} />
      <Milestones items={milestones(attempts, now)} hasAttempts={hasAttempts} onStartChallenge={onStartChallenge} />
    </div>
  </section>;
}
