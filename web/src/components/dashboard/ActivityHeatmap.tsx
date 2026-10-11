import type { dailyActivity } from "../../services/dashboardStats";
import EmptyState from "./EmptyState";

interface Props {
  days: ReturnType<typeof dailyActivity>;
  hasAttempts: boolean;
  current: number;
  longest: number;
  onStartChallenge: () => void;
}
const colors = ["#e5ede5", "#b8d3bd", "#7eac8b", "#437a57", "#174f3a"];
export default function ActivityHeatmap({ days, hasAttempts, current, longest, onStartChallenge }: Props) {
  const total = days.reduce((sum, day) => sum + day.count, 0);
  // Twelve complete seven-day columns ending today; weekday labels rotate with the window.
  const weeks = Array.from({ length: 12 }, (_, week) => days.slice(week * 7, week * 7 + 7));
  const summary = `${total} attempts in the last 84 local days. Current streak ${current} days; longest ${longest} days.`;
  return <section className="dashboard-panel dashboard-activity" aria-labelledby="activity-title">
    <div className="dashboard-panel-heading"><div><h3 id="activity-title">A little, often.</h3><p>Your activity over the last 12 weeks</p></div>
      <p className="dashboard-streaks"><strong>{current}</strong> day streak <span>/</span> <strong>{longest}</strong> best</p>
    </div>
    {!hasAttempts ? <EmptyState message="Your first attempt is the start of a learning rhythm. Every practice day will find a place here." onStartChallenge={onStartChallenge} /> : <>
      <div className="dashboard-chart-scroll" tabIndex={0} role="region" aria-label="Activity heatmap, scroll horizontally on small screens">
        <svg className="dashboard-heatmap" viewBox="0 0 850 255" role="img" aria-label={summary}>
          {days.slice(0, 7).map((day, row) => <text key={day.key} x="0" y={53 + row * 27}>{day.date.toLocaleDateString(undefined, { weekday: "short" })}</text>)}
          {weeks.map((week, col) => <g key={week[0].key}>
            {(col === 0 || week[0].date.getMonth() !== weeks[col - 1][0].date.getMonth()) && <text x={58 + col * 65} y="18">{week[0].date.toLocaleDateString(undefined, { month: "short" })}</text>}
            {week.map((day, row) => <g key={day.key}>
              <rect x={58 + col * 65} y={35 + row * 27} width="55" height="22" rx="4" fill={colors[Math.min(4, day.count)]} />
              {day.count > 0 && <text x={85.5 + col * 65} y={50 + row * 27} textAnchor="middle" fill={day.count >= 3 ? "#ffffff" : "#17211d"}>{day.count}</text>}
              <title>{day.date.toLocaleDateString(undefined, { dateStyle: "full" })}: {day.count} attempts</title>
            </g>)}
          </g>)}
          <text x="58" y="247">{days[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} to {days[83].date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · each cell shows attempts</text>
        </svg>
      </div>
      <div className="dashboard-chart-footer"><p><strong>{total}</strong> attempts across <strong>{days.filter((d) => d.count > 0).length}</strong> active days</p>
        <div className="dashboard-legend" aria-label="Activity levels: zero, one, two, three, four or more attempts">{colors.map((color, i) => <span key={color}><svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="2" fill={color} /></svg>{i === 4 ? "4+" : i}</span>)}</div>
      </div>
    </>}
  </section>;
}
