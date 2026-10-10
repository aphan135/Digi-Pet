import { topics } from "../data/topics";

function Learn() {
  return (
    <section className="content-stack">
      <div>
        <p className="eyebrow">Topics</p>
        <h2>Pick a learning path</h2>
      </div>
      <div className="topic-grid">
        {topics.map((topic) => (
          <article className="topic-card" key={topic.id}>
            <h3>{topic.name}</h3>
            <p>{topic.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Learn;

