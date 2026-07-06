"use client";
import type { NewsArticle, SentimentAnalysis } from "@/types/agent";
import { ExternalLink } from "lucide-react";

export function NewsPanel({ news, sentiment }: { news?: NewsArticle[]; sentiment?: SentimentAnalysis }) {
  if (!news || news.length === 0) return null;

  const sentColor = (s?: string) =>
    s === "POSITIVE" ? "var(--accent-green)" : s === "NEGATIVE" ? "var(--accent-red)" : "var(--text-muted)";
  const sentBg = (s?: string) =>
    s === "POSITIVE" ? "rgba(16,185,129,0.08)" : s === "NEGATIVE" ? "rgba(239,68,68,0.08)" : "var(--bg-secondary)";

  return (
    <div className="terminal-card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Recent News ({news.length})
        </h3>
        {sentiment && (
          <div style={{
            padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
            background: sentBg(sentiment.overall), color: sentColor(sentiment.overall),
            border: `1px solid ${sentColor(sentiment.overall)}44`,
          }}>
            Overall: {sentiment.overall} ({sentiment.score >= 0 ? "+" : ""}{sentiment.score.toFixed(2)})
          </div>
        )}
      </div>

      {sentiment?.summary && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--bg-border)", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {sentiment.summary}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {news.slice(0, 10).map((article, i) => (
          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "12px 14px", borderRadius: "8px",
              background: sentBg(article.sentiment),
              border: `1px solid var(--bg-border)`,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bg-border)")}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: "4px" }}>
                  {article.title}
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <span>{article.source}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                {article.sentiment && (
                  <div style={{ fontSize: "10px", fontWeight: 700, color: sentColor(article.sentiment), textTransform: "uppercase" }}>
                    {article.sentiment}
                  </div>
                )}
                <ExternalLink size={12} color="var(--text-muted)" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
