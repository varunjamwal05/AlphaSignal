"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { AgentTimeline } from "@/components/dashboard/AgentTimeline";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { ChartsPanel } from "@/components/dashboard/ChartsPanel";
import { CitationsPanel } from "@/components/dashboard/CitationsPanel";
import { ReportPanel } from "@/components/dashboard/ReportPanel";
import type { FinalReport, WeightedScores, FinancialData, Valuation, NewsArticle, SentimentAnalysis, RiskAssessment, GrowthOpportunities, Citation, AgentLogEntry } from "@/types/agent";

interface StreamLog { node: string; status: string; summary: string; elapsedMs?: number; }

export interface DashboardState {
  logs: StreamLog[];
  scores?: WeightedScores;
  recommendation?: string;
  confidence?: number;
  report?: FinalReport;
  financials?: FinancialData;
  valuation?: Valuation;
  news?: NewsArticle[];
  sentiment?: SentimentAnalysis;
  risks?: RiskAssessment;
  opportunities?: GrowthOpportunities;
  citations?: Citation[];
  error?: string;
  status: "idle" | "running" | "complete" | "error";
  historyId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [state, setState] = useState<DashboardState>({ logs: [], status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("research_company");
    if (saved) {
      sessionStorage.removeItem("research_company");
      setSearchInput(saved);
      startResearch(saved);
    }
  }, []);

  const startResearch = async (companyName: string) => {
    if (!companyName.trim()) return;
    setCompany(companyName.trim());
    setState({ logs: [], status: "running" });

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName.trim() }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split("\n");
          let eventType = "message";
          let dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            if (line.startsWith("data: ")) dataStr = line.slice(6);
          }
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            handleStreamEvent(eventType, data);
          } catch { /* malformed */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setState((s) => ({ ...s, status: "error", error: String(err) }));
      }
    }
  };

  const handleStreamEvent = (event: string, data: Record<string, unknown>) => {
    switch (event) {
      case "node_complete":
        setState((s) => ({
          ...s,
          logs: [...s.logs, data as unknown as StreamLog],
        }));
        break;
      case "scores_update":
        setState((s) => ({ ...s, scores: data as unknown as WeightedScores }));
        break;
      case "recommendation_update":
        setState((s) => ({
          ...s,
          recommendation: data.recommendation as string,
          confidence: data.confidence as number,
        }));
        break;
      case "complete":
        setState((s) => ({
          ...s,
          status: "complete",
          historyId: data.historyId as string,
          report: data.report as unknown as FinalReport,
        }));
        break;
      case "error":
        setState((s) => ({ ...s, status: "error", error: data.message as string }));
        break;
    }
  };

  const handleNewSearch = () => {
    if (!searchInput.trim()) return;
    startResearch(searchInput.trim());
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* Search bar */}
      <div style={{
        display: "flex", gap: "12px", marginBottom: "28px",
        padding: "6px 6px 6px 18px",
        background: "var(--bg-card)", border: "1px solid var(--bg-border)",
        borderRadius: "12px",
      }}>
        <Search size={20} color="var(--text-muted)" style={{ marginTop: "10px", flexShrink: 0 }} />
        <input
          className="terminal-input"
          style={{ background: "transparent", border: "none", padding: "8px 0", borderRadius: 0 }}
          placeholder="Enter company name or ticker (e.g. NVIDIA, AAPL)…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNewSearch()}
          disabled={state.status === "running"}
        />
        <button
          id="dashboard-search-btn"
          className="btn-primary"
          onClick={handleNewSearch}
          disabled={state.status === "running" || !searchInput.trim()}
          style={{ flexShrink: 0 }}
        >
          {state.status === "running" ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Analyzing…
            </span>
          ) : "Analyze →"}
        </button>
      </div>

      {/* Error */}
      {state.status === "error" && (
        <div style={{
          padding: "16px 20px", borderRadius: "10px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#ef4444", marginBottom: "20px",
        }}>
          ⚠ {state.error ?? "An error occurred"}
        </div>
      )}

      {/* Main layout */}
      {state.status !== "idle" && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left column — agent timeline */}
          <div style={{ position: "sticky", top: "84px" }}>
            <AgentTimeline logs={state.logs} status={state.status} company={company} />
          </div>

          {/* Right column — results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
            <RecommendationCard
              recommendation={state.recommendation}
              confidence={state.confidence}
              scores={state.scores}
              status={state.status}
              companyName={company}
            />

            {state.report && (
              <>
                <MetricCards financials={state.report as unknown as FinancialData} valuation={undefined} />
                <ChartsPanel financials={state.report as unknown as FinancialData} scores={state.scores} sentiment={undefined} />
                <NewsPanel news={[]} sentiment={undefined} />
                <RiskPanel risks={undefined} opportunities={undefined} />
                <CitationsPanel citations={state.report ? [] : []} />
                <ReportPanel report={state.report} historyId={state.historyId} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {state.status === "idle" && (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Research a company to get started
          </h2>
          <p style={{ fontSize: "14px" }}>Enter any publicly listed company above and our AI agent will analyze it.</p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
