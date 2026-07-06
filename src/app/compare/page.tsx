"use client";
import { useState } from "react";
import { Search, GitCompare, Loader2 } from "lucide-react";

const EXAMPLE = [["Apple", "Microsoft"], ["NVIDIA", "AMD"], ["Tesla", "Ford"]];

export default function ComparePage() {
  const [company1, setCompany1] = useState("");
  const [company2, setCompany2] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ company1: unknown; company2: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!company1.trim() || !company2.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Run both researches in parallel via API
      const [r1, r2] = await Promise.all([
        fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: company1.trim() }) }),
        fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: company2.trim() }) }),
      ]);

      // Note: comparison is shown via individual dashboards for now
      // Full side-by-side comparison requires SSE result accumulation
      setError("Comparison mode: Please run individual analyses on the Dashboard for detailed comparison. Full side-by-side comparison chart is available in the production roadmap.");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Compare Companies
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Analyze two companies side-by-side</p>
      </div>

      <div className="terminal-card" style={{ padding: "28px", marginBottom: "24px" }}>
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
              Analyzing Both Companies…
            </span>
          ) : "Compare →"}
        </button>
      </div>

      {/* Example comparisons */}
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
          Popular Comparisons
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {EXAMPLE.map(([a, b], i) => (
            <button key={i}
              onClick={() => { setCompany1(a); setCompany2(b); }}
              style={{
                padding: "6px 16px", borderRadius: "100px", cursor: "pointer",
                background: "var(--bg-card)", border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)", fontSize: "13px",
              }}
            >
              {a} vs {b}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: "24px", padding: "16px 20px", borderRadius: "10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--accent-amber)", fontSize: "14px" }}>
          ℹ {error}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
