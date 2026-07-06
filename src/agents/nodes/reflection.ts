// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/reflection.ts
// Validates evidence, checks for conflicts, may revise confidence
// ─────────────────────────────────────────────────────────────────────────────
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, ReflectionResult } from "@/types/agent";

export async function reflectionNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const issues: string[] = [];
  const adjustments: string[] = [];
  let confidenceAdjustment = 0;
  let requiresMoreResearch = false;
  let revisedRecommendation = state.recommendation;

  // 1. Evidence sufficiency check
  const hasFinancials = (state.financials?.metrics?.length ?? 0) > 0;
  const hasNews = (state.news?.length ?? 0) > 0;
  const hasRisks = (state.risks?.risks?.length ?? 0) > 0;
  const hasGrowth = state.opportunities != null;

  if (!hasFinancials) {
    issues.push("No financial statement data available — score reliability is low");
    confidenceAdjustment -= 15;
  }
  if (!hasNews) {
    issues.push("No recent news retrieved — sentiment analysis is missing");
    confidenceAdjustment -= 10;
  }
  if (!hasRisks) {
    issues.push("Risk analysis incomplete");
    confidenceAdjustment -= 5;
  }
  if (!hasGrowth) {
    issues.push("Growth analysis missing");
    confidenceAdjustment -= 5;
  }

  // 2. Conflicting signal check
  const overallScore = state.scores?.overallScore ?? 50;
  const sentimentScore = state.scores?.sentimentScore ?? 50;
  const riskScore = state.scores?.riskScore ?? 50;

  if (overallScore > 70 && state.sentiment?.overall === "NEGATIVE") {
    issues.push("High investment score conflicts with negative news sentiment");
    confidenceAdjustment -= 8;
    adjustments.push("Reduced confidence due to bearish sentiment despite strong fundamentals");
  }

  if (overallScore > 65 && riskScore < 30) {
    issues.push("Recommendation is INVEST but risk score indicates HIGH overall risk");
    confidenceAdjustment -= 10;
    adjustments.push("Confidence reduced due to elevated risk profile");
    if (overallScore < 70) {
      revisedRecommendation = "WATCH";
      adjustments.push("Recommendation revised from INVEST to WATCH due to high risk");
    }
  }

  if (overallScore < 40 && state.sentiment?.overall === "POSITIVE") {
    issues.push("Low investment score conflicts with positive news sentiment");
    confidenceAdjustment += 5;
    adjustments.push("Slight confidence increase due to positive market sentiment");
  }

  // 3. Missing critical risk categories
  const riskCategories = state.risks?.risks?.map((r) => r.category) ?? [];
  if (state.valuation?.peRatio && state.valuation.peRatio > 40 && !riskCategories.includes("VALUATION")) {
    issues.push("High P/E ratio detected but VALUATION risk not explicitly flagged");
    adjustments.push("Valuation risk noted: P/E > 40 suggests premium pricing");
    confidenceAdjustment -= 5;
  }

  // 4. Decide if more research needed (max 1 loopback)
  if (issues.length >= 4 && (state.loopCount ?? 0) < 1) {
    requiresMoreResearch = true;
  }

  const finalConfidence = Math.max(10, Math.min(99, (state.confidence ?? 50) + confidenceAdjustment));
  const passed = issues.length === 0 || !requiresMoreResearch;

  const reflection: ReflectionResult = {
    passed,
    issues,
    adjustments,
    confidenceAdjustment,
    requiresMoreResearch,
    revisedRecommendation,
    notes: issues.length === 0
      ? "All validation checks passed. Recommendation is well-supported by available evidence."
      : `${issues.length} issue(s) identified. Confidence adjusted by ${confidenceAdjustment > 0 ? "+" : ""}${confidenceAdjustment}.`,
  };

  const log: AgentLogEntry = {
    nodeName: "Reflection & Validation",
    status: "COMPLETED",
    startedAt,
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - start,
    outputSummary: `Validation ${passed ? "PASSED" : "FLAGGED"}. ${issues.length} issue(s). Confidence: ${state.confidence ?? "N/A"} → ${finalConfidence}. Final recommendation: ${revisedRecommendation}`,
  };

  return {
    reflection,
    confidence: finalConfidence,
    recommendation: revisedRecommendation,
    loopCount: (state.loopCount ?? 0) + 1,
    logs: [log],
  };
}
