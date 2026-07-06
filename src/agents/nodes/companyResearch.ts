// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/companyResearch.ts
// Fetches real company profile via CompanyProfileTool
// ─────────────────────────────────────────────────────────────────────────────
import { companyProfileTool } from "@/agents/tools/companyProfileTool";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, CompanyProfile, Citation } from "@/types/agent";

export async function companyResearchNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const raw = await companyProfileTool.invoke({ companyName: state.company });
    const result = JSON.parse(raw) as {
      ticker?: string;
      profile?: CompanyProfile;
      citations?: Citation[];
      error?: string;
    };

    if (result.error || !result.profile) {
      const log: AgentLogEntry = {
        nodeName: "Company Research",
        status: "FAILED",
        startedAt,
        completedAt: new Date().toISOString(),
        elapsedMs: Date.now() - start,
        error: result.error ?? "Company not found",
      };
      return { error: result.error ?? `Could not find company: ${state.company}`, logs: [log] };
    }

    const log: AgentLogEntry = {
      nodeName: "Company Research",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: `Identified ${result.profile.name} (${result.ticker}) — ${result.profile.sector ?? "Unknown sector"}`,
    };

    return {
      ticker: result.ticker,
      profile: result.profile,
      citations: result.citations ?? [],
      toolResults: { companyProfile: result.profile },
      logs: [log],
    };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "Company Research",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };
    return { error: `Company research failed: ${String(err)}`, logs: [log] };
  }
}
