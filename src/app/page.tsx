"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, TrendingDown, Activity, Zap, Shield, BarChart2 } from "lucide-react";

// ─── Static stock data (UI only) ────────────────────────────────────────────
const STOCKS = [
  { sym: "NVDA",  name: "NVIDIA",    price: 134.72, change: +4.18,  pct: "+3.21%", up: true  },
  { sym: "AAPL",  name: "Apple",     price: 211.45, change: +2.63,  pct: "+1.26%", up: true  },
  { sym: "MSFT",  name: "Microsoft", price: 447.18, change: +3.91,  pct: "+0.88%", up: true  },
  { sym: "TSLA",  name: "Tesla",     price: 248.30, change: -5.44,  pct: "-2.14%", up: false },
  { sym: "AMZN",  name: "Amazon",    price: 224.60, change: +1.20,  pct: "+0.54%", up: true  },
  { sym: "META",  name: "Meta",      price: 631.80, change: +14.22, pct: "+2.30%", up: true  },
  { sym: "GOOGL", name: "Alphabet",  price: 196.55, change: -0.82,  pct: "-0.42%", up: false },
  { sym: "AMD",   name: "AMD",       price: 162.40, change: +5.88,  pct: "+3.76%", up: true  },
];

const FEATURES = [
  { icon: Activity,   label: "Node 01", title: "Real Financial Data",    desc: "Live metrics from Yahoo Finance — no fabricated numbers." },
  { icon: Zap,        label: "Node 02", title: "LangGraph AI Agent",     desc: "Multi-step autonomous workflow with planning & validation." },
  { icon: Shield,     label: "Node 03", title: "Reflection Engine",      desc: "AI cross-checks its own conclusions before issuing signals." },
  { icon: BarChart2,  label: "Node 04", title: "Weighted Scoring",       desc: "5 dimensions: financial, growth, risk, sentiment, valuation." },
];

// ─── Animated price value ────────────────────────────────────────────────────
function AnimatedPrice({ base, up }: { base: number; up: boolean }) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      const delta = (Math.random() - 0.48) * 0.3;
      setVal((v) => Math.max(0, parseFloat((v + delta).toFixed(2))));
    }, 1800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: up ? "var(--accent-green)" : "var(--accent-red)" }}>
      ${val.toFixed(2)}
    </span>
  );
}

