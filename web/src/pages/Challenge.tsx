import { useEffect, useState, type KeyboardEvent } from "react";
import {
  codeLanguageEntries,
  codeRuntimes,
  createStarterCode,
  getCodeContract,
  type CodeLanguage,
} from "../data/codeRuntimes";
import { checkAnswer } from "../services/answerService";
import { runCode, type CodeRunResult } from "../services/codeRunnerService";
import { celebratePet } from "../services/petCelebration";
import { getFeaturedProblem } from "../services/problemService";
import { getProblemStatuses, markProblemCompleted, recordAttempt, subscribeToProgressUpdates } from "../services/progressService";
import type { AnswerFeedback, Problem, ProblemType } from "../types";

const subjectFilters: { id: ProblemType | "all"; label: string }[] = [
  { id: "all", label: "All subjects" },
  { id: "leetcode", label: "Coding" },
  { id: "system-design", label: "System design" },
  { id: "math", label: "Math" },
  { id: "science", label: "Science" },
];

function getSubjectLabel(type: ProblemType) {
  return subjectFilters.find((filter) => filter.id === type)?.label ?? type;
}

function isCodingProblem(problem: Problem) {
  return problem.type === "leetcode";
}

interface ChallengeProps {
  problem?: Problem;
}

const defaultLanguage: CodeLanguage = "javascript";

function latestVersion(language: CodeLanguage) {
  const versions = codeRuntimes[language].versions;
  return versions[versions.length - 1];
}

