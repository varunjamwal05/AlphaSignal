// ─────────────────────────────────────────────────────────────────────────────
// src/services/geminiService.ts
// Google Gemini LLM integration via LangChain for structured AI analysis
// ─────────────────────────────────────────────────────────────────────────────
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const MODEL = "gemini-2.5-flash";

export function createGeminiModel(temperature = 0.3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.");
  }
  return new ChatGoogleGenerativeAI({
    model: MODEL,
    temperature,
    apiKey,
    maxRetries: 3,
  });
}

// ── Generic structured analysis helper ────────────────────────────────────────
export async function analyzeWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = createGeminiModel();
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userMessage),
  ]);
  return response.content as string;
}

// ── Parse JSON from LLM output (strips markdown fences) ───────────────────────
export function parseJsonFromLLM<T>(raw: string): T {
  // Strip ```json ... ``` or ``` ... ```
  const cleaned = raw.replace(/```(?:json)?\n?/gi, "").replace(/```$/gi, "").trim();
  return JSON.parse(cleaned) as T;
}
