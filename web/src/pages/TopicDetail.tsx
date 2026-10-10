import ExerciseLab from "../components/learn/ExerciseLab";
import { learningContent } from "../data/learningContent";
import type { Topic } from "../types";

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
}

function TopicDetail({ topic, onBack }: TopicDetailProps) {
  const content = learningContent[topic.id];

  return (
    <section className={`topic-detail accent-${topic.accent}`}>
      <button className="back-to-topics" onClick={onBack} type="button">
        <span aria-hidden="true">&larr;</span> All topics
      </button>

      <header className="topic-detail-hero">
        <div>
          <p className="eyebrow">{topic.category} / Learning path</p>
          <h2>{topic.name}</h2>
          <p>{content.overview}</p>
          <div className="detail-meta">
            <span>{topic.lessons} lessons</span>
            <span>{topic.minutes} minutes</span>
            <span>{content.exercises.length} code labs</span>
          </div>
        </div>
        <div className="concept-card">
          <span className="topic-icon" aria-hidden="true">{topic.icon}</span>
          <p className="eyebrow">Think of it like this</p>
          <strong>{content.analogy}</strong>
        </div>
      </header>

      <section className="understanding-section" aria-labelledby="understanding-title">
        <div className="detail-section-heading">
          <p className="eyebrow">Concept guide</p>
          <h3 id="understanding-title">Three levels of understanding</h3>
          <p>Move through the mental model before testing it in code.</p>
        </div>
        <div className="level-grid">
          {content.levels.map((level, index) => (
            <article className="level-card" key={level.label}>
              <span className="level-index">0{index + 1}</span>
              <p className="level-label">{level.label}</p>
              <h4>{level.title}</h4>
              <p>{level.explanation}</p>
              <small>{level.takeaway}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="exercise-section" aria-labelledby="exercise-title">
        <div className="detail-section-heading">
          <p className="eyebrow">Practice lab</p>
          <h3 id="exercise-title">Learn by building</h3>
          <p>Open an exercise, edit the starter code, then run it in the browser.</p>
        </div>
        <div className="exercise-list">
          {content.exercises.map((item, index) => (
            <ExerciseLab exercise={item} index={index} key={item.id} />
          ))}
        </div>
      </section>
    </section>
  );
}

export default TopicDetail;
