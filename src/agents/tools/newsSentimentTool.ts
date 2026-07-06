// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/newsSentimentTool.ts
// Uses Gemini to classify and score news article sentiment
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { analyzeWithGemini, parseJsonFromLLM } from "@/services/geminiService";
import type { NewsArticle, SentimentAnalysis } from "@/types/agent";

export const newsSentimentTool = new DynamicStructuredTool({
  name: "NewsSentimentTool",
  description: "Analyzes news articles about a company and classifies each as POSITIVE, NEGATIVE, or NEUTRAL. Returns overall sentiment score and key themes.",
  schema: z.object({
    companyName: z.string(),
    articles: z.array(z.object({
      title: z.string(),
      url: z.string(),
      source: z.string(),
      publishedAt: z.string(),
    })),
  }),
  func: async ({ companyName, articles }) => {
    if (articles.length === 0) {
      const fallback: SentimentAnalysis = {
        overall: "NEUTRAL",
        score: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        summary: "No news articles available for sentiment analysis.",
        keyThemes: [],
      };
      return JSON.stringify({ sentiment: fallback, articles: [], citations: [] });
    }

    const articlesText = articles
      .map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${a.publishedAt.substring(0, 10)})`)
      .join("\n");

    const system = `You are a financial news sentiment analyst. Analyze company news headlines and classify each as POSITIVE, NEGATIVE, or NEUTRAL from an investment perspective. Return structured JSON only.`;

    const prompt = `Analyze these recent news headlines about ${companyName}:

${articlesText}

Return a JSON object with this exact structure:
{
  "sentiment": {
    "overall": "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED",
    "score": <number from -1.0 to 1.0>,
    "positiveCount": <number>,
    "negativeCount": <number>,
    "neutralCount": <number>,
    "summary": "<2-3 sentence summary of overall sentiment>",
    "keyThemes": ["<theme1>", "<theme2>", ...]
  },
  "classifiedArticles": [
    { "title": "<title>", "sentiment": "POSITIVE|NEGATIVE|NEUTRAL", "sentimentScore": <-1 to 1> }
  ]
}`;

    try {
      const raw = await analyzeWithGemini(system, prompt);
      const parsed = parseJsonFromLLM<{ sentiment: SentimentAnalysis; classifiedArticles: Array<{ title: string; sentiment: string; sentimentScore: number }> }>(raw);

      // Merge classification back into articles
      const enrichedArticles: NewsArticle[] = articles.map((a) => {
        const match = parsed.classifiedArticles?.find((c) => c.title === a.title);
        return {
          ...a,
          sentiment: (match?.sentiment as NewsArticle["sentiment"]) ?? "NEUTRAL",
          sentimentScore: match?.sentimentScore ?? 0,
        };
      });

      return JSON.stringify({
        sentiment: parsed.sentiment,
        articles: enrichedArticles,
        citations: [{ source: "Google Gemini (Sentiment Analysis)", type: "LLM_SUMMARY", section: "News Sentiment", retrievedAt: new Date().toISOString() }],
      });
    } catch (err) {
      console.error("[NewsSentimentTool] Error:", err);
      return JSON.stringify({
        sentiment: { overall: "NEUTRAL", score: 0, positiveCount: 0, negativeCount: 0, neutralCount: articles.length, summary: "Sentiment analysis failed.", keyThemes: [] },
        articles,
        citations: [],
      });
    }
  },
});
