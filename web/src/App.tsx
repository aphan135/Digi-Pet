import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import PetWidget from "./components/pet/PetWidget";
import Challenge from "./pages/Challenge";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import type { ReactElement } from "react";
import type { PageName } from "./types";

const pages: Record<PageName, ReactElement> = {
  dashboard: <Dashboard />,
  learn: <Learn />,
  challenge: <Challenge />,
  profile: <Profile />,
};

function App() {
  const [activePage, setActivePage] = useState<PageName>("challenge");

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="page-shell">{pages[activePage]}</main>
      <PetWidget />
    </div>
  );
}

export default App;
