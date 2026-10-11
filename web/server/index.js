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

app.post("/api/pet-chat", async (request, response) => {
  const { messages } = request.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    return response.status(400).json({
      error: "Send between 1 and 12 recent chat messages.",
    });
  }

  const validMessages = messages.map((message) => {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > 2000
    ) {
      return null;
    }
    return { role: message.role, content: message.content.trim() };
  });
  if (
    validMessages.some((message) => message === null) ||
    validMessages[0]?.role !== "user" ||
    validMessages.at(-1)?.role !== "user"
  ) {
    return response.status(400).json({
      error: "Chat messages must be valid and end with your latest question.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "replace_me_with_your_gemini_api_key") {
    return response.status(503).json({
      error: "AI chat isn't configured yet. Add a valid GEMINI_API_KEY to web/.env and restart the API server.",
    });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: validMessages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      config: {
        systemInstruction:
          "You are Digi-Pet, a warm, curious AI learning companion. Help with coding, math, science, history, and general learning. Answer directly in 1-3 short sentences, using at most 45 words. Give only the key explanation; include an example only when it makes the answer clearer. Invite the learner to ask for more detail rather than giving a long explanation. Be accurate; if a question is ambiguous or you are unsure, say so briefly and ask one clarifying question. Do not claim to have taken real-world actions.",
        maxOutputTokens: 120,
      },
    });
    const reply = result.text?.trim();
    if (!reply) {
      throw new Error("Gemini returned an empty chat reply.");
    }
    return response.json({ reply });
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
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini error";
    console.error("Gemini pet chat failed:", { status, code, message: errorMessage });

    const message = status === 429
      ? "The AI is busy right now. Please wait a moment and try again."
      : status === 401 || status === 403
        ? "The AI service rejected its API key. Check GEMINI_API_KEY in web/.env."
        : "The cat couldn't reach the AI right now. Please try again.";
    return response.status(502).json({ error: message });
  }
});

app.post("/api/pet-chat/summarize", async (request, response) => {
  const { text } = request.body ?? {};
  if (typeof text !== "string" || !text.trim() || text.length > 6000) {
    return response.status(400).json({
      error: "Provide an AI answer under 6,000 characters to summarize.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "replace_me_with_your_gemini_api_key") {
    return response.status(503).json({
      error: "AI chat isn't configured yet. Add a valid GEMINI_API_KEY to web/.env and restart the API server.",
    });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `Summarize this answer for a learner:\n\n${text.trim()}`,
      config: {
        systemInstruction:
          "Summarize the given answer accurately in one very short sentence of at most 20 words. Include only the main idea. Do not add new facts or introductory filler.",
        maxOutputTokens: 60,
      },
    });
    const summary = result.text?.trim();
    if (!summary) {
      throw new Error("Gemini returned an empty summary.");
    }
    return response.json({ summary });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : undefined;
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini error";
    console.error("Gemini pet chat summary failed:", { status, message: errorMessage });

    const message = status === 429
      ? "The AI is busy right now. Please wait a moment and try again."
      : status === 401 || status === 403
        ? "The AI service rejected its API key. Check GEMINI_API_KEY in web/.env."
        : "The cat couldn't summarize that answer right now. Please try again.";
    return response.status(502).json({ error: message });
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

// Vercel imports the app as a serverless function (api/index.js); locally it listens.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Answer checker API running on http://localhost:${port}`);
  });
}

export default app;
