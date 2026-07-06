// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/riskAssessmentTool.ts
// Uses Gemini to evaluate company-specific and macro investment risks
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { analyzeWithGemini, parseJsonFromLLM } from "@/services/geminiService";
import type { RiskAssessment } from "@/types/agent";

export const riskAssessmentTool = new DynamicStructuredTool({
  name: "RiskAssessmentTool",
  description: "Evaluates investment risks including competition, debt, regulatory exposure, macroeconomic headwinds, execution risk, and valuation risk based on company data.",
  schema: z.object({
    companyName: z.string(),
    ticker: z.string(),
    sector: z.string().optional(),
    financialSummary: z.string().optional(),
    recentNews: z.array(z.string()).optional(),
    debtToEquity: z.number().optional(),
    peRatio: z.number().optional(),
  }),
  func: async ({ companyName, ticker, sector, financialSummary, recentNews, debtToEquity, peRatio }) => {
    const system = `You are a senior investment risk analyst at a top hedge fund. Assess investment risks for companies with analytical precision. Return only structured JSON.`;

    const prompt = `Evaluate investment risks for ${companyName} (${ticker}):

Sector: ${sector ?? "Unknown"}
Financial Context: ${financialSummary ?? "Not provided"}
Debt-to-Equity: ${debtToEquity ?? "Not available"}
P/E Ratio: ${peRatio ?? "Not available"}
Recent Headlines: ${recentNews?.slice(0, 5).join("; ") ?? "Not provided"}

Return a JSON object:
{
  "risks": [
    {
      "category": "COMPETITION" | "DEBT" | "REGULATORY" | "MACROECONOMIC" | "VALUATION" | "EXECUTION" | "OTHER",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "description": "<specific risk description>",
      "evidence": "<supporting evidence or reasoning>"
    }
  ],
  "overallRiskLevel": "HIGH" | "MEDIUM" | "LOW",
  "riskScore": <number 0-100, higher = riskier>,
  "summary": "<2-3 sentence risk overview>"
}`;

    try {
      const raw = await analyzeWithGemini(system, prompt);
      const parsed = parseJsonFromLLM<{ risks: RiskAssessment["risks"]; overallRiskLevel: string; riskScore: number; summary: string }>(raw);
      const riskAssessment: RiskAssessment = {
        risks: parsed.risks ?? [],
        overallRiskLevel: (parsed.overallRiskLevel as RiskAssessment["overallRiskLevel"]) ?? "MEDIUM",
        riskScore: parsed.riskScore ?? 50,
        summary: parsed.summary ?? "Risk assessment not available.",
      };
      return JSON.stringify({
        risks: riskAssessment,
        citations: [{ source: "Google Gemini (Risk Analysis)", type: "LLM_SUMMARY", section: "Risk Assessment", retrievedAt: new Date().toISOString() }],
      });
    } catch (err) {
      console.error("[RiskAssessmentTool] Error:", err);
      return JSON.stringify({
        risks: { risks: [], overallRiskLevel: "MEDIUM", riskScore: 50, summary: "Risk assessment failed due to an error." },
        citations: [],
      });
    }
  },
});
