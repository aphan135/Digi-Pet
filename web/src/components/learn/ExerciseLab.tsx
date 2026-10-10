import { useState } from "react";
import type { LearningExercise } from "../../types";

interface ExerciseLabProps {
  exercise: LearningExercise;
  index: number;
}

type CodeLanguage = "javascript" | "typescript";

interface RunResult {
  output: string;
  status: "passed" | "failed" | "error";
}

const languageOptions: Record<CodeLanguage, { label: string; versions: string[] }> = {
  javascript: {
    label: "JavaScript",
    versions: ["ECMAScript 2020", "ECMAScript 2022", "ECMAScript 2024"],
  },
  typescript: {
    label: "TypeScript",
    versions: ["5.9 / ES2020", "5.9 / ES2022", "5.9 / ESNext"],
  },
};

async function compileTypeScript(code: string, version: string): Promise<string> {
  const compiler = await import("typescript");
  const targetByVersion = {
    "5.9 / ES2020": compiler.ScriptTarget.ES2020,
    "5.9 / ES2022": compiler.ScriptTarget.ES2022,
    "5.9 / ESNext": compiler.ScriptTarget.ESNext,
  };
  const result = compiler.transpileModule(code, {
    compilerOptions: {
      module: compiler.ModuleKind.None,
      target: targetByVersion[version as keyof typeof targetByVersion],
    },
    reportDiagnostics: true,
  });
  const errors = result.diagnostics?.filter(
    (diagnostic) => diagnostic.category === compiler.DiagnosticCategory.Error,
  );

  if (errors?.length) {
    throw new Error(
      errors
        .map((diagnostic) => compiler.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
        .join("\n"),
    );
  }

  return result.outputText;
}

async function executeCode(
  sourceCode: string,
  expectedOutput: string,
  language: CodeLanguage,
  version: string,
): Promise<RunResult> {
  let code = sourceCode;
  if (language === "typescript") {
    try {
      code = await compileTypeScript(sourceCode, version);
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : "TypeScript could not compile.",
        status: "error",
      };
    }
  }

  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = ({ data }) => {
        const lines = [];
        const format = (value) => {
          if (typeof value === "string") return value;
          if (value === undefined) return "undefined";
          try { return JSON.stringify(value); } catch { return String(value); }
        };
        console.log = (...values) => lines.push(values.map(format).join(" "));
        try {
          new Function(data.code)();
          self.postMessage({ output: lines.join("\\n") });
        } catch (error) {
          self.postMessage({ error: error instanceof Error ? error.message : String(error) });
        }
      };
    `;
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve({ output: "Execution stopped after 2 seconds. Check for an infinite loop.", status: "error" });
    }, 2000);

    worker.onmessage = (event: MessageEvent<{ output?: string; error?: string }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      if (event.data.error) {
        resolve({ output: event.data.error, status: "error" });
        return;
      }
      const output = event.data.output ?? "";
      resolve({
        output: output || "Code ran without output. Add console.log() to see a result.",
        status: output.trim() === expectedOutput.trim() ? "passed" : "failed",
      });
    };

    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve({ output: event.message || "The code could not run.", status: "error" });
    };

    worker.postMessage({ code });
  });
}

function ExerciseLab({ exercise, index }: ExerciseLabProps) {
  const [language, setLanguage] = useState<CodeLanguage>("javascript");
  const [version, setVersion] = useState(languageOptions.javascript.versions[2]);
  const [drafts, setDrafts] = useState<Record<CodeLanguage, string>>({
    javascript: exercise.starterCode,
    typescript: exercise.starterCode,
  });
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const code = drafts[language];

  function changeLanguage(nextLanguage: CodeLanguage) {
    const versions = languageOptions[nextLanguage].versions;
    setLanguage(nextLanguage);
    setVersion(versions[versions.length - 1]);
    setResult(null);
  }

  async function handleRun() {
    setIsRunning(true);
    setResult(null);
    const nextResult = await executeCode(code, exercise.expectedOutput, language, version);
    setResult(nextResult);
    setIsRunning(false);
  }

  return (
    <details className="exercise-lab">
      <summary>
        <span className="exercise-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="exercise-title">
          <strong>{exercise.title}</strong>
          <small>{exercise.instructions}</small>
        </span>
        <span className={`difficulty ${exercise.difficulty.toLowerCase()}`}>{exercise.difficulty}</span>
        <span className="exercise-chevron" aria-hidden="true">+</span>
      </summary>
      <div className="lab-workspace">
        <div className="editor-header">
          <div className="runtime-selectors">
            <label>
              <span>Language</span>
              <select
                aria-label="Coding language"
                onChange={(event) => changeLanguage(event.target.value as CodeLanguage)}
                value={language}
              >
                {(Object.entries(languageOptions) as [CodeLanguage, (typeof languageOptions)[CodeLanguage]][]).map(
                  ([value, option]) => <option key={value} value={value}>{option.label}</option>,
                )}
              </select>
            </label>
            <label>
              <span>Version</span>
              <select
                aria-label="Language version"
                onChange={(event) => {
                  setVersion(event.target.value);
                  setResult(null);
                }}
                value={version}
              >
                {languageOptions[language].versions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={() => {
              setDrafts((current) => ({ ...current, [language]: exercise.starterCode }));
              setResult(null);
            }}
            type="button"
          >
            Reset code
          </button>
        </div>
        <textarea
          aria-label={`${languageOptions[language].label} editor for ${exercise.title}`}
          onChange={(event) => {
            setDrafts((current) => ({ ...current, [language]: event.target.value }));
            setResult(null);
          }}
          spellCheck={false}
          value={code}
        />
        <div className="lab-actions">
          <button className="run-code" disabled={isRunning} onClick={handleRun} type="button">
            {isRunning ? "Running..." : `Run ${languageOptions[language].label}`}
            <span aria-hidden="true">{">"}</span>
          </button>
          <button className="hint-toggle" onClick={() => setShowHint((shown) => !shown)} type="button">
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>
        </div>
        {showHint && <p className="exercise-hint"><strong>Hint:</strong> {exercise.hint}</p>}
        {result && (
          <div className={`run-result ${result.status}`} role="status">
            <div>
              <strong>{result.status === "passed" ? "All checks passed" : result.status === "failed" ? "Not quite yet" : "Compile or run error"}</strong>
              {result.status === "failed" && <span>Expected: {exercise.expectedOutput}</span>}
            </div>
            <pre>{result.output}</pre>
          </div>
        )}
      </div>
    </details>
  );
}

export default ExerciseLab;
