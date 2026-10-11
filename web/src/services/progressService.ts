const COMPLETED_PROBLEMS_KEY = "digipet-completed-problems";
const COMPLETION_EVENT = "digipet-progress-updated";

export function getCompletedProblemIds() {
  try {
    const raw = window.localStorage.getItem(COMPLETED_PROBLEMS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isProblemCompleted(problemId: string) {
  return getCompletedProblemIds().includes(problemId);
}

export function markProblemCompleted(problemId: string) {
  const next = Array.from(new Set([...getCompletedProblemIds(), problemId]));
  window.localStorage.setItem(COMPLETED_PROBLEMS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(COMPLETION_EVENT, { detail: next }));
  return next;
}

export function subscribeToProgressUpdates(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === COMPLETED_PROBLEMS_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(COMPLETION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(COMPLETION_EVENT, callback);
  };
}
