// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/growthAnalysis.ts
// ─────────────────────────────────────────────────────────────────────────────
import { growthAnalysisTool } from "@/agents/tools/growthAnalysisTool";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, GrowthOpportunities, Citation } from "@/types/agent";

export async function growthAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const raw = await growthAnalysisTool.invoke({
      companyName: state.profile?.name ?? state.company,
      ticker: state.ticker!,
      sector: state.profile?.sector,
      industry: state.profile?.industry,
      description: state.profile?.description,
      revenueGrowth: state.financials?.revenueGrowthYoY,
      recentNews: state.news?.slice(0, 8).map((n) => n.title),
    });

    const result = JSON.parse(raw) as { opportunities?: GrowthOpportunities; citations?: Citation[] };

    const log: AgentLogEntry = {
      nodeName: "Growth Analysis",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: `Growth score: ${result.opportunities?.growthScore ?? "N/A"}/100. ${result.opportunities?.opportunities.length ?? 0} opportunities. ${result.opportunities?.competitiveAdvantages.length ?? 0} competitive advantages.`,
    };

    return {
      opportunities: result.opportunities,
      citations: result.citations ?? [],
      toolResults: { opportunities: result.opportunities },
      logs: [log],
    };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "Growth Analysis",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };
    return { logs: [log] };
  }
}
