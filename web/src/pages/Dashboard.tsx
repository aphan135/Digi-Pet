import ProgressCard from "../components/dashboard/ProgressCard";
import StreakCard from "../components/dashboard/StreakCard";
import XPCard from "../components/dashboard/XPCard";

function Dashboard() {
  return (
    <section className="content-stack">
      <div>
        <p className="eyebrow">Overview</p>
        <h2>Your learning dashboard</h2>
      </div>
      <div className="stats-grid">
        <ProgressCard />
        <StreakCard />
        <XPCard />
      </div>
      <div className="profile-panel">
        <p>Pet mood: focused</p>
        <p>Favorite topic: Arrays + Hash Maps</p>
        <p>Next goal: complete one Medium challenge</p>
      </div>
    </section>
  );
}

export default Dashboard;
