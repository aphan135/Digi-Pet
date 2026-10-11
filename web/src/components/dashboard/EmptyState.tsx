interface EmptyStateProps { message: string; onStartChallenge: () => void }
export default function EmptyState({ message, onStartChallenge }: EmptyStateProps) {
  return <div className="dashboard-empty">
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 29h24M12 24v-7m8 7V9m8 15V13" strokeLinecap="round" />
    </svg>
    <p>{message}</p>
    <button className="dashboard-link" onClick={onStartChallenge} type="button">Start a challenge <span aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h13m-5-5 5 5-5 5" /></svg></span></button>
  </div>;
}
