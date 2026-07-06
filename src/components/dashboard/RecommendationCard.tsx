"use client";
import type { WeightedScores } from "@/types/agent";
import { Loader2 } from "lucide-react";

function RecommendationBadge({ rec }: { rec?: string }) {
  const map: Record<string, { bg: string; border: string; color: string; emoji: string; label: string }> = {
    INVEST: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.4)", color: "#10b981", emoji: "▲", label: "BUY / INVEST" },
    WATCH:  { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)", color: "#f59e0b", emoji: "◆", label: "HOLD / WATCH" },
    PASS:   { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.4)",  color: "#ef4444", emoji: "▼", label: "SELL / PASS" },
  };
  const style = rec ? map[rec] : { bg: "var(--bg-card)", border: "var(--bg-border)", color: "var(--text-muted)", emoji: "?", label: "PENDING" };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "10px",
      padding: "10px 20px", borderRadius: "100px",
      background: style.bg, border: `2px solid ${style.border}`,
      color: style.color, fontWeight: 800, fontSize: "20px",
      letterSpacing: "1px",
    }}>
      <span>{style.emoji}</span>
      <span>{style.label}</span>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score?: number; color: string }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-mono)", color }}>
          {score != null ? `${score.toFixed(0)}/100` : "—"}
        </span>
      </div>
      <div style={{ height: "5px", borderRadius: "3px", background: "var(--bg-border)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "3px",
          width: `${score ?? 0}%`,
          background: color,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

export function RecommendationCard({
  recommendation,
  confidence,
  scores,
  status,
  companyName,
}: {
  recommendation?: string;
  confidence?: number;
  scores?: WeightedScores;
  status: string;
  companyName: string;
}) {
  const isLoading = status === "running" && !recommendation;

  return (
    <div className="terminal-card" style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "4px" }}>
            Investment Recommendation
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>{companyName || "—"}</h2>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13px" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Analyzing…
          </div>
        ) : (
          <RecommendationBadge rec={recommendation} />
        )}
      </div>

      {/* Confidence meter */}
      {confidence != null && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Overall Investment Score & Confidence</span>
            <span style={{
              fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)",
              color: confidence >= 65 ? "var(--accent-green)" : confidence >= 45 ? "var(--accent-amber)" : "var(--accent-red)",
            }}>
              {confidence.toFixed(0)}
            </span>
          </div>
          <div style={{ height: "8px", borderRadius: "4px", background: "var(--bg-border)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              width: `${confidence}%`,
              background: confidence >= 65
                ? "linear-gradient(90deg, #10b981, #059669)"
                : confidence >= 45
                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
              transition: "width 1s ease",
            }} />
          </div>
        </div>
      )}

      {/* Score breakdown */}
      {scores && (
        <div>
          <div className="section-divider" style={{ margin: "0 0 16px" }} />
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Score Breakdown
          </div>
          <ScoreBar label="Financial Health (30%)" score={scores.financialHealthScore} color="#10b981" />
          <ScoreBar label="Growth Outlook (25%)" score={scores.growthScore} color="#3b82f6" />
          <ScoreBar label="Risk Profile (20%)" score={scores.riskScore} color="#8b5cf6" />
          <ScoreBar label="News Sentiment (15%)" score={scores.sentimentScore} color="#f59e0b" />
          <ScoreBar label="Valuation (10%)" score={scores.valuationScore} color="#06b6d4" />
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
