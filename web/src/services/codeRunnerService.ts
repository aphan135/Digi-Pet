export interface CodeRunResult {
  status: "passed" | "failed" | "error";
  output: string;
  detail: string;
}

interface RunCodeInput {
  sourceCode: string;
  languageId: number;
  language: string;
  expectedOutput?: string;
}

export async function runCode(input: RunCodeInput): Promise<CodeRunResult> {
  const response = await fetch("/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const text = await response.text();
  let body: Partial<CodeRunResult> & { error?: string } = {};
  try {
    body = text ? (JSON.parse(text) as typeof body) : {};
  } catch {
    throw new Error("The code runner returned an invalid response.");
  }
  if (!response.ok) throw new Error(body.error || "The code runner is unavailable.");
  return body as CodeRunResult;
}
