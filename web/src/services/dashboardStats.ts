import type { Attempt, ProblemType, Topic } from "../types";

export const subjects: { type: ProblemType; label: string }[] = [
  { type: "leetcode", label: "Coding" }, { type: "system-design", label: "System design" },
  { type: "math", label: "Math" }, { type: "science", label: "Science" },
];
export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
// Calendar ordinals, not elapsed local milliseconds: DST days can be 23 or 25 hours.
function dayNumber(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}
export function recordedAttempts(attempts: Attempt[], now = new Date()) {
  return attempts.filter((a) => Number.isFinite(Date.parse(a.at)) && Date.parse(a.at) <= now.getTime())
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}
export function dailyActivity(attempts: Attempt[], days = 84, now = new Date()) {
  const counts = new Map<string, number>();
  for (const a of recordedAttempts(attempts, now)) {
    const key = localDateKey(new Date(a.at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const length = Math.max(0, Math.floor(days));
  return Array.from({ length }, (_, i) => {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (length - 1 - i));
    const key = localDateKey(date);
    return { date, key, count: counts.get(key) ?? 0 };
  });
}
function activeDays(attempts: Attempt[], now: Date) {
  return new Set(recordedAttempts(attempts, now).map((a) => dayNumber(new Date(a.at))));
}
export function currentStreak(attempts: Attempt[], now = new Date()) {
  const days = activeDays(attempts, now);
  let day = dayNumber(now);
  if (!days.has(day)) day--;
  let streak = 0;
  while (days.has(day--)) streak++;
  return streak;
}
export function longestStreak(attempts: Attempt[], now = new Date()) {
  const days = [...activeDays(attempts, now)].sort((a, b) => a - b);
  let longest = 0, run = 0;
  days.forEach((day, i) => {
    run = i > 0 && day === days[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });
  return longest;
}
function firstSolves(attempts: Attempt[]) {
  const solved = new Map<string, Attempt>();
  for (const a of [...attempts].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    if (a.isCorrect && !solved.has(a.problemId)) solved.set(a.problemId, a);
  }
  return [...solved.values()];
}
export function subjectBreakdown(attempts: Attempt[]) {
  const solved = firstSolves(attempts);
  return subjects.map((subject) => ({ ...subject,
    attempted: new Set(attempts.filter((a) => a.type === subject.type).map((a) => a.problemId)).size,
    solved: solved.filter((a) => a.type === subject.type).length,
  }));
}
export function scoreTrend(attempts: Attempt[], n = 20) {
  const sorted = [...attempts].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return sorted.map((a, index) => {
    const window = sorted.slice(Math.max(0, index - 4), index + 1);
    return { ...a, average: window.reduce((sum, item) => sum + item.score, 0) / window.length };
  }).slice(-n);
}
export function weakSpots(attempts: Attempt[], topics: Pick<Topic, "id" | "name">[]) {
  // Problem-bank names predate the topic catalog (e.g. "Hash Maps" / "Hashmaps").
  const topicKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const groups = new Map<string, { concept: string; topic: string; topicId?: string; count: number }>();
  for (const a of attempts) {
    const unique = new Map(a.missedConcepts.map((c) => [c.trim().toLowerCase(), c.trim()]));
    for (const [normalized, concept] of unique) {
      if (!normalized) continue;
      const key = `${topicKey(a.topic)}::${normalized}`;
      const existing = groups.get(key);
      if (existing) existing.count++;
      else groups.set(key, { concept, topic: a.topic, count: 1,
        topicId: topics.find((t) => topicKey(t.name) === topicKey(a.topic))?.id });
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.concept.localeCompare(b.concept)).slice(0, 5);
}
export function xp(attempts: Attempt[]) {
  const points = { Easy: 10, Medium: 20, Hard: 40 };
  return firstSolves(attempts).reduce((sum, a) => sum + points[a.difficulty], 0);
}
export function milestones(attempts: Attempt[], now = new Date()) {
  const solves = firstSolves(attempts).length;
  const longest = longestStreak(attempts, now);
  return [
    { title: "First steps", condition: "Solve your first problem", earned: solves >= 1 },
    { title: "Finding a rhythm", condition: "Practice 3 days in a row", earned: longest >= 3 },
    { title: "A week of growth", condition: "Practice 7 days in a row", earned: longest >= 7 },
    { title: "Curious mind", condition: "Try all four subjects", earned: new Set(attempts.map((a) => a.type)).size === 4 },
    { title: "Ten in the bag", condition: "Solve 10 different problems", earned: solves >= 10 },
    { title: "Perfectly done", condition: "Earn a score of 10/10", earned: attempts.some((a) => a.score === 10) },
  ];
}
export function petState(attempts: Attempt[], now = new Date()) {
  const recent = recordedAttempts(attempts, now).filter((a) => dayNumber(now) - dayNumber(new Date(a.at)) < 7);
  const today = recent.filter((a) => localDateKey(new Date(a.at)) === localDateKey(now)).length;
  const average = recent.length ? recent.reduce((sum, a) => sum + a.score, 0) / recent.length : 0;
  const streak = currentStreak(attempts, now);
  const mood: "nudge" | "celebrate" | "encourage" = recent.length === 0 ? "nudge" : average >= 7 && streak > 0 ? "celebrate" : "encourage";
  return { mood, energy: recent.length ? Math.min(100, Math.round(average * 7 + Math.min(streak, 7) * 4)) : 0, today, goal: 3 };
}
