// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/growthAnalysisTool.ts
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { analyzeWithGemini, parseJsonFromLLM } from "@/services/geminiService";
import type { GrowthOpportunities } from "@/types/agent";

export const growthAnalysisTool = new DynamicStructuredTool({
  name: "GrowthAnalysisTool",
  description: "Evaluates a company's growth prospects including competitive moats, innovation pipeline, AI initiatives, market expansion, and long-term opportunities.",
  schema: z.object({
    companyName: z.string(),
    ticker: z.string(),
    sector: z.string().optional(),
    industry: z.string().optional(),
    description: z.string().optional(),
    revenueGrowth: z.number().optional(),
    recentNews: z.array(z.string()).optional(),
  }),
  func: async ({ companyName, ticker, sector, industry, description, revenueGrowth, recentNews }) => {
    const system = `You are a growth equity analyst specializing in identifying long-term investment opportunities. Analyze companies for competitive advantages and growth catalysts. Return only structured JSON.`;

    const prompt = `Evaluate growth prospects for ${companyName} (${ticker}):

Sector: ${sector ?? "Unknown"}
Industry: ${industry ?? "Unknown"}
Business: ${description?.substring(0, 500) ?? "Not provided"}
Revenue Growth YoY: ${revenueGrowth != null ? `${revenueGrowth.toFixed(1)}%` : "Not available"}
Recent News Context: ${recentNews?.slice(0, 5).join("; ") ?? "Not provided"}

Return a JSON object:
{
  "opportunities": [
    {
      "category": "<e.g., AI Integration, Geographic Expansion>",
      "description": "<specific opportunity>",
      "timeHorizon": "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM"
    }
  ],
  "competitiveAdvantages": ["<advantage1>", "<advantage2>"],
  "innovationScore": <0-100>,
  "marketLeadershipNotes": "<notes on market position>",
  "aiInitiatives": ["<initiative1>", "<initiative2>"],
  "growthScore": <0-100>,
  "summary": "<2-3 sentence growth thesis>"
}`;

    try {
      const raw = await analyzeWithGemini(system, prompt);
      const parsed = parseJsonFromLLM<GrowthOpportunities>(raw);
      return JSON.stringify({
        opportunities: parsed,
        citations: [{ source: "Google Gemini (Growth Analysis)", type: "LLM_SUMMARY", section: "Growth Analysis", retrievedAt: new Date().toISOString() }],
      });
    } catch (err) {
      console.error("[GrowthAnalysisTool] Error:", err);
      return JSON.stringify({
        opportunities: { opportunities: [], competitiveAdvantages: [], growthScore: 50, summary: "Growth analysis failed." },
        citations: [],
      });
    }
  },
});
