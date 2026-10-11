import { useEffect, useMemo, useRef, useState } from "react";
import { learningContent } from "../data/learningContent";
import { topics } from "../data/topics";
import { getCompletedProblemIds, subscribeToProgressUpdates } from "../services/progressService";
import type { LearningExercise, ProblemDifficulty, Topic } from "../types";

interface LearningMapProps {
  onStartExercise: (exercise: LearningExercise, topic: Topic) => void;
}

interface MapWorld {
  id: string;
  topicId: string;
  name: string;
  shortName: string;
  description: string;
  theme: "meadow" | "coast" | "peaks" | "forest" | "kingdom" | "castle";
  position: { x: number; y: number };
  previewPosition: string;
}

interface ViewportSize {
  width: number;
  height: number;
}

const worlds: MapWorld[] = [
  {
    id: "array-meadows",
    topicId: "arrays",
    name: "Array Meadows",
    shortName: "Arrays + Hashmaps",
    description: "Start with indexing, traversal, lookup tables, and frequency patterns.",
    theme: "meadow",
    position: { x: 21, y: 25 },
    previewPosition: "21% 25%",
  },
  {
    id: "two-pointer-grove",
    topicId: "two-pointers",
    name: "Two Pointer Grove",
    shortName: "Two Pointers",
    description: "Move paired indices across strings and arrays without repeated scans.",
    theme: "kingdom",
    position: { x: 84, y: 28 },
    previewPosition: "84% 28%",
  },
  {
    id: "stacks-tower",
    topicId: "stacks",
    name: "Stack Tower",
    shortName: "Stacks",
    description: "Use last-in, first-out state for nested work and undo history.",
    theme: "forest",
    position: { x: 43, y: 43 },
    previewPosition: "43% 43%",
  },
  {
    id: "queue-coast",
    topicId: "queues",
    name: "Queue Coast",
    shortName: "Queues",
    description: "Process work in first-in, first-out order.",
    theme: "forest",
    position: { x: 65, y: 43 },
    previewPosition: "65% 43%",
  },
  {
    id: "linked-list-coast",
    topicId: "linked-lists",
    name: "Linked List Coast",
    shortName: "Linked Lists",
    description: "Trace pointer chains through reversals, cycles, and ordered merges.",
    theme: "coast",
    position: { x: 17, y: 64 },
    previewPosition: "17% 64%",
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
  },
  {
    id: "tree-kingdom",
    topicId: "trees",
    name: "Trees + Graphs",
    shortName: "Trees + Graphs",
    description: "Use traversal, recursion, visited sets, and connected structure.",
    theme: "kingdom",
    position: { x: 82, y: 65 },
    previewPosition: "82% 65%",
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
  },
];

const difficultyOrder: Record<ProblemDifficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

function getTopicProblems(topicId: string) {
  return [...(learningContent[topicId]?.exercises ?? [])]
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    .slice(0, 8);
}

function getProblemXp(difficulty: ProblemDifficulty) {
  if (difficulty === "Easy") return 35;
  if (difficulty === "Medium") return 70;
  return 120;
}

function getTopicById(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}

function getCompletedCount(problems: LearningExercise[], completedIds: string[]) {
  return problems.filter((problem) => completedIds.includes(problem.id)).length;
}

