"use client";
import type { FinalReport } from "@/types/agent";
import { Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function ReportPanel({ report, historyId }: { report?: FinalReport; historyId?: string | null }) {
  const [showMarkdown, setShowMarkdown] = useState(false);

  if (!report) return null;

  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const lines = report.markdownReport
      .replace(/#{1,6} /g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .split("\n")
      .filter(Boolean);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${report.companyName} (${report.ticker})`, 15, 20);
    doc.setFontSize(12);
    doc.text(`Investment Score: ${report.investmentScore}/100 | ${report.recommendation} | Confidence: ${report.confidence}%`, 15, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let y = 45;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 15; }
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, 15, y);
      y += wrapped.length * 5 + 2;
    }
    doc.save(`${report.ticker}-investment-report.pdf`);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([report.markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.ticker}-investment-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="terminal-card" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Investment Report
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExportMarkdown} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
            background: "var(--bg-secondary)", border: "1px solid var(--bg-border)",
            color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500,
          }}>
            <FileText size={14} />
            Markdown
          </button>
          <button onClick={handleExportPDF} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
            color: "#3b82f6", fontSize: "12px", fontWeight: 600,
          }}>
            <Download size={14} />
            PDF Export
          </button>
        </div>
      </div>

      {/* Investment Thesis */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
          Investment Thesis
        </div>
        <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-primary)" }}>
          {report.investmentThesis}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-green)", textTransform: "uppercase", marginBottom: "8px" }}>▲ Strengths</div>
          {report.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "4px 0", borderBottom: "1px solid var(--bg-border)" }}>
              {s}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-red)", textTransform: "uppercase", marginBottom: "8px" }}>▼ Weaknesses</div>
          {report.weaknesses.map((w, i) => (
            <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "4px 0", borderBottom: "1px solid var(--bg-border)" }}>
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Full markdown toggle */}
      <button onClick={() => setShowMarkdown(!showMarkdown)} style={{
        display: "flex", alignItems: "center", gap: "6px",
        background: "none", border: "1px solid var(--bg-border)",
        color: "var(--text-muted)", fontSize: "12px", cursor: "pointer",
        padding: "7px 14px", borderRadius: "8px", width: "100%", justifyContent: "center",
      }}>
        {showMarkdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showMarkdown ? "Hide" : "Show"} Full Markdown Report
      </button>

      {showMarkdown && (
        <pre style={{
          marginTop: "16px", padding: "16px", borderRadius: "8px",
          background: "var(--bg-secondary)", border: "1px solid var(--bg-border)",
          fontSize: "12px", fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)", overflow: "auto",
          maxHeight: "500px", whiteSpace: "pre-wrap", lineHeight: 1.6,
        }}>
          {report.markdownReport}
        </pre>
      )}
    </div>
  );
}
