import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import PetWidget from "./components/pet/PetWidget";
import Challenge from "./pages/Challenge";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import TopicDetail from "./pages/TopicDetail";
import { topics } from "./data/topics";
import type { LearningExercise, PageName, Problem, Topic } from "./types";

function exerciseToProblem(exercise: LearningExercise, topic: Topic): Problem {
  return {
    id: exercise.id,
    title: exercise.title,
    difficulty: exercise.difficulty,
    type: topic.category === "Systems" ? "system-design" : "leetcode",
    topic: topic.name,
    prompt: exercise.instructions,
    hint: exercise.hint,
    starterCode: exercise.starterCode,
    expectedOutput: exercise.expectedOutput,
    expectedConcepts: [topic.name, exercise.hint, `Expected output: ${exercise.expectedOutput}`],
  };
}

function App() {
  const [activePage, setActivePage] = useState<PageName>("learn");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

  function navigate(page: PageName) {
    setActivePage(page);
    setSelectedTopicId(null);
    if (page !== "challenge") {
      setSelectedProblem(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectTopic(topicId: string | null) {
    setSelectedTopicId(topicId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startExercise(exercise: LearningExercise, topic: Topic) {
    setSelectedProblem(exerciseToProblem(exercise, topic));
    setActivePage("challenge");
    setSelectedTopicId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage() {
    if (activePage === "learn") {
      return selectedTopic ? (
        <TopicDetail
          topic={selectedTopic}
          onBack={() => selectTopic(null)}
          onStartExercise={startExercise}
        />
      ) : (
        <Learn onSelectTopic={selectTopic} />
      );
    }
    if (activePage === "dashboard") return <Dashboard />;
    return <Challenge problem={selectedProblem ?? undefined} />;
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
