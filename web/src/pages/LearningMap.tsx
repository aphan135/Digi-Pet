import { useEffect, useState } from "react";

interface LearningMapProps {
  onSelectTopic: (topicId: string) => void;
}

type NodeState = "completed" | "current" | "locked" | "reward" | "boss";

interface MapChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  state: NodeState;
  optional?: boolean;
  position: { x: number; y: number };
}

interface MapWorld {
  id: string;
  topicId: string;
  name: string;
  shortName: string;
  description: string;
  theme: "meadow" | "coast" | "peaks" | "forest" | "mountains" | "kingdom" | "labyrinth" | "castle";
  position: { x: number; y: number };
  previewPosition: string;
  completion: number;
  challenges: MapChallenge[];
}

const STORAGE_KEY = "digipet-map-completed-challenges";

const worlds: MapWorld[] = [
  {
    id: "array-meadows",
    topicId: "arrays",
    name: "Array Meadows",
    shortName: "Arrays",
    description: "Start with indexing, traversal, strings, and simple frequency patterns.",
    theme: "meadow",
    position: { x: 24, y: 29 },
    previewPosition: "22% 34%",
    completion: 38,
    challenges: [
      { id: "two-sum", title: "Two Sum", difficulty: "Easy", xp: 40, state: "completed", position: { x: 18, y: 31 } },
      { id: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", xp: 35, state: "completed", position: { x: 24, y: 27 } },
      { id: "product-array", title: "Product of Array Except Self", difficulty: "Medium", xp: 70, state: "current", position: { x: 30, y: 33 } },
      { id: "array-treasure", title: "Bonus Pattern Chest", difficulty: "Easy", xp: 25, state: "reward", optional: true, position: { x: 23, y: 38 } },
    ],
  },
  {
    id: "pointer-coast",
    topicId: "arrays",
    name: "Pointer Coast",
    shortName: "Two Pointers",
    description: "Walk inward, compare ends, and remove repeated scanning.",
    theme: "coast",
    position: { x: 20, y: 64 },
    previewPosition: "18% 66%",
    completion: 0,
    challenges: [
      { id: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", xp: 35, state: "locked", position: { x: 12, y: 66 } },
      { id: "container-water", title: "Container With Most Water", difficulty: "Medium", xp: 80, state: "locked", position: { x: 20, y: 60 } },
      { id: "three-sum", title: "3Sum Boss", difficulty: "Medium", xp: 110, state: "boss", position: { x: 28, y: 68 } },
    ],
  },
  {
    id: "sliding-window-peaks",
    topicId: "sliding-window",
    name: "Sliding Window Peaks",
    shortName: "Sliding Window",
    description: "Keep a moving range of useful state while scanning once.",
    theme: "peaks",
    position: { x: 50, y: 19 },
    previewPosition: "50% 20%",
    completion: 0,
    challenges: [
      { id: "max-average", title: "Maximum Average Subarray", difficulty: "Easy", xp: 45, state: "locked", position: { x: 41, y: 23 } },
      { id: "longest-substring", title: "Longest Substring Without Repeats", difficulty: "Medium", xp: 85, state: "locked", position: { x: 49, y: 28 } },
      { id: "min-window", title: "Minimum Window Boss", difficulty: "Hard", xp: 140, state: "boss", position: { x: 58, y: 24 } },
    ],
  },
  {
    id: "hash-forest",
    topicId: "arrays",
    name: "Hash Forest",
    shortName: "Hash Maps",
    description: "Use lookup tables, counters, and saved state to skip brute force.",
    theme: "forest",
    position: { x: 43, y: 43 },
    previewPosition: "51% 43%",
    completion: 0,
    challenges: [
      { id: "valid-anagram", title: "Valid Anagram", difficulty: "Easy", xp: 35, state: "locked", position: { x: 47, y: 43 } },
      { id: "top-k", title: "Top K Frequent Elements", difficulty: "Medium", xp: 85, state: "locked", position: { x: 53, y: 39 } },
      { id: "hash-chest", title: "Frequency Chest", difficulty: "Easy", xp: 30, state: "reward", optional: true, position: { x: 60, y: 45 } },
    ],
  },
  {
    id: "linked-list-mountains",
    topicId: "queues",
    name: "Linked List Mountains",
    shortName: "Linked Lists",
    description: "Trace pointers carefully through chains, reversals, and cycles.",
    theme: "mountains",
    position: { x: 82, y: 31 },
    previewPosition: "80% 32%",
    completion: 0,
    challenges: [
      { id: "reverse-list", title: "Reverse Linked List", difficulty: "Easy", xp: 50, state: "locked", position: { x: 74, y: 33 } },
      { id: "cycle-list", title: "Linked List Cycle", difficulty: "Easy", xp: 50, state: "locked", position: { x: 82, y: 26 } },
      { id: "merge-k", title: "Merge K Lists Boss", difficulty: "Hard", xp: 150, state: "boss", position: { x: 90, y: 35 } },
    ],
  },
  {
    id: "tree-kingdom",
    topicId: "trees",
    name: "Trees + Graphs",
    shortName: "Trees + Graphs",
    description: "Use traversal, recursion, visited sets, and connected structure.",
    theme: "kingdom",
    position: { x: 81, y: 65 },
    previewPosition: "81% 61%",
    completion: 0,
    challenges: [
      { id: "max-depth", title: "Maximum Depth", difficulty: "Easy", xp: 45, state: "locked", position: { x: 73, y: 60 } },
      { id: "invert-tree", title: "Invert Binary Tree", difficulty: "Easy", xp: 45, state: "locked", position: { x: 81, y: 67 } },
      { id: "tree-boss", title: "Lowest Common Ancestor Boss", difficulty: "Medium", xp: 110, state: "boss", position: { x: 90, y: 69 } },
    ],
  },
  {
    id: "graph-labyrinth",
    topicId: "trees",
    name: "Graph Labyrinth",
    shortName: "Graphs",
    description: "Explore neighbors with BFS, DFS, visited sets, and shortest paths.",
    theme: "labyrinth",
    position: { x: 60, y: 45 },
    previewPosition: "51% 73%",
    completion: 0,
    challenges: [
      { id: "islands", title: "Number of Islands", difficulty: "Medium", xp: 95, state: "locked", position: { x: 43, y: 73 } },
      { id: "clone-graph", title: "Clone Graph", difficulty: "Medium", xp: 100, state: "locked", position: { x: 52, y: 68 } },
      { id: "graph-boss", title: "Course Schedule Boss", difficulty: "Medium", xp: 125, state: "boss", position: { x: 62, y: 77 } },
    ],
  },
  {
    id: "dp-castle",
    topicId: "dynamic-programming",
    name: "Dynamic Programming Castle",
    shortName: "Dynamic Programming",
    description: "Reach the summit by turning repeated work into reusable states.",
    theme: "castle",
    position: { x: 52, y: 73 },
    previewPosition: "51% 40%",
    completion: 0,
    challenges: [
      { id: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", xp: 60, state: "locked", position: { x: 48, y: 50 } },
      { id: "house-robber", title: "House Robber", difficulty: "Medium", xp: 100, state: "locked", position: { x: 54, y: 51 } },
      { id: "dp-final-boss", title: "Final Interview Summit", difficulty: "Hard", xp: 200, state: "boss", position: { x: 52, y: 36 } },
    ],
  },
];

const totalChallenges = worlds.reduce((total, world) => total + world.challenges.length, 0);

function getStoredCompletions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function getChallengeState(challenge: MapChallenge, completedIds: string[]) {
  if (completedIds.includes(challenge.id)) return "completed";
  return challenge.state;
}

function getWorldCompletion(world: MapWorld, completedIds: string[]) {
  const completed = world.challenges.filter(
    (challenge) => getChallengeState(challenge, completedIds) === "completed"
  ).length;

  return Math.round((completed / world.challenges.length) * 100);
}

function NodeIcon({ state }: { state: NodeState }) {
  if (state === "completed") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (state === "locked") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (state === "reward") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 9h14v10H5z" />
        <path d="M3 7h18v4H3z" />
        <path d="M12 7v12" />
        <path d="M9 7c-2.5 0-3-4 0-4 1.5 0 2.5 2 3 4" />
        <path d="M15 7c2.5 0 3-4 0-4-1.5 0-2.5 2-3 4" />
      </svg>
    );
  }

  if (state === "boss") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m4 18 1.5-10 5 4 1.5-7 1.5 7 5-4L20 18z" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m9 6 8 6-8 6z" />
    </svg>
  );
}

