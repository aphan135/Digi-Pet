import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import PetWidget from "./components/pet/PetWidget";
import Challenge from "./pages/Challenge";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import TopicDetail from "./pages/TopicDetail";
import { topics } from "./data/topics";
import type { PageName } from "./types";

function App() {
  const [activePage, setActivePage] = useState<PageName>("learn");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

  function navigate(page: PageName) {
    setActivePage(page);
    setSelectedTopicId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectTopic(topicId: string | null) {
    setSelectedTopicId(topicId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage() {
    if (activePage === "learn") {
      return selectedTopic ? (
        <TopicDetail topic={selectedTopic} onBack={() => selectTopic(null)} />
      ) : (
        <Learn onSelectTopic={selectTopic} />
      );
    }
    if (activePage === "dashboard") return <Dashboard />;
    return <Challenge />;
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={navigate} />
      <main className="page-shell">{renderPage()}</main>
      <PetWidget />
    </div>
  );
}

export default App;
