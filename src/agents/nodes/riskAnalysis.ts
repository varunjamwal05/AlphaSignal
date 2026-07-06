// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/riskAnalysis.ts
// ─────────────────────────────────────────────────────────────────────────────
import { riskAssessmentTool } from "@/agents/tools/riskAssessmentTool";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, RiskAssessment, Citation } from "@/types/agent";

export async function riskAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const latestFinancials = state.financials?.metrics?.sort((a, b) => b.year - a.year)[0];
    const financialSummary = latestFinancials
      ? `Revenue: $${latestFinancials.revenue ? (latestFinancials.revenue / 1e9).toFixed(1) + "B" : "N/A"}, Net Income: $${latestFinancials.netIncome ? (latestFinancials.netIncome / 1e9).toFixed(1) + "B" : "N/A"}, Operating Margin: ${latestFinancials.operatingMargin?.toFixed(1) ?? "N/A"}%`
      : undefined;

    const raw = await riskAssessmentTool.invoke({
      companyName: state.profile?.name ?? state.company,
      ticker: state.ticker!,
      sector: state.profile?.sector,
      financialSummary,
      recentNews: state.news?.slice(0, 8).map((n) => n.title),
      debtToEquity: latestFinancials?.debtToEquity,
      peRatio: state.valuation?.peRatio,
    });

    const result = JSON.parse(raw) as { risks?: RiskAssessment; citations?: Citation[] };

    const log: AgentLogEntry = {
      nodeName: "Risk Analysis",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: `Overall risk: ${result.risks?.overallRiskLevel ?? "N/A"} (score: ${result.risks?.riskScore ?? "N/A"}/100). ${result.risks?.risks.length ?? 0} risks identified.`,
    };

    return {
      risks: result.risks,
      citations: result.citations ?? [],
      toolResults: { risks: result.risks },
      logs: [log],
    };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "Risk Analysis",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };
    return { logs: [log] };
  }
}
