"use client";
import type { Citation } from "@/types/agent";
import { ExternalLink } from "lucide-react";

const SOURCE_ICON: Record<string, string> = {
  "YAHOO_FINANCE": "📊",
  "SEC_FILING": "📋",
  "NEWS": "📰",
  "COMPANY_IR": "🏢",
  "LLM_SUMMARY": "🤖",
  "FINANCIAL_API": "💹",
};

export function CitationsPanel({ citations }: { citations?: Citation[] }) {
  if (!citations || citations.length === 0) return null;

  const unique = citations.filter((c, i, arr) =>
    arr.findIndex((x) => x.source === c.source && x.section === c.section) === i
  );

  return (
    <div className="terminal-card" style={{ padding: "24px" }}>
      <h3 style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
        Data Sources & Citations
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {unique.map((c, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "5px 12px", borderRadius: "100px",
            background: "var(--bg-secondary)", border: "1px solid var(--bg-border)",
            fontSize: "12px", color: "var(--text-secondary)",
          }}>
            <span>{SOURCE_ICON[c.type] ?? "📌"}</span>
            <span>{c.source}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span style={{ color: "var(--text-muted)" }}>{c.section}</span>
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} color="var(--text-muted)" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