interface MapTopicGroupProps {
  world: MapWorld;
  completedIds: string[];
  isSelected: boolean;
  isLocked: boolean;
  selectedChallengeId: string;
  onSelectWorld: (world: MapWorld) => void;
  onSelectChallenge: (world: MapWorld, challenge: MapChallenge) => void;
}

function MapTopicGroup({
  world,
  completedIds,
  isSelected,
  isLocked,
  selectedChallengeId,
  onSelectWorld,
  onSelectChallenge,
}: MapTopicGroupProps) {
  return (
    <div
      className={`map-topic-group ${world.theme} ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}`}
      style={{ left: `${world.position.x}%`, top: `${world.position.y}%` }}
    >
      <button
        className="world-marker"
        onClick={() => onSelectWorld(world)}
        type="button"
      >
        <span className="world-label">{world.shortName}</span>
      </button>
      <div className="topic-node-row" aria-label={`${world.name} challenge nodes`}>
        {world.challenges.map((challenge) => {
          const state = getChallengeState(challenge, completedIds);
          return (
            <button
              aria-label={`${challenge.title}, ${state}`}
              className={`challenge-dot ${state} ${challenge.id === selectedChallengeId ? "selected" : ""}`}
              key={challenge.id}
              onClick={() => onSelectChallenge(world, challenge)}
              type="button"
            >
              <NodeIcon state={state} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LearningMap({ onSelectTopic }: LearningMapProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState(worlds[0].id);
  const [selectedChallengeId, setSelectedChallengeId] = useState("product-array");

  useEffect(() => {
    setCompletedIds(getStoredCompletions());
  }, []);

  const selectedWorld = worlds.find((world) => world.id === selectedWorldId) ?? worlds[0];
  const selectedChallenge =
    selectedWorld.challenges.find((challenge) => challenge.id === selectedChallengeId) ??
    selectedWorld.challenges[0];
  const completedCount = completedIds.length + 2;
  const totalXp = 250 + completedIds.length * 45;
  const currentLevel = Math.max(5, Math.floor(totalXp / 120));
  const currentState = getChallengeState(selectedChallenge, completedIds);
  const selectedCompletion = getWorldCompletion(selectedWorld, completedIds);
  const visibleWorlds = worlds.filter((world) => world.id !== "graph-labyrinth");

  function selectWorld(world: MapWorld) {
    setSelectedWorldId(world.id);
    setSelectedChallengeId(world.challenges[0].id);
  }

  function selectChallenge(world: MapWorld, challenge: MapChallenge) {
    setSelectedWorldId(world.id);
    setSelectedChallengeId(challenge.id);
  }

  function completeChallenge() {
    if (currentState === "locked") return;
    const next = Array.from(new Set([...completedIds, selectedChallenge.id]));
    setCompletedIds(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <section className="codecat-map-page" aria-label="CodeCat DSA adventure map">
      <div className="map-layout-container">
        <div className="map-hud" aria-label="Map progress">
          <div className="hud-stat">
            <span>Streak</span>
            <strong>7</strong>
          </div>
          <div className="hud-stat wide">
            <span>Lv {currentLevel}</span>
            <strong>{totalXp} / 500 XP</strong>
            <div className="hud-xp"><span style={{ width: `${Math.min((totalXp / 500) * 100, 100)}%` }} /></div>
          </div>
          <div className="hud-stat">
            <span>Done</span>
            <strong>{completedCount}/{totalChallenges}</strong>
          </div>
        </div>

        <div className="codecat-map-shell">
          <div className="codecat-map-board">
            <div className="adventure-map-canvas">
            <img
              alt="Illustrated fantasy islands connected by bridges and ocean paths"
              className="adventure-map-image"
              src="/assets/adventure-map.png"
            />

            <button className="compass-card" type="button" aria-label="Map compass">
              <span>N</span>
              <strong>✦</strong>
              <span>S</span>
            </button>

            {visibleWorlds.map((world, index) => (
              <MapTopicGroup
                completedIds={completedIds}
                isLocked={index > 0 && getWorldCompletion(world, completedIds) === 0}
                isSelected={world.id === selectedWorld.id}
                key={world.id}
                onSelectChallenge={selectChallenge}
                onSelectWorld={selectWorld}
                selectedChallengeId={selectedChallenge.id}
                world={world}
              />
            ))}

            </div>
          </div>

          <aside className="map-topic-panel">
          <div
            aria-hidden="true"
            className={`topic-preview ${selectedWorld.theme}`}
            style={{ backgroundImage: `url("/assets/adventure-map.png")`, backgroundPosition: selectedWorld.previewPosition }}
          />
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Current world</span>
              <h2>{selectedWorld.name}</h2>
            </div>
            <span className="status-pill">{currentState === "locked" ? "Locked" : "In Progress"}</span>
          </div>
          <p>{selectedWorld.description}</p>

          <div className="panel-progress">
            <div><span style={{ width: `${selectedCompletion}%` }} /></div>
            <strong>{selectedCompletion}% complete</strong>
          </div>

          <div className="challenge-list" aria-label={`${selectedWorld.name} challenges`}>
            {selectedWorld.challenges.map((challenge, index) => {
              const state = getChallengeState(challenge, completedIds);
              return (
                <button
                  className={`panel-challenge ${state} ${challenge.id === selectedChallenge.id ? "selected" : ""}`}
                  key={challenge.id}
                  onClick={() => selectChallenge(selectedWorld, challenge)}
                  type="button"
                >
                  <span><NodeIcon state={state} /></span>
                  <strong>{index + 1}. {challenge.title}</strong>
                  <small>{challenge.difficulty} · {challenge.xp} XP</small>
                </button>
              );
            })}
          </div>

          <div className="challenge-detail-card">
            <span className="panel-kicker">Selected challenge</span>
            <h3>{selectedChallenge.title}</h3>
            <p>
              {currentState === "locked"
                ? "Complete the previous required nodes to unlock this challenge."
                : "Replay this node or open the topic lesson before starting the challenge."}
            </p>
            <div className="detail-meta compact">
              <span>{selectedChallenge.difficulty}</span>
              <span>{selectedWorld.shortName}</span>
              <span>{selectedChallenge.xp} XP</span>
            </div>
            <div className="panel-actions">
              <button
                className="start-problem-button"
                disabled={currentState === "locked"}
                onClick={() => onSelectTopic(selectedWorld.topicId)}
                type="button"
              >
                Start Problem
              </button>
              <button
                className="complete-demo-button"
                disabled={currentState === "locked"}
                onClick={completeChallenge}
                type="button"
              >
                Mark Complete
              </button>
            </div>
          </div>

          <div className="mini-map">
            <div>
              <strong>Your Journey</strong>
              <span>{completedCount} / {totalChallenges} nodes</span>
            </div>
            <div className="mini-path">
              {visibleWorlds.map((world) => (
                <span
                  className={world.id === selectedWorld.id ? "active" : getWorldCompletion(world, completedIds) > 0 ? "done" : ""}
                  key={world.id}
                  title={world.shortName}
                />
              ))}
            </div>
          </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default LearningMap;
