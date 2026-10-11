import { learningContent } from "../data/learningContent";
import type { LearningExercise, Topic } from "../types";

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
  onStartExercise: (exercise: LearningExercise, topic: Topic) => void;
}

const topicDetailCopy = {
  coding: {
    guideTitle: "Three levels of understanding",
    guideText: "Move through the mental model before testing it in code.",
    practiceEyebrow: "Practice lab",
    practiceTitle: "Practice with AI feedback",
    practiceText: "Pick an exercise, write your approach on the Challenge page, then submit it for review.",
  },
  math: {
    guideTitle: "Three steps to mastery",
    guideText: "Learn the idea, practice the method, then explain each step clearly.",
    practiceEyebrow: "Problem set",
    practiceTitle: "Practice with AI feedback",
    practiceText: "Pick a problem, show your work on the Challenge page, then submit it for review.",
  },
  science: {
    guideTitle: "Three ways to understand it",
    guideText: "Start with observations, connect the evidence, then explain the mechanism.",
    practiceEyebrow: "Review prompt",
    practiceTitle: "Practice with AI feedback",
    practiceText: "Pick a prompt, write your explanation on the Challenge page, then submit it for review.",
  },
  systems: {
    guideTitle: "Three levels of design thinking",
    guideText: "Clarify the product, choose the architecture, then reason through tradeoffs.",
    practiceEyebrow: "Design drill",
    practiceTitle: "Practice with AI feedback",
    practiceText: "Pick a drill, write your design approach on the Challenge page, then submit it for review.",
  },
};

function getTopicCopy(topic: Topic) {
  if (topic.category === "Math") return topicDetailCopy.math;
  if (topic.category === "Science") return topicDetailCopy.science;
  if (topic.category === "Systems") return topicDetailCopy.systems;
  return topicDetailCopy.coding;
}

function TopicDetail({ topic, onBack, onStartExercise }: TopicDetailProps) {
  const content = learningContent[topic.id];
  const copy = getTopicCopy(topic);
  const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
  const orderedExercises = [...content.exercises].sort(
    (first, second) => difficultyOrder[first.difficulty] - difficultyOrder[second.difficulty],
  );

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
          <h3 id="understanding-title">{copy.guideTitle}</h3>
          <p>{copy.guideText}</p>
        </div>
        <div className="level-grid">
          {content.levels.map((level, index) => (
            <article className="level-card" key={level.label}>
              <span className="level-index">0{index + 1}</span>
              <p className="level-label">{level.label}</p>
              <h4>{level.title}</h4>
              <p>{level.explanation}</p>
              <div className="level-examples">
                <strong>Examples</strong>
                <ul>
                  {level.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
              <small>{level.takeaway}</small>
            </article>
          ))}
        </div>
      </section>

      {content.exercises.length > 0 && (
        <section className="exercise-section" aria-labelledby="exercise-title">
          <div className="detail-section-heading">
            <p className="eyebrow">{copy.practiceEyebrow}</p>
            <h3 id="exercise-title">{copy.practiceTitle}</h3>
            <p>{copy.practiceText}</p>
          </div>
          <div className="exercise-list">
            {orderedExercises.map((item, index) => (
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
