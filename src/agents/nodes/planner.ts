// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/planner.ts
// Plans the research strategy and sets execution priorities
// ─────────────────────────────────────────────────────────────────────────────
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry } from "@/types/agent";

export async function plannerNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const plan = {
    steps: [
      "Resolve company ticker and fetch profile",
      "Retrieve financial statements and compute ratios",
      "Fetch valuation metrics",
      "Retrieve and classify recent news",
      "Perform sentiment analysis",
      "Assess investment risks",
      "Evaluate growth opportunities",
      "Calculate weighted investment scores",
      "Reflect and validate recommendation",
      "Generate comprehensive investment report",
    ],
    priority: "COMPREHENSIVE",
    toolsNeeded: [
      "CompanyProfileTool",
      "FinancialAnalysisTool",
      "ValuationTool",
      "NewsRetrievalTool",
      "NewsSentimentTool",
      "RiskAssessmentTool",
      "GrowthAnalysisTool",
    ],
  };

  const log: AgentLogEntry = {
    nodeName: "Planner",
    status: "COMPLETED",
    startedAt,
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - start,
    outputSummary: `Created ${plan.steps.length}-step research plan for "${state.company}"`,
  };

  return { plan, logs: [log] };
}
