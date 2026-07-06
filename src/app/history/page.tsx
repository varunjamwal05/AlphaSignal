"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, Loader2 } from "lucide-react";

interface HistoryItem {
  id: string;
  company: string;
  ticker: string;
  recommendation: string;
  score: number;
  confidence: number;
  summary: string;
  createdAt: string;
}

const recColor = (r: string) =>
  r === "INVEST" ? "var(--accent-green)" : r === "WATCH" ? "var(--accent-amber)" : "var(--accent-red)";
const recBg = (r: string) =>
  r === "INVEST" ? "rgba(16,185,129,0.08)" : r === "WATCH" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";

export default function HistoryPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery<{ history: HistoryItem[] }>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/history").then((r) => r.json()),
    staleTime: 10_000,
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Research History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>All previous investment research reports</p>
      </div>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={24} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}
      {isError && (
        <div style={{ padding: "20px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          Failed to load history
        </div>
      )}

      {data?.history?.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <TrendingUp size={40} style={{ marginBottom: "16px", opacity: 0.3 }} />
          <p>No research history yet. Search for a company on the dashboard to get started.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data?.history?.map((item) => (
          <div key={item.id}
            className="terminal-card"
            onClick={() => router.push(`/?restore=${item.id}`)}
            style={{ padding: "18px 22px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "16px" }}>{item.company}</span>
                <span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--bg-border)" }}>
                  {item.ticker}
                </span>
                <span style={{
                  padding: "2px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                  color: recColor(item.recommendation), background: recBg(item.recommendation),
                  border: `1px solid ${recColor(item.recommendation)}44`,
                }}>
                  {item.recommendation}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {item.summary?.substring(0, 150)}{item.summary?.length > 150 ? "…" : ""}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", color: "var(--text-muted)", fontSize: "11px" }}>
                <Clock size={11} />
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: recColor(item.recommendation) }}>
                {item.score.toFixed(0)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
