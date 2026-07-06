// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/financialAnalysis.ts
// ─────────────────────────────────────────────────────────────────────────────
import { financialAnalysisTool } from "@/agents/tools/financialAnalysisTool";
import { valuationTool } from "@/agents/tools/valuationTool";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, FinancialData, Valuation, Citation } from "@/types/agent";

export async function financialAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();
  const ticker = state.ticker!;

  try {
    const [finRaw, valRaw] = await Promise.all([
      financialAnalysisTool.invoke({ ticker }),
      valuationTool.invoke({ ticker }),
    ]);

    const finResult = JSON.parse(finRaw) as { financials?: FinancialData; citations?: Citation[] };
    const valResult = JSON.parse(valRaw) as { valuation?: Valuation; citations?: Citation[] };

    const allCitations = [
      ...(finResult.citations ?? []),
      ...(valResult.citations ?? []),
    ];

    const latestMetrics = finResult.financials?.metrics?.sort((a, b) => b.year - a.year)[0];

    const log: AgentLogEntry = {
      nodeName: "Financial Analysis",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: latestMetrics
        ? `Retrieved ${finResult.financials?.metrics.length ?? 0} years of financials. Latest revenue: ${latestMetrics.revenue ? `$${(latestMetrics.revenue / 1e9).toFixed(1)}B` : "N/A"}. P/E: ${valResult.valuation?.peRatio?.toFixed(1) ?? "N/A"}`
        : "Financial data retrieved with limited coverage",
    };

    return {
      financials: finResult.financials,
      valuation: valResult.valuation,
      citations: allCitations,
      toolResults: { financials: finResult.financials, valuation: valResult.valuation },
      logs: [log],
    };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "Financial Analysis",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };
    return {
      financials: { metrics: [], availabilityNotes: ["Failed to retrieve financial data"] },
      logs: [log],
    };
  }
}