function getWorldCompletion(world: MapWorld, completedIds: string[]) {
  const problems = getTopicProblems(world.topicId);
  if (problems.length === 0) return 0;
  return Math.round((getCompletedCount(problems, completedIds) / problems.length) * 100);
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function segmentPath(index: number) {
  const gap = 4;
  const startAngle = index * 45 + gap / 2;
  const endAngle = (index + 1) * 45 - gap / 2;
  const outerStart = polarToCartesian(50, 50, 45, endAngle);
  const outerEnd = polarToCartesian(50, 50, 45, startAngle);
  const innerStart = polarToCartesian(50, 50, 27, endAngle);
  const innerEnd = polarToCartesian(50, 50, 27, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A 45 45 0 0 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A 27 27 0 0 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function difficultyColor(difficulty: ProblemDifficulty) {
  if (difficulty === "Easy") return "#65C99C";
  if (difficulty === "Medium") return "#F6B94D";
  return "#AF89E8";
}

function ProgressWheel({
  problems,
  completedIds,
}: {
  problems: LearningExercise[];
  completedIds: string[];
}) {
  const completed = getCompletedCount(problems, completedIds);
  const wheelProblems = [
    ...problems,
    ...Array.from({ length: Math.max(0, 8 - problems.length) }, (_, index) => ({
      id: `empty-${index}`,
      difficulty: "Easy" as ProblemDifficulty,
    })),
  ].slice(0, 8);

  return (
    <svg className="progress-wheel" viewBox="0 0 100 100" aria-hidden="true">
      {wheelProblems.map((problem, index) => {
        const isRealProblem = problems.some((item) => item.id === problem.id);
        const isCompleted = isRealProblem && completedIds.includes(problem.id);
        return (
          <path
            d={segmentPath(index)}
            fill={isCompleted ? difficultyColor(problem.difficulty) : "#DADCE5"}
            key={problem.id}
          />
        );
      })}
      <circle className="progress-wheel-center" cx="50" cy="50" r="23" />
      <text className="progress-wheel-count" x="50" y="54">
        {completed}/8
      </text>
    </svg>
  );
}

interface MapTopicGroupProps {
  world: MapWorld;
  completedIds: string[];
  problems: LearningExercise[];
  isSelected: boolean;
  onSelectWorld: (world: MapWorld) => void;
}

function MapTopicGroup({
  world,
  completedIds,
  problems,
  isSelected,
  onSelectWorld,
}: MapTopicGroupProps) {
  return (
    <div
      className={`map-topic-group ${world.theme} ${isSelected ? "selected" : ""}`}
      style={{ left: `${world.position.x}%`, top: `${world.position.y}%` }}
    >
      <button
        className="world-marker"
        onClick={(event) => {
          event.stopPropagation();
          onSelectWorld(world);
        }}
        type="button"
      >
        <span className="world-label">{world.shortName}</span>
      </button>
      <button
        aria-label={`${world.name} progress wheel`}
        className="progress-wheel-button"
        onClick={(event) => {
          event.stopPropagation();
          onSelectWorld(world);
        }}
        type="button"
      >
        <ProgressWheel completedIds={completedIds} problems={problems} />
      </button>
    </div>
  );
}

function LearningMap({ onStartExercise }: LearningMapProps) {
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState(worlds[0].id);
  const [selectedProblemId, setSelectedProblemId] = useState(getTopicProblems(worlds[0].topicId)[0]?.id ?? "");
  const [isMapZoomed, setIsMapZoomed] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });

  useEffect(() => {
    const refreshCompletions = () => setCompletedIds(getCompletedProblemIds());

    refreshCompletions();
    return subscribeToProgressUpdates(refreshCompletions);
  }, []);

  useEffect(() => {
    const viewport = mapViewportRef.current;
    if (!viewport) return undefined;

    const updateViewportSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMapZoomed(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectedWorld = worlds.find((world) => world.id === selectedWorldId) ?? worlds[0];
  const selectedTopic = getTopicById(selectedWorld.topicId);
  const selectedProblems = getTopicProblems(selectedWorld.topicId);
  const selectedProblem =
    selectedProblems.find((problem) => problem.id === selectedProblemId) ?? selectedProblems[0];
  const mapProblemIds = worlds.flatMap((world) => getTopicProblems(world.topicId).map((problem) => problem.id));
  const completedCount = completedIds.filter((id) => mapProblemIds.includes(id)).length;
  const selectedCompletion = getWorldCompletion(selectedWorld, completedIds);
  const totalChallenges = mapProblemIds.length;
  const totalXp = 250 + completedIds.reduce((total, id) => {
    const problem = worlds.flatMap((world) => getTopicProblems(world.topicId)).find((item) => item.id === id);
    return problem ? total + getProblemXp(problem.difficulty) : total;
  }, 0);
  const currentLevel = Math.max(5, Math.floor(totalXp / 120));
  const zoomScale = viewportSize.width > 0 && viewportSize.width < 720 ? 1.5 : 1.9;
  const cameraTransform = useMemo(() => {
    if (!isMapZoomed || viewportSize.width === 0 || viewportSize.height === 0) {
      return "translate3d(0, 0, 0) scale(1)";
    }

    const scale = zoomScale;
    const targetX = (selectedWorld.position.x / 100) * viewportSize.width;
    const targetY = (selectedWorld.position.y / 100) * viewportSize.height;
    const rawX = viewportSize.width / 2 - targetX * scale;
    const rawY = viewportSize.height / 2 - targetY * scale;
    const minX = viewportSize.width - viewportSize.width * scale;
    const minY = viewportSize.height - viewportSize.height * scale;
    const translateX = Math.min(0, Math.max(minX, rawX));
    const translateY = Math.min(0, Math.max(minY, rawY));

    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }, [isMapZoomed, selectedWorld.position.x, selectedWorld.position.y, viewportSize.height, viewportSize.width, zoomScale]);

  function selectWorld(world: MapWorld) {
    setSelectedWorldId(world.id);
    setSelectedProblemId(getTopicProblems(world.topicId)[0]?.id ?? "");
    setIsMapZoomed(true);
  }

  function selectProblem(world: MapWorld, problem: LearningExercise) {
    setSelectedWorldId(world.id);
    setSelectedProblemId(problem.id);
  }

  function startSelectedProblem() {
    if (!selectedProblem || !selectedTopic) return;
    onStartExercise(selectedProblem, selectedTopic);
  }

  function zoomOutMap() {
    setIsMapZoomed(false);
  }

  return (
    <section className="codecat-map-page" aria-label="CodeCat DSA adventure map">
      <div className="map-layout-container">
        <div className="codecat-map-shell" aria-label="Adventure map">
          <div className="map-primary-column">
            <div className="codecat-map-board">
              <div
                className={`adventure-map-canvas ${isMapZoomed ? "zoomed" : ""}`}
                onClick={zoomOutMap}
                ref={mapViewportRef}
              >
                <div
                  className="adventure-map-world"
                  style={{ transform: cameraTransform }}
                >
                  <img
                    alt="Illustrated fantasy islands connected by bridges and ocean paths"
                    className="adventure-map-image"
                    src="/assets/adventure-map.png"
                  />

                  {worlds.map((world) => (
                    <MapTopicGroup
                      completedIds={completedIds}
                      isSelected={world.id === selectedWorld.id}
                      key={world.id}
                      onSelectWorld={selectWorld}
                      problems={getTopicProblems(world.topicId)}
                      world={world}
                    />
                  ))}
                </div>

                <button
                  className="compass-card"
                  onClick={(event) => event.stopPropagation()}
                  type="button"
                  aria-label="Map compass"
                >
                  <span>N</span>
                  <strong>*</strong>
                  <span>S</span>
                </button>
              </div>
            </div>

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
                <span className="status-pill">{getCompletedCount(selectedProblems, completedIds)}/8 done</span>
              </div>
              <p>{selectedWorld.description}</p>

              <div className="panel-progress">
                <div><span style={{ width: `${selectedCompletion}%` }} /></div>
                <strong>{selectedCompletion}% complete</strong>
              </div>

              <div className="challenge-list grouped" aria-label={`${selectedWorld.name} problems`}>
                {(["Easy", "Medium", "Hard"] as ProblemDifficulty[]).map((difficulty) => (
                  <div className="challenge-group" key={difficulty}>
                    <h3>{difficulty}</h3>
                    {selectedProblems
                      .filter((problem) => problem.difficulty === difficulty)
                      .map((problem, index) => {
                        const isCompleted = completedIds.includes(problem.id);
                        return (
                          <button
                            className={`panel-challenge ${isCompleted ? "completed" : ""} ${problem.id === selectedProblem?.id ? "selected" : ""}`}
                            key={problem.id}
                            onClick={() => selectProblem(selectedWorld, problem)}
                            type="button"
                          >
                            <span>{index + 1}</span>
                            <strong>{problem.title}</strong>
                            <small>{problem.difficulty} - {getProblemXp(problem.difficulty)} XP</small>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>

              {selectedProblem && (
                <div className="challenge-detail-card">
                  <span className="panel-kicker">Selected challenge</span>
                  <h3>{selectedProblem.title}</h3>
                  <p className="selected-challenge-description">{selectedProblem.instructions}</p>
                  <div className="detail-meta compact">
                    <span>{selectedProblem.difficulty}</span>
                    <span>{selectedWorld.shortName}</span>
                    <span>{getProblemXp(selectedProblem.difficulty)} XP</span>
                  </div>
                  <div className="panel-actions">
                    <button className="start-problem-button" onClick={startSelectedProblem} type="button">
                      Start Problem
                    </button>
                  </div>
                </div>
              )}

              <div className="mini-map">
                <div>
                  <strong>Your Journey</strong>
                  <span>{completedCount} / {totalChallenges} problems</span>
                </div>
                <div className="mini-path">
                  {worlds.map((world) => (
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