function Challenge({ problem }: ChallengeProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(problem ?? getFeaturedProblem());
  const [language, setLanguage] = useState<CodeLanguage>(defaultLanguage);
  const [runtimeVersion, setRuntimeVersion] = useState(latestVersion(defaultLanguage));
  const [codeDrafts, setCodeDrafts] = useState<Partial<Record<CodeLanguage, string>>>({
    [defaultLanguage]: createStarterCode(problem ?? getFeaturedProblem(), defaultLanguage),
  });
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [runError, setRunError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [statuses, setStatuses] = useState(getProblemStatuses);

  useEffect(() => {
    const refreshStatuses = () => setStatuses(getProblemStatuses());
    refreshStatuses();
    return subscribeToProgressUpdates(refreshStatuses);
  }, []);

  useEffect(() => {
    if (!problem) return;
    setSelectedProblem(problem);
    setLanguage(defaultLanguage);
    setRuntimeVersion(latestVersion(defaultLanguage));
    setCodeDrafts({ [defaultLanguage]: createStarterCode(problem, defaultLanguage) });
    setRunResult(null);
    setRunError("");
    setAnswer("");
    setFeedback(null);
    setError("");
  }, [problem]);

  const runtime = codeRuntimes[language];
  const sourceCode = codeDrafts[language] ?? createStarterCode(selectedProblem, language);

  function handleLanguageChange(nextLanguage: CodeLanguage) {
    setLanguage(nextLanguage);
    setRuntimeVersion(latestVersion(nextLanguage));
    setCodeDrafts((current) => ({
      ...current,
      [nextLanguage]: current[nextLanguage] ?? createStarterCode(selectedProblem, nextLanguage),
    }));
    setRunResult(null);
    setRunError("");
  }

  function handleCodeEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab" && event.key !== "Enter") return;
    event.preventDefault();

    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const indentUnit = language === "javascript" || language === "typescript" || language === "react"
      ? "  "
      : "    ";
    let nextCode = sourceCode;
    let nextStart = start;
    let nextEnd = end;

    if (event.key === "Enter") {
      const lineStart = sourceCode.lastIndexOf("\n", start - 1) + 1;
      const lineBeforeCursor = sourceCode.slice(lineStart, start);
      const currentIndent = lineBeforeCursor.match(/^\s*/)?.[0] ?? "";
      const opensBlock = lineBeforeCursor.trimEnd().endsWith("{");
      const opensPythonBlock = language === "python" && lineBeforeCursor.trimEnd().endsWith(":");

      if (opensBlock) {
        const prefix = sourceCode.slice(0, start);
        const suffix = sourceCode.slice(start);
        const openBalance = (prefix.match(/{/g)?.length ?? 0) - (prefix.match(/}/g)?.length ?? 0);
        const availableClosers = (suffix.match(/}/g)?.length ?? 0) - (suffix.match(/{/g)?.length ?? 0);
        const needsClosingBrace = availableClosers < openBalance;
        const insertion = `\n${currentIndent}${indentUnit}${needsClosingBrace ? `\n${currentIndent}}` : ""}`;
        nextCode = sourceCode.slice(0, start) + insertion + sourceCode.slice(end);
        nextStart = start + currentIndent.length + indentUnit.length + 1;
        nextEnd = nextStart;
      } else {
        const nextIndent = currentIndent + (opensPythonBlock ? indentUnit : "");
        const insertion = `\n${nextIndent}`;
        nextCode = sourceCode.slice(0, start) + insertion + sourceCode.slice(end);
        nextStart = start + insertion.length;
        nextEnd = nextStart;
      }
    } else if (event.shiftKey) {
      const lineStart = sourceCode.lastIndexOf("\n", start - 1) + 1;
      const indentation = sourceCode.slice(lineStart).match(new RegExp(`^(\\t| {1,${indentUnit.length}})`))?.[0] ?? "";
      if (!indentation) return;

      nextCode = sourceCode.slice(0, lineStart) + sourceCode.slice(lineStart + indentation.length);
      nextStart = Math.max(lineStart, start - indentation.length);
      nextEnd = Math.max(nextStart, end - indentation.length);
    } else {
      const indentation = indentUnit;
      nextCode = sourceCode.slice(0, start) + indentation + sourceCode.slice(start);
      nextStart = start + indentation.length;
      nextEnd = end + indentation.length;
    }

    setCodeDrafts((current) => ({ ...current, [language]: nextCode }));
    setRunResult(null);
    setRunError("");
    window.requestAnimationFrame(() => editor.setSelectionRange(nextStart, nextEnd));
  }

  async function handleRunCode() {
    setIsRunning(true);
    setRunResult(null);
    setRunError("");
    try {
      const result = await runCode({
        sourceCode,
        languageId: runtimeVersion.languageId,
        language,
        expectedOutput: selectedProblem.expectedOutput,
      });
      setRunResult(result);
      recordAttempt(selectedProblem, {
        isCorrect: result.status === "passed",
        score: result.status === "passed" ? 10 : result.status === "failed" ? 5 : 0,
        missedConcepts: [],
      });
      if (result.status === "passed") {
        markProblemCompleted(selectedProblem.id);
        celebratePet();
      }
    } catch (caughtError) {
      setRunError(caughtError instanceof Error ? caughtError.message : "Could not run code.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setFeedback(null);
    setIsChecking(true);

    try {
      const result = await checkAnswer(selectedProblem, answer);
      setFeedback(result);
      recordAttempt(selectedProblem, result);
      if (result.isCorrect) {
        markProblemCompleted(selectedProblem.id);
        celebratePet();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not check answer.");
    } finally {
      setIsChecking(false);
    }
  }

  const showCodePanels = isCodingProblem(selectedProblem);
  const codeContract = getCodeContract(selectedProblem);
  const answerPlaceholder =
    selectedProblem.type === "math"
      ? "Show your work step by step, including formulas, substitutions, and the final answer..."
      : "Explain your reasoning, show your work, or write your solution idea...";

  if (showCodePanels) {
    return (
      <section className="challenge-layout coding-challenge">
        <div className="problem-panel coding-instructions">
          <p className="eyebrow">{getSubjectLabel(selectedProblem.type)}</p>
          <h2>{selectedProblem.title}</h2>
          <span className="status-pill">
            {statuses[selectedProblem.id] === "completed" ? "Completed" : statuses[selectedProblem.id] === "incomplete" ? "Incomplete" : "Not attempted"}
          </span>
          <span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>
            {selectedProblem.difficulty}
          </span>
          <p>{selectedProblem.prompt}</p>
          <div className="code-contract" aria-label="Exercise code contract">
            <div>
              <span>Implement</span>
              <strong>{codeContract.signature}</strong>
            </div>
            <div>
              <span>Test call</span>
              <code>{codeContract.testCall}</code>
            </div>
          </div>
          {selectedProblem.expectedOutput && (
            <div className="expected-output-panel">
              <strong>Expected output</strong>
              <code>{selectedProblem.expectedOutput}</code>
            </div>
          )}
          <div className="hint-box">
            <strong>Pet hint</strong>
            <p>{selectedProblem.hint}</p>
          </div>
        </div>
        <div className="code-workspace-panel">
          <div className="code-lab">
            <div className="runtime-toolbar">
              <label>
                <span>Language</span>
                <select
                  aria-label="Programming language"
                  onChange={(event) => handleLanguageChange(event.target.value as CodeLanguage)}
                  value={language}
                >
                  {codeLanguageEntries.map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Version</span>
                <select
                  aria-label="Programming language version"
                  onChange={(event) => {
                    const nextVersion = runtime.versions.find(
                      (version) => version.label === event.target.value,
                    );
                    if (nextVersion) setRuntimeVersion(nextVersion);
                    setRunResult(null);
                    setRunError("");
                  }}
                  value={runtimeVersion.label}
                >
                  {runtime.versions.map((version) => (
                    <option key={version.label} value={version.label}>{version.label}</option>
                  ))}
                </select>
              </label>
              <button
                className="reset-code-button"
                onClick={() => {
                  setCodeDrafts((current) => ({
                    ...current,
                    [language]: createStarterCode(selectedProblem, language),
                  }));
                  setRunResult(null);
                  setRunError("");
                }}
                type="button"
              >
                Reset code
              </button>
            </div>
            {language === "react" && (
              <p className="runtime-note">
                React mode compiles JSX and checks console output; visual preview is not included yet.
              </p>
            )}
            <div className="starter-code-panel">
              <div className="code-window-header">
                <span className="window-dot red" />
                <span className="window-dot yellow" />
                <span className="window-dot green" />
                <span className="code-file-name">solution.{runtime.extension}</span>
              </div>
              <textarea
                aria-label={`${runtime.label} code editor for ${selectedProblem.title}`}
                className="code-editor"
                onKeyDown={handleCodeEditorKeyDown}
                onChange={(event) => {
                  setCodeDrafts((current) => ({ ...current, [language]: event.target.value }));
                  setRunResult(null);
                  setRunError("");
                }}
                spellCheck={false}
                value={sourceCode}
              />
            </div>
            <div className="code-run-actions">
              <button disabled={isRunning || !sourceCode.trim()} onClick={handleRunCode} type="button">
                {isRunning ? "Running..." : `Run ${runtime.label}`}
                <span aria-hidden="true">{">"}</span>
              </button>
              <span>Output is checked against the expected result.</span>
            </div>
            {runError && <p className="error-message">{runError}</p>}
            {runResult && (
              <div className={`code-run-result ${runResult.status}`} role="status">
                <div>
                  <strong>{runResult.status === "passed" ? "Exercise passed" : runResult.status === "failed" ? "Output does not match yet" : "Compile or runtime error"}</strong>
                  <span>{runResult.detail}</span>
                </div>
                <pre>{runResult.output || "No output"}</pre>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="challenge-layout">
      <div className="problem-panel">
        <p className="eyebrow">{getSubjectLabel(selectedProblem.type)}</p>
        <h2>{selectedProblem.title}</h2>
        <span className="status-pill">
          {statuses[selectedProblem.id] === "completed" ? "Completed" : statuses[selectedProblem.id] === "incomplete" ? "Incomplete" : "Not attempted"}
        </span>
        <span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>
          {selectedProblem.difficulty}
        </span>
        <p>{selectedProblem.prompt}</p>
        <div className="hint-box">
          <strong>Pet hint</strong>
          <p>{selectedProblem.hint}</p>
        </div>
      </div>
      <div className="workspace-panel">
        <label htmlFor="answer">Your answer</label>
        <textarea
          id="answer"
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={answerPlaceholder}
          value={answer}
        />
        <button disabled={isChecking || !answer.trim()} onClick={handleSubmit} type="button">
          {isChecking ? "Checking..." : "Submit attempt"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {feedback && (
          <div className={`feedback-panel ${feedback.petMood}`}>
            <div>
              <p className="eyebrow">AI review</p>
              <h3>{feedback.score}/10</h3>
            </div>
            <p>{feedback.feedback}</p>
            {(selectedProblem.type === "leetcode" ||
              selectedProblem.type === "system-design") && (
              <div className="complexity-grid">
                <span>Time: {feedback.timeComplexity}</span>
                <span>Space: {feedback.spaceComplexity}</span>
              </div>
            )}
            {feedback.missedConcepts.length > 0 && (
              <p>Missed: {feedback.missedConcepts.join(", ")}</p>
            )}
            <div className="hint-box">
              <strong>Next hint</strong>
              <p>{feedback.hint}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Challenge;
