// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/decision.ts
// Weighted scoring engine — computes final investment score and recommendation
// ─────────────────────────────────────────────────────────────────────────────
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, WeightedScores, EvidenceItem } from "@/types/agent";

const WEIGHTS = {
  financialHealth: 0.30,
  growth: 0.25,
  risk: 0.20,
  sentiment: 0.15,
  valuation: 0.10,
};

// ── Score financial health (0-100) ────────────────────────────────────────────
function scoreFinancialHealth(state: GraphState): number {
  let score = 50;
  const metrics = state.financials?.metrics?.sort((a, b) => b.year - a.year) ?? [];
  const latest = metrics[0];
  if (!latest) return score;

  if (latest.operatingMargin != null) score += latest.operatingMargin > 20 ? 10 : latest.operatingMargin > 10 ? 5 : -5;
  if (latest.freeCashFlow != null && latest.freeCashFlow > 0) score += 10;
  if (latest.debtToEquity != null) score += latest.debtToEquity < 0.5 ? 10 : latest.debtToEquity < 1.5 ? 0 : -10;
  if (latest.returnOnEquity != null) score += latest.returnOnEquity > 15 ? 10 : latest.returnOnEquity > 8 ? 5 : -5;
  if (state.financials?.revenueGrowthYoY != null) score += state.financials.revenueGrowthYoY > 15 ? 10 : state.financials.revenueGrowthYoY > 5 ? 5 : -5;

  return Math.max(0, Math.min(100, score));
}

// ── Score growth (0-100) ──────────────────────────────────────────────────────
function scoreGrowth(state: GraphState): number {
  return state.opportunities?.growthScore ?? 50;
}

// ── Score risk (inverted — lower risk = higher score) ────────────────────────
function scoreRisk(state: GraphState): number {
  const riskScore = state.risks?.riskScore ?? 50;
  return Math.max(0, 100 - riskScore);
}

// ── Score sentiment (0-100) ───────────────────────────────────────────────────
function scoreSentiment(state: GraphState): number {
  const s = state.sentiment?.score ?? 0;
  return Math.round(((s + 1) / 2) * 100);
}

// ── Score valuation (higher = better value) ───────────────────────────────────
function scoreValuation(state: GraphState): number {
  let score = 50;
  const v = state.valuation;
  if (!v) return score;
  if (v.peRatio != null) score += v.peRatio < 15 ? 20 : v.peRatio < 25 ? 10 : v.peRatio < 40 ? 0 : -15;
  if (v.pegRatio != null) score += v.pegRatio < 1 ? 15 : v.pegRatio < 2 ? 5 : -10;
  if (v.evToEbitda != null) score += v.evToEbitda < 10 ? 15 : v.evToEbitda < 20 ? 5 : -10;
  return Math.max(0, Math.min(100, score));
}

// ── Map score to recommendation ───────────────────────────────────────────────
function mapToRecommendation(overall: number): "INVEST" | "WATCH" | "PASS" {
  if (overall >= 65) return "INVEST";
  if (overall >= 45) return "WATCH";
  return "PASS";
}

export async function decisionNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const financialHealthScore = scoreFinancialHealth(state);
  const growthScore = scoreGrowth(state);
  const riskScore = scoreRisk(state);
  const sentimentScore = scoreSentiment(state);
  const valuationScore = scoreValuation(state);

  const overallScore = Math.round(
    financialHealthScore * WEIGHTS.financialHealth +
    growthScore * WEIGHTS.growth +
    riskScore * WEIGHTS.risk +
    sentimentScore * WEIGHTS.sentiment +
    valuationScore * WEIGHTS.valuation
  );

  const recommendation = mapToRecommendation(overallScore);

  const scores: WeightedScores = {
    financialHealthScore,
    growthScore,
    riskScore,
    sentimentScore,
    valuationScore,
    overallScore,
    weights: WEIGHTS,
  };

  // Build evidence items
  const evidence: EvidenceItem[] = [];
  const latest = state.financials?.metrics?.sort((a, b) => b.year - a.year)[0];

  if (latest?.operatingMargin != null) {
    evidence.push({ claim: "Operating Margin", supporting: `${latest.operatingMargin.toFixed(1)}%`, source: "Yahoo Finance", weight: "STRONG" });
  }
  if (state.financials?.revenueGrowthYoY != null) {
    evidence.push({ claim: "Revenue Growth YoY", supporting: `${state.financials.revenueGrowthYoY.toFixed(1)}%`, source: "Yahoo Finance", weight: "STRONG" });
  }
  if (state.valuation?.peRatio != null) {
    evidence.push({ claim: "P/E Ratio", supporting: `${state.valuation.peRatio.toFixed(1)}x`, source: "Yahoo Finance", weight: "MODERATE" });
  }
  if (state.sentiment?.overall) {
    evidence.push({ claim: "News Sentiment", supporting: `${state.sentiment.overall} (score: ${state.sentiment.score.toFixed(2)})`, source: "Yahoo Finance / Gemini", weight: "MODERATE" });
  }

  const log: AgentLogEntry = {
    nodeName: "Decision Engine",
    status: "COMPLETED",
    startedAt,
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - start,
    outputSummary: `Overall Score: ${overallScore}/100 → ${recommendation}. Financial: ${financialHealthScore}, Growth: ${growthScore}, Risk: ${riskScore}, Sentiment: ${sentimentScore}, Valuation: ${valuationScore}`,
  };

  return { scores, recommendation, confidence: overallScore, evidence, logs: [log] };
}
