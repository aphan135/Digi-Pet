import { useId, useState } from "react";
import type { scoreTrend } from "../../services/dashboardStats";
import EmptyState from "./EmptyState";
interface Props { points: ReturnType<typeof scoreTrend>; onStartChallenge: () => void }
// ponytail: switch to a chart library if interaction grows beyond these tooltips.
export default function ScoreTrend({ points, onStartChallenge }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const tooltipId = useId();
  const selected = focused ?? hovered;
  const active = selected === null ? undefined : points[selected];
  const x = (i: number) => points.length === 1 ? 250 : 35 + i / (points.length - 1) * 430;
  const y = (score: number) => 170 - score * 13;
  const line = (average: boolean) => points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(average ? p.average : p.score)}`).join(" ");
  return <section className="dashboard-panel" aria-labelledby="trend-title">
    <div className="dashboard-panel-heading"><div><h3 id="trend-title">Progress, in perspective</h3><p>Your last {points.length || 20} graded attempts, scored out of 10</p></div></div>
    {!points.length ? <EmptyState message="One attempt gives you a starting point. A few more will show how your understanding is changing." onStartChallenge={onStartChallenge} /> : <>
      <div className="dashboard-chart-scroll" tabIndex={0} role="region" aria-label="Score chart, scroll horizontally on small screens">
        <svg className="dashboard-trend" viewBox="0 0 500 210" role="img" aria-label={`Scores, oldest to newest: ${points.map((p) => p.score).join(", ")}. Latest five-attempt average ${points[points.length - 1].average.toFixed(1)} out of 10.`}>
          {[0, 5, 10].map((score) => <g key={score}><line x1="35" x2="465" y1={y(score)} y2={y(score)} stroke="#dcd8ce" /><text x="10" y={y(score) + 4}>{score}</text></g>)}
          <path d={line(true)} fill="none" stroke="#8b651e" strokeWidth="2" strokeDasharray="5 5" />
          <path className="dashboard-draw-line" d={line(false)} fill="none" stroke="#174f3a" strokeWidth="2" pathLength="1" />
          {points.map((p, i) => <g key={`${p.at}-${i}`}>
            <circle cx={x(i)} cy={y(p.score)} r={i === points.length - 1 ? 5 : 3} fill="#174f3a" />
            <circle cx={x(i)} cy={y(p.score)} r="10" fill="transparent" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            <text x={x(i)} y={y(p.score) - 11} textAnchor="middle" className="dashboard-point-value">{p.score}</text>
          </g>)}
          {active && <circle cx={x(selected!)} cy={y(active.score)} r="9" fill="none" stroke="#8b651e" strokeWidth="2" />}
          <text x="35" y="202">Oldest</text><text x="465" y="202" textAnchor="end">Latest</text>
        </svg>
      </div>
      <div className="dashboard-legend"><span className="dashboard-score-key">Score</span><span className="dashboard-average-key">5-attempt rolling average</span></div>
      <div className="dashboard-score-controls" aria-label="Explore scores, oldest to newest">
        {points.map((p, i) => <button type="button" key={`${p.at}-${i}`} aria-label={`Attempt ${i + 1}: ${p.title}, ${p.score} out of 10`} aria-describedby={selected === i ? tooltipId : undefined}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onFocus={() => setFocused(i)} onBlur={() => setFocused(null)}
          onKeyDown={(e) => { if (e.key === "Escape") { setFocused(null); setHovered(null); } }}
          onClick={() => setFocused(i)}>{p.score}</button>)}
      </div>
      <p className="dashboard-tooltip" id={tooltipId} role="tooltip">{active ? `${new Date(active.at).toLocaleDateString()} · ${active.title} · ${active.score}/10 · average ${active.average.toFixed(1)}/10` : "Hover or focus a score for its date, problem and rolling average."}</p>
    </>}
  </section>;
}
