import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.API_PORT || 3001);

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
