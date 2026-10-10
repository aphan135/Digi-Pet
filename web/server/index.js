import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function extractJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;

  return JSON.parse(jsonText);
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/check-answer", async (request, response) => {
  const { problem, userAnswer } = request.body;

  if (!process.env.OPENAI_API_KEY) {
    return response.status(500).json({
      error: "Missing OPENAI_API_KEY. Create web/.env from web/.env.example and restart npm run dev.",
    });
  }

  if (!problem || !userAnswer?.trim()) {
    return response.status(400).json({
      error: "Missing problem or userAnswer.",
    });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You grade coding interview answers for learners. Be strict but encouraging. Return only valid JSON with no markdown.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task:
              "Grade this learner answer. Do not reveal the full solution unless the answer already contains it. Prefer hints and targeted feedback.",
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
        },
      ],
    });

    const feedback = extractJson(result.output_text || "{}");
    return response.json(feedback);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      error: "Could not check the answer. Check the API key, model, and server logs.",
    });
  }
});

app.listen(port, () => {
  console.log(`Answer checker API running on http://localhost:${port}`);
});

