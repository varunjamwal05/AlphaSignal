"use client";
import type { RiskAssessment, GrowthOpportunities } from "@/types/agent";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";

const severityColor = (s: string) =>
  s === "HIGH" ? "#ef4444" : s === "MEDIUM" ? "#f59e0b" : "#10b981";
const severityBg = (s: string) =>
  s === "HIGH" ? "rgba(239,68,68,0.08)" : s === "MEDIUM" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.06)";

export function RiskPanel({
  risks,
  opportunities,
}: {
  risks?: RiskAssessment;
  opportunities?: GrowthOpportunities;
}) {
  if (!risks && !opportunities) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
      {/* Risk Panel */}
      {risks && (
        <div className="terminal-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={14} />
              Risk Analysis
            </h3>
            <div style={{
              padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
              color: severityColor(risks.overallRiskLevel),
              background: severityBg(risks.overallRiskLevel),
              border: `1px solid ${severityColor(risks.overallRiskLevel)}44`,
            }}>
              {risks.overallRiskLevel} RISK
            </div>
          </div>

          {risks.summary && (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
              {risks.summary}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {risks.risks.map((r, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: "8px",
                background: severityBg(r.severity), border: `1px solid ${severityColor(r.severity)}22`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{r.category}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    color: severityColor(r.severity), flexShrink: 0,
                  }}>
                    ● {r.severity}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Panel */}
      {opportunities && (
        <div className="terminal-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={14} />
              Growth Outlook
            </h3>
            <div style={{
              padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
              color: "#3b82f6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)",
            }}>
              {opportunities.growthScore}/100
            </div>
          </div>

          {opportunities.summary && (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
              {opportunities.summary}
            </p>
          )}

          {opportunities.competitiveAdvantages.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Competitive Moats</div>
              {opportunities.competitiveAdvantages.map((a, i) => (
                <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "3px 0" }}>
                  ▸ {a}
                </div>
              ))}
            </div>
          )}

          {opportunities.opportunities.slice(0, 4).map((o, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: "8px",
              background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)",
              marginBottom: "6px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{o.description}</span>
                {o.timeHorizon && (
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {o.timeHorizon.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
