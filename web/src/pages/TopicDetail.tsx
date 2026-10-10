import { learningContent } from "../data/learningContent";
import type { LearningExercise, Topic } from "../types";

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
  onStartExercise: (exercise: LearningExercise, topic: Topic) => void;
}

function TopicDetail({ topic, onBack, onStartExercise }: TopicDetailProps) {
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

      {content.exercises.length > 0 && (
        <section className="exercise-section" aria-labelledby="exercise-title">
          <div className="detail-section-heading">
            <p className="eyebrow">Practice lab</p>
            <h3 id="exercise-title">Practice with AI feedback</h3>
            <p>Pick an exercise, write your approach on the Challenge page, then submit it for review.</p>
          </div>
          <div className="exercise-list">
            {content.exercises.map((item, index) => (
              <article className="exercise-card" key={item.id}>
                <div className="exercise-card-main">
                  <span className="exercise-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="exercise-title">
                    <strong>{item.title}</strong>
                    <small>{item.instructions}</small>
                  </div>
                </div>
                <span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                <button onClick={() => onStartExercise(item, topic)} type="button">
                  Start challenge
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

export default TopicDetail;