// ─── Candlestick SVG background ─────────────────────────────────────────────
function ChartBackground() {
  const bars = [
    { x: 30,  open: 160, close: 190, high: 200, low: 150, up: true  },
    { x: 70,  open: 190, close: 175, high: 198, low: 168, up: false },
    { x: 110, open: 175, close: 210, high: 220, low: 170, up: true  },
    { x: 150, open: 210, close: 195, high: 218, low: 188, up: false },
    { x: 190, open: 195, close: 230, high: 240, low: 190, up: true  },
    { x: 230, open: 230, close: 215, high: 238, low: 208, up: false },
    { x: 270, open: 215, close: 255, high: 265, low: 210, up: true  },
    { x: 310, open: 255, close: 240, high: 262, low: 232, up: false },
    { x: 350, open: 240, close: 275, high: 285, low: 235, up: true  },
    { x: 390, open: 275, close: 295, high: 305, low: 268, up: true  },
    { x: 430, open: 295, close: 278, high: 302, low: 270, up: false },
    { x: 470, open: 278, close: 315, high: 328, low: 274, up: true  },
    { x: 510, open: 315, close: 300, high: 322, low: 292, up: false },
    { x: 550, open: 300, close: 340, high: 352, low: 296, up: true  },
    { x: 590, open: 340, close: 328, high: 348, low: 320, up: false },
    { x: 630, open: 328, close: 365, high: 378, low: 322, up: true  },
    { x: 670, open: 365, close: 350, high: 372, low: 342, up: false },
    { x: 710, open: 350, close: 388, high: 400, low: 345, up: true  },
    { x: 750, open: 388, close: 372, high: 395, low: 365, up: false },
    { x: 790, open: 372, close: 410, high: 422, low: 368, up: true  },
  ];
  const H = 320;
  const normalize = (v: number) => H - ((v - 140) / (430 - 140)) * H;

  return (
    <svg
      viewBox="0 0 850 320"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.13, pointerEvents: "none" }}
    >
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="0" y1={i * 80} x2="850" y2={i * 80}
          stroke="#00bcd4" strokeWidth="0.5" strokeDasharray="4 8" />
      ))}
      {/* Wicks */}
      {bars.map((b) => (
        <line key={`w-${b.x}`}
          x1={b.x} y1={normalize(b.high)}
          x2={b.x} y2={normalize(b.low)}
          stroke={b.up ? "#00e676" : "#ff3d57"} strokeWidth="1.5" />
      ))}
      {/* Bodies */}
      {bars.map((b) => {
        const top    = normalize(Math.max(b.open, b.close));
        const bottom = normalize(Math.min(b.open, b.close));
        const h      = Math.max(bottom - top, 2);
        return (
          <rect key={`b-${b.x}`}
            x={b.x - 12} y={top} width={24} height={h}
            fill={b.up ? "#00e676" : "#ff3d57"}
            rx={2} />
        );
      })}
      {/* Trend line */}
      <polyline
        points={bars.map((b) => `${b.x},${normalize((b.open + b.close) / 2)}`).join(" ")}
        fill="none" stroke="#00bcd4" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
    </svg>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick]       = useState(0);

  // Rotate which stock is "flashing" for visual interest
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (company: string) => {
    if (!company.trim()) return;
    setLoading(true);
    sessionStorage.setItem("research_company", company.trim());
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", overflow: "hidden",
        padding: "70px 24px 80px",
        display: "flex", flexDirection: "column", alignItems: "center",
        borderBottom: "1px solid var(--bg-border)",
      }}>
        {/* Candlestick chart background */}
        <ChartBackground />

        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "0%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "500px",
          background: "radial-gradient(ellipse at 50% 30%, rgba(0,188,212,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* ── Stock ticker cards row ── */}
        <div style={{
          display: "flex", gap: "10px", flexWrap: "wrap",
          justifyContent: "center", marginBottom: "48px",
          position: "relative",
        }}>
          {STOCKS.slice(0, 6).map((s, i) => {
            const flash = tick % STOCKS.length === i;
            return (
              <div key={s.sym} style={{
                background: "var(--bg-card)",
                border: `1px solid ${flash ? (s.up ? "rgba(0,230,118,0.5)" : "rgba(255,61,87,0.5)") : "var(--bg-border)"}`,
                borderRadius: "6px",
                padding: "10px 14px",
                minWidth: "110px",
                transition: "border-color 0.4s, box-shadow 0.4s",
                boxShadow: flash ? (s.up ? "0 0 16px rgba(0,230,118,0.2)" : "0 0 16px rgba(255,61,87,0.2)") : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>{s.sym}</span>
                  {s.up
                    ? <TrendingUp size={12} color="var(--accent-green)" />
                    : <TrendingDown size={12} color="var(--accent-red)" />
                  }
                </div>
                <div style={{ fontSize: "15px" }}>
                  <AnimatedPrice base={s.price} up={s.up} />
                </div>
                <div style={{
                  fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 600,
                  color: s.up ? "var(--accent-green)" : "var(--accent-red)",
                  marginTop: "2px",
                }}>
                  {s.pct}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Headline ── */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "4px 14px", borderRadius: "4px",
          background: "rgba(0,230,118,0.07)",
          border: "1px solid rgba(0,230,118,0.2)",
          marginBottom: "24px",
          fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
          color: "var(--accent-green)", fontFamily: "var(--font-mono)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }} className="pulse-dot" />
          AI INVESTMENT RESEARCH TERMINAL
        </div>

        <h1 style={{
          fontSize: "clamp(34px, 5vw, 64px)",
          fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-2px",
          marginBottom: "18px",
          maxWidth: "780px",
          textAlign: "center",
          position: "relative",
        }}>
          Research Any Stock.{" "}
          <span className="gradient-text">AI-Powered. Evidence-Backed.</span>
        </h1>

        <p style={{
          fontSize: "16px", color: "var(--text-secondary)",
          maxWidth: "520px", lineHeight: 1.75, marginBottom: "40px",
          textAlign: "center", position: "relative",
        }}>
          Our autonomous LangGraph agent fetches real financial data, analyzes news sentiment,
          evaluates risk, and delivers a transparent investment recommendation in minutes.
        </p>

        {/* ── Order entry search bar ── */}
        <div style={{
          position: "relative", width: "100%", maxWidth: "600px",
          marginBottom: "16px",
        }}>
          {/* Terminal label */}
          <div style={{
            position: "absolute", top: "-22px", left: "4px",
            fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
            color: "var(--accent-cyan)", letterSpacing: "1px",
            opacity: 0.8,
          }}>
            RESEARCH TERMINAL
          </div>
          <div style={{
            display: "flex", gap: "8px",
            padding: "5px 5px 5px 16px",
            background: "var(--bg-card)",
            border: "1px solid rgba(0,188,212,0.3)",
            borderRadius: "6px",
            boxShadow: "0 0 0 1px rgba(0,188,212,0.06), 0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontSize: "14px", marginTop: "12px", opacity: 0.7, flexShrink: 0 }}>
              &gt;_
            </span>
            <input
              className="terminal-input"
              style={{ background: "transparent", border: "none", padding: "8px 0", borderRadius: "0", fontSize: "15px" }}
              placeholder="Enter ticker or company name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              autoFocus
            />
            <button
              id="search-btn"
              className="btn-primary"
              style={{ flexShrink: 0, fontSize: "11px", padding: "10px 20px" }}
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || loading}
            >
              {loading ? "ROUTING…" : "ANALYZE →"}
            </button>
          </div>
        </div>

        {/* Quick-pick chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", position: "relative" }}>
          {STOCKS.map((s) => (
            <button key={s.sym} onClick={() => handleSearch(s.sym)} style={{
              padding: "3px 10px", borderRadius: "4px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--bg-border)",
              color: "var(--text-muted)",
              fontSize: "11px", fontWeight: 600,
              fontFamily: "var(--font-mono)",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = "rgba(0,188,212,0.5)";
              (e.target as HTMLElement).style.color = "var(--accent-cyan)";
              (e.target as HTMLElement).style.boxShadow = "0 0 8px rgba(0,188,212,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = "var(--bg-border)";
              (e.target as HTMLElement).style.color = "var(--text-muted)";
              (e.target as HTMLElement).style.boxShadow = "none";
            }}>
              {s.sym}
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIVE MARKET STRIP
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--bg-border)",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          borderLeft: "1px solid var(--bg-border)",
        }}>
          {[
            { label: "Market Status",  value: "OPEN",   sub: "NYSE · NASDAQ",       color: "var(--accent-green)" },
            { label: "AI Analyses",    value: "∞",      sub: "No daily limit",       color: "var(--accent-cyan)"  },
            { label: "Data Latency",   value: "~60s",   sub: "Avg. analysis time",   color: "var(--accent-amber)" },
            { label: "Signal Score",   value: "0–100",  sub: "Weighted across 5 dims",color: "var(--text-primary)" },
          ].map((m) => (
            <div key={m.label} style={{
              padding: "20px 24px",
              borderRight: "1px solid var(--bg-border)",
            }}>
              <div style={{
                fontSize: "22px", fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: m.color,
                textShadow: m.color !== "var(--text-primary)" ? `0 0 20px ${m.color}55` : "none",
                marginBottom: "4px",
              }}>{m.value}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", opacity: 0.7 }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px 80px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-block",
            fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-mono)",
            color: "var(--accent-cyan)", letterSpacing: "1.5px",
            textTransform: "uppercase", marginBottom: "12px",
          }}>
            ── System Architecture ──
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "10px" }}>
            Powered by Real AI Engineering
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Not a chatbot. A production-grade multi-step agent with tool calling and reflection.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="terminal-card" style={{ padding: "28px 24px" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "18px",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "6px",
                  background: "rgba(0,188,212,0.08)",
                  border: "1px solid rgba(0,188,212,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <f.icon size={18} color="var(--accent-cyan)" />
                </div>
                <span style={{
                  fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
                  color: "var(--text-muted)", letterSpacing: "1px",
                }}>{f.label}</span>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "15px" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--bg-border)",
        background: "var(--bg-secondary)",
        textAlign: "center",
      }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
          HIDDENEDGE RESEARCH TERMINAL · LANGGRAPH + NEXT.JS 15 · FOR EDUCATIONAL USE ONLY
        </span>
      </footer>

      <style>{`
        @keyframes float-up {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
