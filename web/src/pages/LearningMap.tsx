import { useMemo, useState } from "react";
import { topics } from "../data/topics";

interface LearningMapProps {
  onSelectTopic: (topicId: string) => void;
}

function getNodeState(progress: number, index: number) {
  if (progress >= 100) return "completed";
  if (progress > 0 || index === 0) return "current";
  return "locked";
}

const mapLocations = [
  { x: 16, y: 78, landmark: "cottage", label: "Starter Village" },
  { x: 26, y: 66, landmark: "dock", label: "Stack Dock" },
  { x: 38, y: 73, landmark: "bridge", label: "Queue Bridge" },
  { x: 50, y: 58, landmark: "tower", label: "Scale Tower" },
  { x: 37, y: 45, landmark: "market", label: "Window Market" },
  { x: 52, y: 35, landmark: "forest", label: "Graph Grove" },
  { x: 68, y: 42, landmark: "observatory", label: "DP Observatory" },
  { x: 20, y: 54, landmark: "library", label: "Algebra House" },
  { x: 28, y: 38, landmark: "gate", label: "Precalc Gate" },
  { x: 42, y: 28, landmark: "lab", label: "Calc 1 Lab" },
  { x: 58, y: 22, landmark: "camp", label: "Calc 2 Camp" },
  { x: 70, y: 29, landmark: "dock", label: "Trig Pier" },
  { x: 76, y: 18, landmark: "tower", label: "Calc 3 Peak" },
  { x: 62, y: 12, landmark: "library", label: "Discrete Hall" },
  { x: 82, y: 9, landmark: "market", label: "Stats Station" },
  { x: 88, y: 31, landmark: "lab", label: "Science Lab" },
];

const routePoints = mapLocations.map((location) => `${location.x},${location.y}`).join(" ");

function LearningMap({ onSelectTopic }: LearningMapProps) {
  const firstAvailableTopic = useMemo(
    () => topics.find((topic, index) => getNodeState(topic.progress, index) !== "locked") ?? topics[0],
    []
  );
  const [selectedTopicId, setSelectedTopicId] = useState(firstAvailableTopic.id);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? firstAvailableTopic;
  const selectedIndex = topics.findIndex((topic) => topic.id === selectedTopic.id);
  const selectedLocation = mapLocations[selectedIndex] ?? mapLocations[0];
  const selectedState = getNodeState(selectedTopic.progress, selectedIndex);

  return (
    <section className="map-page">
      <header className="map-hero">
        <div>
          <p className="eyebrow">Skill map</p>
          <h2>Follow the path to interview ready.</h2>
          <p>
            Test route for a gamified learning path. Select a landmark to preview
            the topic, then jump into the lesson when it is available.
          </p>
        </div>
        <div className="map-progress-card">
          <span>Daily quest</span>
          <strong>Complete 1 node</strong>
          <p>Keep the streak alive and move your pet along the path.</p>
        </div>
      </header>

      <div className="interactive-map-layout">
        <div className="learning-map fantasy-map interactive-fantasy-map" aria-label="Interactive DSA learning map">
          <svg className="map-landscape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="mapSky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#bfe7ff" />
                <stop offset="54%" stopColor="#f9e7b8" />
                <stop offset="100%" stopColor="#d9b56f" />
              </linearGradient>
              <linearGradient id="mapMountain" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dfe8eb" />
                <stop offset="100%" stopColor="#65787f" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#mapSky)" />
            <path d="M0 82 C16 72 30 78 43 69 C59 58 72 63 100 52 L100 100 L0 100 Z" fill="#8dbf72" />
            <path d="M0 92 C18 86 35 90 54 79 C70 70 82 73 100 64 L100 100 L0 100 Z" fill="#6fa85f" />
            <path d="M68 44 L79 9 L91 44 Z" fill="url(#mapMountain)" />
            <path d="M78.8 10 L82.8 24 L75.2 24 Z" fill="#ffffff" opacity="0.86" />
            <path d="M0 72 C10 66 20 68 30 60 C42 51 50 52 58 44 C66 36 77 38 100 26" className="map-river" />
            <polyline points={routePoints} className="map-route" />
            <g className="map-tree-cluster">
              <circle cx="11" cy="47" r="4" />
              <circle cx="17" cy="42" r="5" />
              <circle cx="22" cy="49" r="4" />
              <circle cx="64" cy="62" r="5" />
              <circle cx="70" cy="58" r="4" />
              <circle cx="75" cy="64" r="5" />
            </g>
          </svg>

          <div className="map-start landmark-card">
            <span>Start</span>
            <strong>Pet Village</strong>
          </div>

          {topics.map((topic, index) => {
            const state = getNodeState(topic.progress, index);
            const location = mapLocations[index] ?? mapLocations[0];
            const isSelected = topic.id === selectedTopic.id;
            return (
              <button
                aria-label={`${topic.name}, ${location.label}`}
                className={`map-pin ${state} ${isSelected ? "selected" : ""} accent-${topic.accent}`}
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                type="button"
              >
                <span className={`map-landmark ${location.landmark}`} aria-hidden="true" />
                <span className="pin-label">{topic.name}</span>
              </button>
            );
          })}

          <div className="map-goal landmark-card">
            <span>Final summit</span>
            <strong>Interview Ready</strong>
          </div>
        </div>

        <aside className={`map-detail-panel accent-${selectedTopic.accent}`}>
          <span className="detail-location">{selectedLocation.label}</span>
          <h3>{selectedTopic.name}</h3>
          <p>{selectedTopic.description}</p>
          <div className="detail-meta">
            <span>{selectedTopic.category}</span>
            <span>{selectedTopic.level}</span>
            <span>{selectedTopic.lessons} lessons</span>
          </div>
          <div className="detail-progress">
            <div><span style={{ width: `${selectedTopic.progress}%` }} /></div>
            <small>{selectedTopic.progress}% complete</small>
          </div>
          <button
            className="map-start-topic"
            disabled={selectedState === "locked"}
            onClick={() => onSelectTopic(selectedTopic.id)}
            type="button"
          >
            {selectedState === "locked" ? "Locked for now" : "Start this topic"}
          </button>
          <p className="detail-hint">Select nodes on the landscape to preview each stop.</p>
        </aside>
      </div>
    </section>
  );
}

export default LearningMap;
