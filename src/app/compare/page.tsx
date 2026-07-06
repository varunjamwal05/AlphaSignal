"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

const EXAMPLE = [["Apple", "Microsoft"], ["NVIDIA", "AMD"], ["Tesla", "Ford"]];

// Standard color palette for comparison
const COLOR_1 = "#34d399"; // emerald-400
const COLOR_2 = "#3b82f6"; // blue-500

export default function ComparePage() {
  const [company1, setCompany1] = useState("");
  const [company2, setCompany2] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ r1: any; r2: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!company1.trim() || !company2.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`/api/compare?c1=${encodeURIComponent(company1.trim())}&c2=${encodeURIComponent(company2.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch comparison data.");
      }

      setResults({ r1: data.report1, r2: data.report2 });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar chart data
  const radarData = results ? [
    {
      subject: "Financial",
      A: results.r1.reportData?.scores?.financialHealthScore ?? 0,
      B: results.r2.reportData?.scores?.financialHealthScore ?? 0,
      fullMark: 100,
    },
    {
      subject: "Growth",
      A: results.r1.reportData?.scores?.growthScore ?? 0,
      B: results.r2.reportData?.scores?.growthScore ?? 0,
      fullMark: 100,
    },
    {
      subject: "Risk",
      A: results.r1.reportData?.scores?.riskScore ?? 0,
      B: results.r2.reportData?.scores?.riskScore ?? 0,
      fullMark: 100,
    },
    {
      subject: "Sentiment",
      A: results.r1.reportData?.scores?.sentimentScore ?? 0,
      B: results.r2.reportData?.scores?.sentimentScore ?? 0,
      fullMark: 100,
    },
    {
      subject: "Valuation",
      A: results.r1.reportData?.scores?.valuationScore ?? 0,
      B: results.r2.reportData?.scores?.valuationScore ?? 0,
      fullMark: 100,
    },
  ] : [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Compare Companies
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Analyze two companies side-by-side</p>
      </div>

      <div className="terminal-card" style={{ padding: "28px", marginBottom: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "16px", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
              Company A
            </label>
            <input
              className="terminal-input"
              placeholder="e.g. Apple, AAPL"
              value={company1}
              onChange={(e) => setCompany1(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GitCompare size={24} color="var(--text-muted)" />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
              Company B
            </label>
            <input
              className="terminal-input"
              placeholder="e.g. Microsoft, MSFT"
              value={company2}
              onChange={(e) => setCompany2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            />
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleCompare}
          disabled={loading || !company1.trim() || !company2.trim()}
          style={{ width: "100%", marginTop: "16px" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Comparing Companies…
            </span>
          ) : "Compare →"}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: "24px", padding: "16px 20px", borderRadius: "10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--accent-amber)", fontSize: "14px" }}>
          ℹ {error}
        </div>
      )}

      {!results && !loading && !error && (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            Popular Comparisons
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {EXAMPLE.map(([a, b], i) => (
              <button key={i}
                onClick={() => { setCompany1(a); setCompany2(b); handleCompare(); }}
                style={{
                  padding: "6px 16px", borderRadius: "100px", cursor: "pointer",
                  background: "var(--bg-card)", border: "1px solid var(--bg-border)",
                  color: "var(--text-secondary)", fontSize: "13px",
                  transition: "all 0.2s ease"
                }}
              >
                {a} vs {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {results && (
        <div style={{ animation: "fade-in 0.5s ease" }}>
          {/* Header Comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            {[results.r1, results.r2].map((r, i) => (
              <div key={i} className="terminal-card" style={{ padding: "24px", borderTop: `3px solid ${i === 0 ? COLOR_1 : COLOR_2}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "4px" }}>{r.ticker}</div>
                    <div style={{ fontSize: "20px", fontWeight: 700 }}>{r.company}</div>
                  </div>
                  <div style={{ 
                    padding: "6px 12px", 
                    borderRadius: "6px", 
                    fontSize: "13px", 
                    fontWeight: 700,
                    background: r.recommendation === "INVEST" ? "rgba(52, 211, 153, 0.1)" : r.recommendation === "WATCH" ? "rgba(251, 191, 36, 0.1)" : "rgba(248, 113, 113, 0.1)",
                    color: r.recommendation === "INVEST" ? "var(--accent-emerald)" : r.recommendation === "WATCH" ? "var(--accent-amber)" : "var(--accent-rose)",
                  }}>
                    {r.recommendation}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "24px" }}>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}>Total Score</div>
                    <div style={{ fontSize: "28px", fontWeight: 800 }}>{r.score.toFixed(0)}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}>Confidence</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-secondary)" }}>{r.confidence.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart + Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginBottom: "24px" }}>
            <div className="terminal-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "16px" }}>Dimension Overlap</h3>
              <div style={{ flex: 1, minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "8px" }}
                      itemStyle={{ color: "var(--text-primary)", fontSize: "13px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)" }} />
                    <Radar name={results.r1.ticker} dataKey="A" stroke={COLOR_1} fill={COLOR_1} fillOpacity={0.3} />
                    <Radar name={results.r2.ticker} dataKey="B" stroke={COLOR_2} fill={COLOR_2} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="terminal-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "20px" }}>Fundamental Metrics</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Market Cap", fn: (r: any) => formatValue(r.reportData?.profile?.marketCap, 'currency') },
                  { label: "Latest Revenue", fn: (r: any) => formatValue(r.reportData?.financials?.metrics?.[0]?.revenue, 'currency') },
                  { label: "P/E Ratio", fn: (r: any) => formatValue(r.reportData?.valuation?.peRatio, 'number') },
                  { label: "PEG Ratio", fn: (r: any) => formatValue(r.reportData?.valuation?.pegRatio, 'number') },
                  { label: "News Sentiment", fn: (r: any) => r.reportData?.scores?.sentimentScore ? `${r.reportData.scores.sentimentScore.toFixed(0)}/100` : "N/A" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--bg-border)" }}>
                    <div style={{ width: "30%", fontSize: "13px", color: "var(--text-secondary)" }}>{row.label}</div>
                    <div style={{ width: "35%", fontSize: "14px", fontWeight: 600, color: COLOR_1, textAlign: "right", paddingRight: "16px" }}>{row.fn(results.r1)}</div>
                    <div style={{ width: "35%", fontSize: "14px", fontWeight: 600, color: COLOR_2, textAlign: "right" }}>{row.fn(results.r2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thesis Comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {[results.r1, results.r2].map((r, i) => (
              <div key={i} className="terminal-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "16px" }}>
                  {r.ticker} Investment Thesis
                </h3>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                  {r.summary || r.reportData?.report?.investmentThesis || "No thesis available."}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function formatValue(val: any, type: 'currency' | 'number' | 'percent' = 'number') {
  if (val == null) return "N/A";
  if (type === 'currency') {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  }
  if (type === 'percent') return `${val.toFixed(2)}%`;
  return typeof val === 'number' ? val.toFixed(2) : String(val);
}
