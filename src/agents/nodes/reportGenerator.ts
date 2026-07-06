// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/reportGenerator.ts
// Compiles the final investment report using Gemini
// ─────────────────────────────────────────────────────────────────────────────
import { analyzeWithGemini, parseJsonFromLLM } from "@/services/geminiService";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, FinalReport } from "@/types/agent";

function formatCurrency(val: number | undefined): string {
  if (val == null) return "N/A";
  if (Math.abs(val) >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  return `$${val.toFixed(2)}`;
}

export async function reportGeneratorNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const latest = state.financials?.metrics?.sort((a, b) => b.year - a.year)[0];

    const contextSummary = `
Company: ${state.profile?.name ?? state.company} (${state.ticker})
Sector: ${state.profile?.sector ?? "N/A"} | Industry: ${state.profile?.industry ?? "N/A"}
Market Cap: ${formatCurrency(state.profile?.marketCap)}
Employees: ${state.profile?.employees?.toLocaleString() ?? "N/A"}

Financial Highlights (Latest Year: ${latest?.year ?? "N/A"}):
- Revenue: ${formatCurrency(latest?.revenue)}
- Net Income: ${formatCurrency(latest?.netIncome)}
- Free Cash Flow: ${formatCurrency(latest?.freeCashFlow)}
- Operating Margin: ${latest?.operatingMargin?.toFixed(1) ?? "N/A"}%
- Debt-to-Equity: ${latest?.debtToEquity?.toFixed(2) ?? "N/A"}
- Revenue Growth YoY: ${state.financials?.revenueGrowthYoY?.toFixed(1) ?? "N/A"}%

Valuation:
- P/E Ratio: ${state.valuation?.peRatio?.toFixed(1) ?? "N/A"}x
- PEG Ratio: ${state.valuation?.pegRatio?.toFixed(2) ?? "N/A"}
- EV/EBITDA: ${state.valuation?.evToEbitda?.toFixed(1) ?? "N/A"}x
- Price/Sales: ${state.valuation?.priceToSales?.toFixed(2) ?? "N/A"}x
- Current Price: ${state.valuation?.currentPrice ? `$${state.valuation.currentPrice}` : "N/A"}

Sentiment: ${state.sentiment?.overall ?? "N/A"} (score: ${state.sentiment?.score?.toFixed(2) ?? "N/A"})
Key Themes: ${state.sentiment?.keyThemes?.join(", ") ?? "N/A"}

Risk Level: ${state.risks?.overallRiskLevel ?? "N/A"} (risk score: ${state.risks?.riskScore ?? "N/A"}/100)
Growth Score: ${state.opportunities?.growthScore ?? "N/A"}/100

Investment Score: ${state.scores?.overallScore ?? "N/A"}/100
Confidence: ${state.confidence ?? "N/A"}%
Recommendation: ${state.recommendation ?? "N/A"}

Reflection Notes: ${state.reflection?.notes ?? "N/A"}
`.trim();

    const system = `You are a senior equity research analyst at a top-tier investment bank. Your reports are clear, evidence-based, and compelling. Return structured JSON only. Do not include markdown in the JSON values except in markdownReport.`;

    const prompt = `Generate a comprehensive investment report for the following company analysis:

${contextSummary}

Return a JSON object with this structure:
{
  "investmentThesis": "<2-3 paragraph investment thesis>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "growthDrivers": ["<driver1>", "<driver2>", ...],
  "keyRisks": ["<risk1>", "<risk2>", ...],
  "evidenceSummary": "<brief summary of data quality and evidence used>",
  "financialSummary": "<1-2 paragraph financial health assessment>",
  "valuationSummary": "<1-2 paragraph valuation analysis>",
  "growthSummary": "<1-2 paragraph growth outlook>",
  "riskSummary": "<1-2 paragraph risk assessment>",
  "newsSummary": "<1-2 paragraph news and sentiment summary>",
  "markdownReport": "<full markdown formatted investment report with sections: Overview, Financial Health, Valuation, Growth, Risks, Sentiment, Recommendation>"
}`;

    const raw = await analyzeWithGemini(system, prompt);
    const parsed = parseJsonFromLLM<Omit<FinalReport, "companyName" | "ticker" | "recommendation" | "investmentScore" | "confidence" | "generatedAt">>(raw);

    const report: FinalReport = {
      companyName: state.profile?.name ?? state.company,
      ticker: state.ticker!,
      recommendation: state.recommendation ?? "WATCH",
      investmentScore: state.scores?.overallScore ?? 50,
      confidence: state.confidence ?? 50,
      generatedAt: new Date().toISOString(),
      ...parsed,
    };

    const log: AgentLogEntry = {
      nodeName: "Report Generator",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: `Report generated for ${report.companyName}. Recommendation: ${report.recommendation}. Score: ${report.investmentScore}/100.`,
    };

    return { report, logs: [log] };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "Report Generator",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };

    // Fallback minimal report
    const fallbackReport: FinalReport = {
      companyName: state.profile?.name ?? state.company,
      ticker: state.ticker ?? state.company,
      recommendation: state.recommendation ?? "WATCH",
      investmentScore: state.scores?.overallScore ?? 50,
      confidence: state.confidence ?? 50,
      investmentThesis: "Report generation encountered an error. Please review the individual analysis sections for details.",
      strengths: state.opportunities?.competitiveAdvantages ?? [],
      weaknesses: state.reflection?.issues ?? [],
      growthDrivers: state.opportunities?.opportunities.map((o) => o.description) ?? [],
      keyRisks: state.risks?.risks.map((r) => r.description) ?? [],
      evidenceSummary: "Partial data available.",
      financialSummary: "See financial metrics panel.",
      valuationSummary: "See valuation metrics panel.",
      growthSummary: state.opportunities?.summary ?? "Growth data unavailable.",
      riskSummary: state.risks?.summary ?? "Risk data unavailable.",
      newsSummary: state.sentiment?.summary ?? "No news available.",
      markdownReport: `# Investment Report: ${state.profile?.name ?? state.company}\n\n**Recommendation:** ${state.recommendation ?? "WATCH"}\n**Score:** ${state.scores?.overallScore ?? "N/A"}/100\n\nReport generation failed. See individual sections for details.`,
      generatedAt: new Date().toISOString(),
    };

    return { report: fallbackReport, logs: [log] };
  }
}
