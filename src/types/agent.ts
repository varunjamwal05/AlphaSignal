// ─────────────────────────────────────────────────────────────────────────────
// src/types/agent.ts
// Core TypeScript interfaces & Zod schemas for the LangGraph agent state
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── Citation ──────────────────────────────────────────────────────────────────
export const CitationSchema = z.object({
  source: z.string(),
  url: z.string().optional(),
  type: z.enum(["FINANCIAL_API", "YAHOO_FINANCE", "SEC_FILING", "NEWS", "COMPANY_IR", "LLM_SUMMARY"]),
  section: z.string(),
  retrievedAt: z.string(),
});
export type Citation = z.infer<typeof CitationSchema>;

// ── Company Profile ───────────────────────────────────────────────────────────
export const CompanyProfileSchema = z.object({
  name: z.string(),
  ticker: z.string(),
  exchange: z.string().optional(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  ceo: z.string().optional(),
  headquarters: z.string().optional(),
  employees: z.number().optional(),
  website: z.string().optional(),
  marketCap: z.number().optional(),
  currency: z.string().default("USD"),
  ipoDate: z.string().optional(),
  country: z.string().optional(),
});
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

// ── Financial Data ────────────────────────────────────────────────────────────
export const FinancialMetricSchema = z.object({
  year: z.number(),
  period: z.string(),
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  operatingIncome: z.number().optional(),
  operatingMargin: z.number().optional(),
  grossMargin: z.number().optional(),
  ebitda: z.number().optional(),
  eps: z.number().optional(),
  freeCashFlow: z.number().optional(),
  totalDebt: z.number().optional(),
  cashAndEquivalents: z.number().optional(),
  totalAssets: z.number().optional(),
  totalEquity: z.number().optional(),
  returnOnEquity: z.number().optional(),
  currentRatio: z.number().optional(),
  debtToEquity: z.number().optional(),
});
export type FinancialMetric = z.infer<typeof FinancialMetricSchema>;

export const FinancialDataSchema = z.object({
  metrics: z.array(FinancialMetricSchema),
  revenueGrowthYoY: z.number().optional(),
  profitMargin: z.number().optional(),
  availabilityNotes: z.array(z.string()).default([]),
});
export type FinancialData = z.infer<typeof FinancialDataSchema>;

// ── Valuation ─────────────────────────────────────────────────────────────────
export const ValuationSchema = z.object({
  peRatio: z.number().optional(),
  pegRatio: z.number().optional(),
  evToEbitda: z.number().optional(),
  priceToSales: z.number().optional(),
  priceToBook: z.number().optional(),
  enterpriseValue: z.number().optional(),
  forwardPE: z.number().optional(),
  dividendYield: z.number().optional(),
  beta: z.number().optional(),
  fiftyTwoWeekHigh: z.number().optional(),
  fiftyTwoWeekLow: z.number().optional(),
  currentPrice: z.number().optional(),
  availabilityNotes: z.array(z.string()).default([]),
});
export type Valuation = z.infer<typeof ValuationSchema>;

// ── News ──────────────────────────────────────────────────────────────────────
export const NewsArticleSchema = z.object({
  title: z.string(),
  url: z.string(),
  source: z.string(),
  publishedAt: z.string(),
  summary: z.string().optional(),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const SentimentAnalysisSchema = z.object({
  overall: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]),
  score: z.number().min(-1).max(1),
  positiveCount: z.number(),
  negativeCount: z.number(),
  neutralCount: z.number(),
  summary: z.string(),
  keyThemes: z.array(z.string()),
});
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;

// ── Risk & Growth ─────────────────────────────────────────────────────────────
export const RiskItemSchema = z.object({
  category: z.enum(["COMPETITION", "DEBT", "REGULATORY", "MACROECONOMIC", "VALUATION", "EXECUTION", "OTHER"]),
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  description: z.string(),
  evidence: z.string().optional(),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

export const RiskAssessmentSchema = z.object({
  risks: z.array(RiskItemSchema),
  overallRiskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
  riskScore: z.number().min(0).max(100),
  summary: z.string(),
});
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

export const GrowthOpportunitiesSchema = z.object({
  opportunities: z.array(z.object({
    category: z.string(),
    description: z.string(),
    timeHorizon: z.enum(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"]).optional(),
  })),
  competitiveAdvantages: z.array(z.string()),
  innovationScore: z.number().min(0).max(100).optional(),
  marketLeadershipNotes: z.string().optional(),
  aiInitiatives: z.array(z.string()).optional(),
  growthScore: z.number().min(0).max(100),
  summary: z.string(),
});
export type GrowthOpportunities = z.infer<typeof GrowthOpportunitiesSchema>;

// ── Weighted Scores ───────────────────────────────────────────────────────────
export const WeightedScoresSchema = z.object({
  financialHealthScore: z.number().min(0).max(100),
  growthScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
  sentimentScore: z.number().min(0).max(100),
  valuationScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  weights: z.object({
    financialHealth: z.number().default(0.30),
    growth: z.number().default(0.25),
    risk: z.number().default(0.20),
    sentiment: z.number().default(0.15),
    valuation: z.number().default(0.10),
  }),
});
export type WeightedScores = z.infer<typeof WeightedScoresSchema>;

// ── Evidence ──────────────────────────────────────────────────────────────────
export const EvidenceItemSchema = z.object({
  claim: z.string(),
  supporting: z.string(),
  source: z.string(),
  weight: z.enum(["STRONG", "MODERATE", "WEAK"]),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// ── Reflection ────────────────────────────────────────────────────────────────
export const ReflectionResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()),
  adjustments: z.array(z.string()),
  confidenceAdjustment: z.number().default(0),
  requiresMoreResearch: z.boolean().default(false),
  revisedRecommendation: z.enum(["INVEST", "PASS", "WATCH"]).optional(),
  notes: z.string().optional(),
});
export type ReflectionResult = z.infer<typeof ReflectionResultSchema>;

// ── Final Report ──────────────────────────────────────────────────────────────
export const FinalReportSchema = z.object({
  companyName: z.string(),
  ticker: z.string(),
  recommendation: z.enum(["INVEST", "PASS", "WATCH"]),
  investmentScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  investmentThesis: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  growthDrivers: z.array(z.string()),
  keyRisks: z.array(z.string()),
  evidenceSummary: z.string(),
  financialSummary: z.string(),
  valuationSummary: z.string(),
  growthSummary: z.string(),
  riskSummary: z.string(),
  newsSummary: z.string(),
  markdownReport: z.string(),
  generatedAt: z.string(),
});
export type FinalReport = z.infer<typeof FinalReportSchema>;

// ── Agent Execution Log ───────────────────────────────────────────────────────
export interface AgentLogEntry {
  nodeName: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
  elapsedMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
}

// ── Full Agent State ───────────────────────────────────────────────────────────
export interface AgentState {
  company: string;
  ticker?: string;
  plan?: { steps: string[]; priority: string; toolsNeeded: string[] };
  profile?: CompanyProfile;
  financials?: FinancialData;
  valuation?: Valuation;
  news?: NewsArticle[];
  sentiment?: SentimentAnalysis;
  risks?: RiskAssessment;
  opportunities?: GrowthOpportunities;
  scores?: WeightedScores;
  confidence?: number;
  recommendation?: "INVEST" | "PASS" | "WATCH";
  evidence?: EvidenceItem[];
  citations?: Citation[];
  toolResults?: Record<string, unknown>;
  reflection?: ReflectionResult;
  report?: FinalReport;
  logs?: AgentLogEntry[];
  error?: string;
  loopCount?: number;
}
