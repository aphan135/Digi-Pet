import { useState } from "react";
import { topics } from "../data/topics";

type Category = "All" | "Foundations" | "Patterns";

interface LearnProps {
  onSelectTopic: (topicId: string) => void;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder ? `${remainder}m` : ""}`.trim() : `${minutes}m`;
}

function Learn({ onSelectTopic }: LearnProps) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const filteredTopics = topics.filter((topic) => {
    const matchesCategory = category === "All" || topic.category === category;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      topic.name.toLowerCase().includes(normalizedQuery) ||
      topic.description.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <section className="learn-page">
      <div className="path-library">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Topic library</p>
            <h3>What do you want to learn?</h3>
          </div>
          <label className="path-search">
            <span className="sr-only">Search learning topics</span>
            <span aria-hidden="true">/</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="category-tabs" aria-label="Filter learning topics">
          {(["All", "Foundations", "Patterns"] as Category[]).map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="learning-path-grid">
          {filteredTopics.map((topic) => (
            <article
              className={`learning-card accent-${topic.accent}`}
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectTopic(topic.id);
                }
              }}
              role="link"
              tabIndex={0}
            >
              <div className="learning-card-top">
                <span className="topic-icon" aria-hidden="true">{topic.icon}</span>
                <span className={`difficulty ${topic.level.toLowerCase()}`}>{topic.level}</span>
              </div>
              <div>
                <p className="topic-category">{topic.category}</p>
                <h4>{topic.name}</h4>
                <p className="topic-description">{topic.description}</p>
              </div>
              <div className="topic-meta">
                <span>{topic.lessons} lessons</span>
                <span>{formatDuration(topic.minutes)}</span>
              </div>
              {topic.progress > 0 ? (
                <div className="topic-progress">
                  <div><span style={{ width: `${topic.progress}%` }} /></div>
                  <small>{topic.progress}% complete</small>
                </div>
              ) : (
                <p className="topic-status">Ready to start</p>
              )}
              <span className="open-topic" aria-hidden="true">Open topic &rarr;</span>
            </article>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="empty-library">
            <strong>No topics found</strong>
            <p>Try a broader search or another category.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Learn;
