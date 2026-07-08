import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const MODEL = "gemini-2.5-flash";

export function createGeminiModel(temperature = 0.3) {
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openAIKey) {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature,
      apiKey: openAIKey,
      maxRetries: 3,
    });
  }

  if (!geminiKey) {
    throw new Error("Neither GEMINI_API_KEY nor OPENAI_API_KEY environment variable is set. Please add one to your .env file.");
  }

  return new ChatGoogleGenerativeAI({
    model: MODEL,
    temperature,
    apiKey: geminiKey,
    maxRetries: 3,
  });
}

// ── Generic structured analysis helper with rate-limit retry logic ────────────
export async function analyzeWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = createGeminiModel();
  
  let attempts = 0;
  const maxAttempts = 6;
  let delay = 2000; // Start with a 2-second delay on first rate limit

  while (attempts < maxAttempts) {
    try {
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ]);
      return response.content as string;
    } catch (err: unknown) {
      attempts++;
      const errStr = String(err);
      
      const isOpenAIQuota = process.env.OPENAI_API_KEY && (
        errStr.includes("InsufficientQuotaError") || 
        errStr.includes("exceeded your current quota")
      );

      if (isOpenAIQuota) {
        console.error("[OpenAI API] Insufficient quota/billing. Failing immediately.");
        throw new Error("OpenAI API Quota Exceeded (Insufficient Funds or Expired Key). Please check your credit balance in your OpenAI Developer Dashboard (https://platform.openai.com/api-keys) or use a valid Gemini key.");
      }

      const isDailyLimit =
        !process.env.OPENAI_API_KEY && (
          errStr.includes("GenerateRequestsPerDay") ||
          errStr.includes("RequestsPerDay") ||
          errStr.includes("daily") ||
          errStr.includes("Daily")
        );

      if (isDailyLimit) {
        console.error("[Gemini API] Daily quota exceeded. Failing immediately without retries.");
        throw new Error("Gemini API Daily Quota Exceeded (the Free Tier daily limit of 20 requests is exhausted). Please configure OPENAI_API_KEY in your .env file, upgrade to Pay-as-you-go billing in Google AI Studio, or use a new Gemini API key.");
      }

      const isRateLimit =
        errStr.includes("429") ||
        errStr.includes("RateLimit") ||
        errStr.includes("quota") ||
        errStr.includes("Quota") ||
        errStr.includes("limit") ||
        errStr.includes("exhausted");

      if (isRateLimit && attempts < maxAttempts) {
        console.warn(
          `[Gemini API] Rate limit / quota exceeded. Retrying attempt ${attempts}/${maxAttempts} in ${delay}ms... (Error: ${errStr.substring(0, 150)}...)`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Exponential backoff: multiply delay by 2 and add 0-1000ms jitter
        delay = delay * 2 + Math.floor(Math.random() * 1000);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed to analyze with Gemini after multiple retries due to rate limit.");
}

// ── Parse JSON from LLM output (strips markdown fences) ───────────────────────
export function parseJsonFromLLM<T>(raw: string): T {
  // Strip ```json ... ``` or ``` ... ```
  const cleaned = raw.replace(/```(?:json)?\n?/gi, "").replace(/```$/gi, "").trim();
  return JSON.parse(cleaned) as T;
}
