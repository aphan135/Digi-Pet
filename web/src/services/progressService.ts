import { topics } from "../data/topics";
import type { AnswerFeedback, Attempt, Problem, ProblemType } from "../types";
import { supabase } from "./supabase";

const COMPLETED_PROBLEMS_KEY = "digipet-completed-problems";
const ATTEMPTS_KEY = "digipet-attempts";
const PROBLEM_STATUS_KEY = "digipet-problem-status";
const DEMO_KEY = "digipet-demo-mode";
const COMPLETION_EVENT = "digipet-progress-updated";
// Preserve progress for this session when storage is unavailable or full.
const fallback = new Map<string, string>();
let syncPromise: Promise<void> | null = null;

type RemoteAttemptRow = {
  problem_id: string;
  title: string;
  topic: string;
  type: ProblemType;
  difficulty: Attempt["difficulty"];
  score: number;
  is_correct: boolean;
  missed_concepts: string[];
  at: string;
};

type RemoteProgressRow = {
  problem_id: string;
  status: "incomplete" | "completed";
};

function read(key: string): unknown {
  try {
    const raw = fallback.get(key) ?? window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function write(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
    fallback.delete(key);
  } catch { fallback.set(key, raw); }
  window.dispatchEvent(new CustomEvent(COMPLETION_EVENT));
}
export function getCompletedProblemIds(): string[] {
  const value = read(COMPLETED_PROBLEMS_KEY);
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}
export function isProblemCompleted(problemId: string) {
  return getCompletedProblemIds().includes(problemId);
}
export function markProblemCompleted(problemId: string) {
  const next = Array.from(new Set([...getCompletedProblemIds(), problemId]));
  write(COMPLETED_PROBLEMS_KEY, next);
  return next;
}
function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<Attempt>;
  return typeof a.problemId === "string" && a.problemId.length > 0 &&
    typeof a.title === "string" && typeof a.topic === "string" &&
    ["leetcode", "system-design", "math", "science"].includes(a.type ?? "") &&
    ["Easy", "Medium", "Hard"].includes(a.difficulty ?? "") &&
    typeof a.score === "number" && Number.isFinite(a.score) && a.score >= 0 && a.score <= 10 &&
    typeof a.isCorrect === "boolean" && typeof a.at === "string" && Number.isFinite(Date.parse(a.at)) &&
    Array.isArray(a.missedConcepts) && a.missedConcepts.every((c) => typeof c === "string");
}
export function getRealAttempts(): Attempt[] {
  const value = read(ATTEMPTS_KEY);
  return Array.isArray(value) ? value.filter(isAttempt) : [];
}
export function getProblemStatuses(): Record<string, "incomplete" | "completed"> {
  const cached = read(PROBLEM_STATUS_KEY);
  const statuses: Record<string, "incomplete" | "completed"> = {};
  if (cached && typeof cached === "object" && !Array.isArray(cached)) {
    for (const [id, status] of Object.entries(cached)) {
      if (status === "incomplete" || status === "completed") statuses[id] = status;
    }
  }
  for (const attempt of getRealAttempts()) {
    if (statuses[attempt.problemId] !== "completed") {
      statuses[attempt.problemId] = attempt.isCorrect ? "completed" : "incomplete";
    }
  }
  for (const id of getCompletedProblemIds()) statuses[id] = "completed";
  return statuses;
}
function toAttemptRow(attempt: Attempt) {
  return {
    problem_id: attempt.problemId, title: attempt.title, topic: attempt.topic,
    type: attempt.type, difficulty: attempt.difficulty, score: attempt.score,
    is_correct: attempt.isCorrect, missed_concepts: attempt.missedConcepts,
    at: new Date(attempt.at).toISOString(),
  };
}
export async function syncProgress(): Promise<void> {
  if (!supabase) return;
  if (syncPromise) return syncPromise;
  const client = supabase;
  syncPromise = (async () => {
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        const { error } = await client.auth.signInAnonymously();
        if (error) throw error;
      }
      const attempts = getRealAttempts();
      if (attempts.length) {
        const { error } = await client.from("attempts").upsert(attempts.map(toAttemptRow), {
          onConflict: "user_id,problem_id,at", ignoreDuplicates: true,
        });
        if (error) throw error;
      }
      const completedIds = getCompletedProblemIds();
      if (completedIds.length) {
        const { error } = await client.from("problem_progress").upsert(
          completedIds.map((id) => ({ problem_id: id, status: "completed" })),
          { onConflict: "user_id,problem_id" },
        );
        if (error) throw error;
      }
      const [remoteAttempts, progress] = await Promise.all([
        client.from("attempts").select("*").order("at"),
        client.from("problem_progress").select("*"),
      ]);
      if (remoteAttempts.error) throw remoteAttempts.error;
      if (progress.error) throw progress.error;
      const downloaded = ((remoteAttempts.data ?? []) as RemoteAttemptRow[]).map((row) => ({
        problemId: row.problem_id, title: row.title, topic: row.topic,
        type: row.type, difficulty: row.difficulty, score: row.score,
        isCorrect: row.is_correct, missedConcepts: row.missed_concepts, at: row.at,
      })).filter(isAttempt).map((attempt: Attempt) => ({ ...attempt, at: new Date(attempt.at).toISOString() }));
      const merged = new Map([...downloaded, ...getRealAttempts()].map((attempt) => {
        const at = new Date(attempt.at).toISOString();
        return [JSON.stringify([attempt.problemId, at]), { ...attempt, at }];
      }));
      write(ATTEMPTS_KEY, [...merged.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)));
      write(COMPLETED_PROBLEMS_KEY, Array.from(new Set([
        ...getCompletedProblemIds(),
        ...((progress.data ?? []) as RemoteProgressRow[]).filter((row) => row.status === "completed").map((row) => row.problem_id),
      ])));
      const statuses = getProblemStatuses();
      for (const row of (progress.data ?? []) as RemoteProgressRow[]) {
        if (statuses[row.problem_id] !== "completed" && (row.status === "incomplete" || row.status === "completed")) {
          statuses[row.problem_id] = row.status;
        }
      }
      write(PROBLEM_STATUS_KEY, statuses);
    } catch (error) { console.warn("Could not sync progress.", error); }
  })();
  try { await syncPromise; } finally { syncPromise = null; }
}
async function insertAttempt(attempt: Attempt) {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) return;
    const { error: insertError } = await supabase.from("attempts").insert(toAttemptRow(attempt));
    if (insertError) throw insertError;
  } catch (error) { console.warn("Could not save attempt.", error); }
}
export function recordAttempt(problem: Problem, feedback: Pick<AnswerFeedback, "score" | "isCorrect" | "missedConcepts">) {
  const attempt: Attempt = {
    problemId: problem.id, title: problem.title, topic: problem.topic,
    type: problem.type, difficulty: problem.difficulty,
    score: feedback.score, isCorrect: feedback.isCorrect,
    missedConcepts: feedback.missedConcepts, at: new Date().toISOString(),
  };
  if (isAttempt(attempt)) {
    write(ATTEMPTS_KEY, [...getRealAttempts(), attempt]);
    void insertAttempt(attempt);
  }
}
export function isDemoMode() { return read(DEMO_KEY) === true; }
export function setDemoMode(on: boolean) { write(DEMO_KEY, on); }
/** Relative local dates keep the presentation current; demo records are never persisted. */
export function generateDemoAttempts(now = new Date()): Attempt[] {
  const samples: { id: string; type: ProblemType; concept: string }[] = [
    { id: "arrays", type: "leetcode", concept: "Frequency maps" },
    { id: "system-design", type: "system-design", concept: "Cache invalidation" },
    { id: "algebra-2", type: "math", concept: "Factoring polynomials" },
    { id: "biology", type: "science", concept: "Cellular respiration" },
  ];
  const attempts: Attempt[] = [];
  // Deterministic scatter so rest days don't land on the same weekday every week.
  const noise = (n: number) => (n * 37 + 11) % 10;
  for (let ago = 83; ago >= 0; ago--) {
    if (ago > 6 && (noise(ago) < 3 || (ago > 60 && noise(ago) < 6))) continue;
    const count = ago === 0 ? 2 : 1 + (noise(ago * 7) % 4);
    for (let i = 0; i < count; i++) {
      const sample = samples[(ago + i) % samples.length];
      const topic = topics.find((t) => t.id === sample.id)!;
      const at = new Date(now);
      at.setDate(at.getDate() - ago);
      at.setHours(9 + i * 2, 0, 0, 0);
      if (ago === 0) at.setTime(now.getTime() - (count - i) * 1000);
      const score = Math.min(10, 4 + ((ago * 3 + i) % 5) + (ago < 20 ? 2 : 0));
      attempts.push({
        problemId: `demo-${sample.id}-${Math.floor(ago / 3)}-${i}`,
        title: `${topic.name} practice`, topic: topic.name, type: sample.type,
        difficulty: topic.level, score, isCorrect: score >= 7,
        missedConcepts: score < 8 ? [sample.concept] : [], at: at.toISOString(),
      });
    }
  }
  return attempts;
}
export function getAttempts(now = new Date()): Attempt[] {
  return isDemoMode() ? generateDemoAttempts(now) : getRealAttempts();
}
export function subscribeToProgressUpdates(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || [COMPLETED_PROBLEMS_KEY, ATTEMPTS_KEY, PROBLEM_STATUS_KEY, DEMO_KEY].includes(event.key)) {
      if (event.key === null) fallback.clear();
      else fallback.delete(event.key);
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(COMPLETION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(COMPLETION_EVENT, callback);
  };
}
