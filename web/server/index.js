import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "node:url";
import ts from "typescript";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.API_PORT || 3001);
const judge0Url = (process.env.JUDGE0_API_URL || "https://ce.judge0.com").replace(/\/$/, "");
const allowedLanguageIds = new Set([
  50, 51, 52, 54, 62, 68, 72, 73, 74, 78, 91, 92, 93, 94, 95, 97, 98, 100, 101,
  102, 103, 105, 106, 107, 108, 109, 110, 111,
]);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Gemini returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(jsonText);
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

function compileReactJsx(sourceCode) {
  const result = ts.transpileModule(sourceCode, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  const errors = result.diagnostics?.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors?.length) {
    throw new Error(errors.map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")).join("\n"));
  }
  const reactShim = `
const React = {
  createElement(type, props, ...children) {
    return { type, props: { ...(props || {}), children } };
  }
};`;
  return `${reactShim}\n${result.outputText}`;
}

app.post("/api/run-code", async (request, response) => {
  const { sourceCode, languageId, language, expectedOutput } = request.body;
  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    return response.status(400).json({ error: "Enter some code before running it." });
  }
  if (sourceCode.length > 50_000) {
    return response.status(400).json({ error: "Code must be smaller than 50 KB." });
  }
  if (!Number.isInteger(languageId) || !allowedLanguageIds.has(languageId)) {
    return response.status(400).json({ error: "That language version is not supported." });
  }

  let executableCode = sourceCode;
  try {
    if (language === "react") executableCode = compileReactJsx(sourceCode);
  } catch (error) {
    return response.json({
      status: "error",
      output: error instanceof Error ? error.message : "JSX could not compile.",
      detail: "React JSX compilation failed",
    });
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_AUTH_TOKEN?.trim()) {
    headers["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN.trim();
  }

  try {
    const runnerResponse = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: executableCode,
        language_id: languageId,
        expected_output: typeof expectedOutput === "string" ? expectedOutput : undefined,
        cpu_time_limit: 3,
        wall_time_limit: 5,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = await runnerResponse.json();
    if (!runnerResponse.ok) {
      return response.status(502).json({
        error: result.error || result.message || "The code runner rejected this request.",
      });
    }
    const output = result.stdout || result.compile_output || result.stderr || result.message || "";
    const statusId = result.status?.id;
    return response.json({
      status: statusId === 3 ? "passed" : statusId === 4 ? "failed" : "error",
      output: String(output).trimEnd(),
      detail: result.status?.description || "Execution finished",
    });
  } catch (error) {
    console.error("Code runner failed:", error);
    return response.status(502).json({
      error: error instanceof Error && error.name === "TimeoutError"
        ? "The code runner took too long to respond. Try again."
        : "Could not reach the code runner. Check the API server terminal.",
    });
  }
});

app.post("/api/check-answer", async (request, response) => {
  const { problem, userAnswer } = request.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === "replace_me_with_your_gemini_api_key") {
    return response.status(500).json({
      error: "Set GEMINI_API_KEY in web/.env to a valid key, then restart the API server.",
    });
  }

  if (!problem || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return response.status(400).json({
      error: "Missing problem or userAnswer.",
    });
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const result = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: JSON.stringify({
        task:
          "Grade this learner answer for accuracy and reasoning. Do not reveal the full solution unless the answer already contains it. Prefer hints and targeted feedback. For subjects other than coding and system design, set timeComplexity and spaceComplexity to 'Not applicable'.",
        responseSchema: {
          isCorrect: "boolean",
          score: "number from 0 to 10",
          feedback: "short learner-friendly explanation",
          timeComplexity: "string or unknown",
          spaceComplexity: "string or unknown",
          missedConcepts: "array of short strings",
          hint: "one next-step hint",
          petMood: "celebrate | encourage | nudge",
        },
        problem,
        userAnswer,
      }),
      config: {
        systemInstruction:
          "You are a supportive, accurate tutor who grades learner answers for the subject of the problem, including coding, system design, math, science, and history. Be strict but encouraging. Return only valid JSON with no markdown.",
        responseMimeType: "application/json",
      },
    });

    return response.json(extractJson(result.text || ""));
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : undefined;
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined;

    console.error("Gemini answer check failed:", { status, code, message: error.message });

    let message = "Gemini could not check the answer. Check the API server terminal logs.";
    if (status === 400 || status === 401) {
      message = "Gemini rejected the request or API key. Check GEMINI_API_KEY in web/.env.";
    } else if (status === 403) {
      message = "This Gemini API key does not have access. Check its project permissions.";
    } else if (status === 404) {
      message = "The configured Gemini model was not found or is unavailable. Check GEMINI_MODEL in web/.env.";
    } else if (status === 429) {
      message =
        "Gemini rate-limited this request or the project has reached its quota. Check Gemini API limits and try again.";
    } else if (error instanceof SyntaxError) {
      message = "Gemini returned an invalid answer format. Try submitting again.";
    }

    return response.status(502).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Answer checker API running on http://localhost:${port}`);
});
