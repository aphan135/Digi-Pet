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
  { x: 15, y: 76, landmark: "cottage", label: "Array Village" },
  { x: 29, y: 61, landmark: "tower", label: "Stack Tower" },
  { x: 45, y: 70, landmark: "dock", label: "Queue Dock" },
  { x: 55, y: 49, landmark: "bridge", label: "Window Bridge" },
  { x: 67, y: 31, landmark: "forest", label: "Graph Grove" },
  { x: 78, y: 25, landmark: "observatory", label: "DP Summit" },
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
            <circle cx="11" cy="13" r="5.5" className="map-sun" />
            <g className="map-clouds">
              <path d="M21 20 C21 17 24 16 26 18 C27 14 33 14 34 19 C37 18 40 20 40 23 L20 23 C19 22 19 21 21 20 Z" />
              <path d="M53 15 C54 12 58 12 59 15 C62 14 65 16 65 19 L50 19 C49 17 50 15 53 15 Z" />
            </g>
            <path d="M0 82 C16 72 30 78 43 69 C59 58 72 63 100 52 L100 100 L0 100 Z" fill="#93c678" />
            <path d="M0 92 C18 86 35 90 54 79 C70 70 82 73 100 64 L100 100 L0 100 Z" fill="#6fa85f" />
            <path d="M63 46 L78 8 L96 46 Z" fill="url(#mapMountain)" />
            <path d="M77.7 9 L83 25 L72.5 25 Z" fill="#ffffff" opacity="0.88" />
            <ellipse cx="42" cy="80" rx="15" ry="7" className="map-lake" />
            <path d="M0 72 C10 66 20 68 30 60 C42 51 50 52 58 44 C66 36 77 38 100 26" className="map-river" />
            <polyline points={routePoints} className="map-route" />
            <g className="map-tree-cluster">
              <circle cx="11" cy="47" r="4" />
              <circle cx="17" cy="42" r="5" />
              <circle cx="22" cy="49" r="4" />
              <circle cx="64" cy="57" r="5" />
              <circle cx="70" cy="53" r="4" />
              <circle cx="75" cy="59" r="5" />
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
