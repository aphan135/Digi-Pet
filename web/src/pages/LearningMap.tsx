import { topics } from "../data/topics";
import type { CSSProperties } from "react";

interface LearningMapProps {
  onSelectTopic: (topicId: string) => void;
}

function getNodeState(progress: number, index: number) {
  if (progress >= 100) return "completed";
  if (progress > 0 || index === 0) return "current";
  return "locked";
}

const landmarks = ["cottage", "dock", "tower", "library", "bridge", "observatory", "lab", "market", "camp", "gate"];

function LearningMap({ onSelectTopic }: LearningMapProps) {
  return (
    <section className="map-page">
      <header className="map-hero">
        <div>
          <p className="eyebrow">Skill map</p>
          <h2>Follow the path to interview ready.</h2>
          <p>
            Test route for a gamified learning path. Each node can become a topic,
            review checkpoint, or boss challenge.
          </p>
        </div>
        <div className="map-progress-card">
          <span>Daily quest</span>
          <strong>Complete 1 node</strong>
          <p>Keep the streak alive and move your pet along the path.</p>
        </div>
      </header>

      <div className="learning-map fantasy-map" aria-label="Learning map">
        <div className="map-terrain water" aria-hidden="true" />
        <div className="map-terrain forest one" aria-hidden="true" />
        <div className="map-terrain forest two" aria-hidden="true" />
        <div className="map-terrain hills" aria-hidden="true" />
        <div className="map-road" aria-hidden="true" />

        <div className="map-start landmark-card">
          <span>Start</span>
          <strong>Pet Village</strong>
        </div>
        {topics.map((topic, index) => {
          const state = getNodeState(topic.progress, index);
          return (
            <button
              className={`map-node ${state} accent-${topic.accent} node-${index + 1}`}
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              style={{ "--node-index": index } as CSSProperties}
              type="button"
            >
              <span className={`map-landmark ${landmarks[index % landmarks.length]}`} aria-hidden="true" />
              <span className="map-node-copy">
                <strong>{topic.name}</strong>
                <small>{topic.category} / {topic.level}</small>
              </span>
              <span className="map-node-progress">{topic.progress || 0}%</span>
            </button>
          );
        })}
        <div className="map-goal landmark-card">
          <span>Final summit</span>
          <strong>Interview Ready</strong>
        </div>
      </div>
    </section>
  );
}

export default LearningMap;
