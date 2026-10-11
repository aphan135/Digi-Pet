import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import PetWidget from "./components/pet/PetWidget";
import Challenge from "./pages/Challenge";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import LearningMap from "./pages/LearningMap";
import TopicDetail from "./pages/TopicDetail";
import { topics } from "./data/topics";
import {
  loadWebsiteReminderSettings,
  nextWebsiteReminderTime,
  saveWebsiteReminderSettings,
  type WebsiteReminderSettings,
} from "./services/webReminderSettings";
import type { LearningExercise, PageName, Problem, Topic } from "./types";

function topicToProblemType(topic: Topic): Problem["type"] {
  if (topic.category === "Systems") return "system-design";
  if (topic.category === "Math") return "math";
  if (topic.category === "Science") return "science";
  return "leetcode";
}

function exerciseToProblem(exercise: LearningExercise, topic: Topic): Problem {
  return {
    id: exercise.id,
    title: exercise.title,
    difficulty: exercise.difficulty,
    type: topicToProblemType(topic),
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
  const [websiteReminder, setWebsiteReminder] = useState<WebsiteReminderSettings>(() =>
    loadWebsiteReminderSettings(),
  );
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

  useEffect(() => {
    if (!websiteReminder.enabled) return;

    const now = Date.now();
    const nextAlertAt = websiteReminder.nextAlertAt > now
      ? websiteReminder.nextAlertAt
      : nextWebsiteReminderTime(websiteReminder.intervalMinutes, now);

    if (nextAlertAt !== websiteReminder.nextAlertAt) {
      setWebsiteReminder(saveWebsiteReminderSettings({ ...websiteReminder, nextAlertAt }));
      return;
    }

    const timer = window.setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Digi-Pet coding challenge", {
          body: websiteReminder.message,
        });
        notification.onclick = () => {
          window.focus();
          navigate("challenge");
          notification.close();
        };
      } else {
        window.alert(websiteReminder.message);
      }

      setWebsiteReminder(saveWebsiteReminderSettings({
        ...websiteReminder,
        nextAlertAt: nextWebsiteReminderTime(websiteReminder.intervalMinutes),
      }));
    }, Math.max(0, nextAlertAt - now));

    return () => window.clearTimeout(timer);
  }, [websiteReminder]);

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

  async function saveWebsiteReminder(nextSettings: WebsiteReminderSettings) {
    if (
      nextSettings.enabled &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      await Notification.requestPermission();
    }

    const savedSettings = saveWebsiteReminderSettings({
      ...nextSettings,
      nextAlertAt: nextSettings.enabled
        ? nextWebsiteReminderTime(nextSettings.intervalMinutes)
        : 0,
    });
    setWebsiteReminder(savedSettings);
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
    if (activePage === "map") {
      return selectedTopic ? (
        <TopicDetail
          topic={selectedTopic}
          onBack={() => selectTopic(null)}
          onStartExercise={startExercise}
        />
      ) : (
        <LearningMap onStartExercise={startExercise} />
      );
    }
    if (activePage === "dashboard") return <Dashboard
      onOpenTopic={(topicId) => { navigate("learn"); selectTopic(topicId); }}
      onStartChallenge={() => navigate("challenge")}
    />;
    return <Challenge problem={selectedProblem ?? undefined} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onNavigate={navigate}
        onSaveWebsiteReminder={saveWebsiteReminder}
        websiteReminder={websiteReminder}
      />
      <main className="page-shell">{renderPage()}</main>
      <PetWidget />
    </div>
  );
}

export default App;
