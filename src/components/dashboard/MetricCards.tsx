"use client";
import type { FinancialData } from "@/types/agent";

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  const isUnavailable = value === "N/A" || value === "—";
  return (
    <div style={{
      padding: "16px", borderRadius: "10px",
      background: "var(--bg-secondary)", border: "1px solid var(--bg-border)",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{
        fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-mono)",
        color: isUnavailable ? "var(--text-muted)" : "var(--text-primary)",
      }}>
        {value}
      </div>
      {note && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{note}</div>}
    </div>
  );
}

function fmt(val?: number | null): string {
  if (val == null) return "N/A";
  if (Math.abs(val) >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toFixed(2)}`;
}

export function MetricCards({
  financials,
  valuation,
}: {
  financials?: FinancialData;
  valuation?: { peRatio?: number; pegRatio?: number; evToEbitda?: number; priceToSales?: number; currentPrice?: number };
}) {
  const latest = financials?.metrics?.sort((a, b) => b.year - a.year)[0];

  return (
    <div className="terminal-card" style={{ padding: "24px" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Financial Metrics
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
        <Metric label="Revenue" value={fmt(latest?.revenue)} note={latest ? `FY${latest.year}` : undefined} />
        <Metric label="Net Income" value={fmt(latest?.netIncome)} />
        <Metric label="Free Cash Flow" value={fmt(latest?.freeCashFlow)} />
        <Metric label="Operating Margin" value={latest?.operatingMargin != null ? `${latest.operatingMargin.toFixed(1)}%` : "N/A"} />
        <Metric label="Rev. Growth YoY" value={financials?.revenueGrowthYoY != null ? `${financials.revenueGrowthYoY.toFixed(1)}%` : "N/A"} />
        <Metric label="Debt/Equity" value={latest?.debtToEquity != null ? latest.debtToEquity.toFixed(2) : "N/A"} />
        <Metric label="EPS" value={latest?.eps != null ? `$${latest.eps.toFixed(2)}` : "N/A"} />
        <Metric label="Return on Equity" value={latest?.returnOnEquity != null ? `${latest.returnOnEquity.toFixed(1)}%` : "N/A"} />
        {valuation && <>
          <Metric label="P/E Ratio" value={valuation.peRatio != null ? `${valuation.peRatio.toFixed(1)}x` : "N/A"} />
          <Metric label="PEG Ratio" value={valuation.pegRatio != null ? valuation.pegRatio.toFixed(2) : "N/A"} />
          <Metric label="EV/EBITDA" value={valuation.evToEbitda != null ? `${valuation.evToEbitda.toFixed(1)}x` : "N/A"} />
          <Metric label="Price/Sales" value={valuation.priceToSales != null ? `${valuation.priceToSales.toFixed(2)}x` : "N/A"} />
          <Metric label="Current Price" value={valuation.currentPrice != null ? `$${valuation.currentPrice.toFixed(2)}` : "N/A"} />
        </>}
      </div>

      {financials?.availabilityNotes && financials.availabilityNotes.length > 0 && (
        <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <div style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: 600, marginBottom: "4px" }}>Data Coverage Notes</div>
          {financials.availabilityNotes.map((n, i) => (
            <div key={i} style={{ fontSize: "12px", color: "var(--text-muted)" }}>• {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
