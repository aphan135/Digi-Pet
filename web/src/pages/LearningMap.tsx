import { topics } from "../data/topics";

interface LearningMapProps {
  onSelectTopic: (topicId: string) => void;
}

function getNodeState(progress: number, index: number) {
  if (progress >= 100) return "completed";
  if (progress > 0 || index === 0) return "current";
  return "locked";
}

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

      <div className="learning-map" aria-label="Learning map">
        <div className="map-start">
          <span>START</span>
        </div>
        <div className="map-path-line" aria-hidden="true" />
        {topics.map((topic, index) => {
          const state = getNodeState(topic.progress, index);
          return (
            <button
              className={`map-node ${state} accent-${topic.accent}`}
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              type="button"
            >
              <span className="map-node-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="map-node-icon" aria-hidden="true">{topic.icon}</span>
              <span className="map-node-copy">
                <strong>{topic.name}</strong>
                <small>{topic.category} / {topic.level}</small>
              </span>
              <span className="map-node-progress">{topic.progress || 0}%</span>
            </button>
          );
        })}
        <div className="map-goal">
          <span>GOAL</span>
          <strong>Interview Ready</strong>
        </div>
      </div>
    </section>
  );
}

export default LearningMap;
