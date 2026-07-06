// ─────────────────────────────────────────────────────────────────────────────
// src/agents/graph.ts
// LangGraph workflow definition — the core AI agent orchestration engine
// ─────────────────────────────────────────────────────────────────────────────
import { StateGraph, END } from "@langchain/langgraph";
import { AgentStateAnnotation, type GraphState } from "@/agents/state";
import { plannerNode } from "@/agents/nodes/planner";
import { companyResearchNode } from "@/agents/nodes/companyResearch";
import { financialAnalysisNode } from "@/agents/nodes/financialAnalysis";
import { newsAnalysisNode } from "@/agents/nodes/newsAnalysis";
import { riskAnalysisNode } from "@/agents/nodes/riskAnalysis";
import { growthAnalysisNode } from "@/agents/nodes/growthAnalysis";
import { decisionNode } from "@/agents/nodes/decision";
import { reflectionNode } from "@/agents/nodes/reflection";
import { reportGeneratorNode } from "@/agents/nodes/reportGenerator";

// ── Conditional edge: route after company research ─────────────────────────
function routeAfterCompanyResearch(state: GraphState): string {
  return state.error ? END : "financial_analysis";
}

// ── Conditional edge: route after validation ──────────────────────────────
function routeAfterValidation(state: GraphState): string {
  // Allow 1 loopback to retry research if critically insufficient data
  if (state.reflection?.requiresMoreResearch && (state.loopCount ?? 0) <= 1) {
    return "company_research";
  }
  return "report_generator";
}

// ── Build the investment research graph ────────────────────────────────────
export function buildInvestmentGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode("planner", plannerNode)
    .addNode("company_research", companyResearchNode)
    .addNode("financial_analysis", financialAnalysisNode)
    .addNode("news_analysis", newsAnalysisNode)
    .addNode("risk_analysis", riskAnalysisNode)
    .addNode("growth_analysis", growthAnalysisNode)
    .addNode("decision", decisionNode)
    .addNode("validate", reflectionNode)          // renamed: 'reflection' conflicts with state channel
    .addNode("report_generator", reportGeneratorNode)
    // Edge definitions
    .addEdge("__start__", "planner")
    .addEdge("planner", "company_research")
    .addConditionalEdges("company_research", routeAfterCompanyResearch, {
      financial_analysis: "financial_analysis",
      [END]: END,
    })
    .addEdge("financial_analysis", "news_analysis")
    .addEdge("news_analysis", "risk_analysis")
    .addEdge("risk_analysis", "growth_analysis")
    .addEdge("growth_analysis", "decision")
    .addEdge("decision", "validate")
    .addConditionalEdges("validate", routeAfterValidation, {
      company_research: "company_research",
      report_generator: "report_generator",
    })
    .addEdge("report_generator", END);

  return graph.compile();
}

export type InvestmentGraph = ReturnType<typeof buildInvestmentGraph>;
