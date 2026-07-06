// ─────────────────────────────────────────────────────────────────────────────
// src/agents/state.ts
// LangGraph agent state definition using Annotation API
// ─────────────────────────────────────────────────────────────────────────────
import { Annotation } from "@langchain/langgraph";
import type {
  AgentState,
  CompanyProfile,
  FinancialData,
  Valuation,
  NewsArticle,
  SentimentAnalysis,
  RiskAssessment,
  GrowthOpportunities,
  WeightedScores,
  EvidenceItem,
  Citation,
  ReflectionResult,
  FinalReport,
  AgentLogEntry,
} from "@/types/agent";

export const AgentStateAnnotation = Annotation.Root({
  company: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  ticker: Annotation<string | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  plan: Annotation<AgentState["plan"] | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  profile: Annotation<CompanyProfile | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  financials: Annotation<FinancialData | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  valuation: Annotation<Valuation | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  news: Annotation<NewsArticle[] | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  sentiment: Annotation<SentimentAnalysis | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  risks: Annotation<RiskAssessment | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  opportunities: Annotation<GrowthOpportunities | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  scores: Annotation<WeightedScores | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  confidence: Annotation<number | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  recommendation: Annotation<"INVEST" | "PASS" | "WATCH" | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  evidence: Annotation<EvidenceItem[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  citations: Annotation<Citation[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  toolResults: Annotation<Record<string, unknown>>({
    reducer: (a, b) => ({ ...(a ?? {}), ...(b ?? {}) }),
    default: () => ({}),
  }),
  reflection: Annotation<ReflectionResult | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  report: Annotation<FinalReport | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  logs: Annotation<AgentLogEntry[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  error: Annotation<string | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  loopCount: Annotation<number>({
    reducer: (_, b) => b ?? 0,
    default: () => 0,
  }),
});

export type GraphState = typeof AgentStateAnnotation.State;
