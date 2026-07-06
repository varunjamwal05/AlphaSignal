"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Shield, Zap, ChevronRight, Activity } from "lucide-react";

const EXAMPLE_COMPANIES = ["NVIDIA", "Apple", "Microsoft", "Tesla", "Amazon", "Alphabet", "Meta", "Netflix"];

const FEATURES = [
  { icon: Activity, title: "Real Financial Data", desc: "Live metrics from Yahoo Finance — no fabricated numbers, ever." },
  { icon: Zap, title: "LangGraph AI Agent", desc: "Multi-node autonomous workflow with planning, reflection, and validation." },
  { icon: Shield, title: "Reflection & Validation", desc: "AI cross-checks its own conclusions before issuing a recommendation." },
  { icon: TrendingUp, title: "Weighted Scoring", desc: "Financial health, growth, risk, sentiment and valuation — all scored." },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (company: string) => {
    if (!company.trim()) return;
    sessionStorage.setItem("research_company", company.trim());
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <section style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "5px 14px", borderRadius: "100px",
          background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)",
          marginBottom: "32px", fontSize: "12px", fontWeight: 600, color: "var(--accent-green)",
          letterSpacing: "0.5px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }} className="pulse-dot" />
          AI INVESTMENT RESEARCH AGENT
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 68px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-2px",
          marginBottom: "20px",
          maxWidth: "800px",
        }}>
          Research Any Stock.{" "}
          <br />
          <span className="gradient-text">AI-Powered. Evidence-Backed.</span>
        </h1>

        <p style={{
          fontSize: "18px", color: "var(--text-secondary)",
          maxWidth: "560px", lineHeight: 1.7, marginBottom: "48px",
        }}>
          Our autonomous LangGraph agent fetches real financial data, analyzes news sentiment, evaluates risk, and delivers a transparent investment recommendation in minutes.
        </p>

        {/* Search bar */}
        <div style={{
          display: "flex", gap: "12px", width: "100%", maxWidth: "600px",
          padding: "6px 6px 6px 20px",
          background: "var(--bg-card)", border: "1px solid var(--bg-border)",
          borderRadius: "14px", marginBottom: "20px",
          boxShadow: "0 4px 40px rgba(0,0,0,0.4)",
        }}>
          <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <input
            className="terminal-input"
            style={{ background: "transparent", border: "none", padding: "0", borderRadius: "0", fontSize: "16px" }}
            placeholder="Search company (e.g. NVIDIA, Apple, Tesla…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            autoFocus
          />
          <button
            id="search-btn"
            className="btn-primary"
            style={{ flexShrink: 0, fontSize: "14px" }}
            onClick={() => handleSearch(query)}
            disabled={!query.trim()}
          >
            Analyze →
          </button>
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {EXAMPLE_COMPANIES.map((c) => (
            <button key={c} onClick={() => handleSearch(c)} style={{
              padding: "5px 14px", borderRadius: "100px",
              background: "var(--bg-card)", border: "1px solid var(--bg-border)",
              color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"; (e.target as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "var(--bg-border)"; (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 24px 80px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "12px" }}>
            Powered by Real AI Engineering
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Not a chatbot. A production-grade multi-step agent with tool calling and reflection.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="terminal-card" style={{ padding: "24px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
              }}>
                <f.icon size={20} color="var(--accent-blue)" />
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "15px" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "20px 24px", textAlign: "center",
        borderTop: "1px solid var(--bg-border)",
        color: "var(--text-muted)", fontSize: "12px",
      }}>
        AlphaSignal AI Research Agent · Built with LangGraph + Next.js 15 · For educational and research purposes only
      </footer>
    </div>
  );
}
