"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

const navLinks = [
  { href: "/", label: "Research" },
  { href: "/history", label: "History" },
  { href: "/compare", label: "Compare" },
];

const TICKER_ITEMS = [
  { sym: "AAPL",  val: "+1.24%", up: true  },
  { sym: "MSFT",  val: "+0.87%", up: true  },
  { sym: "NVDA",  val: "+3.15%", up: true  },
  { sym: "TSLA",  val: "-0.42%", up: false },
  { sym: "AMZN",  val: "+0.63%", up: true  },
  { sym: "GOOGL", val: "+1.08%", up: true  },
  { sym: "META",  val: "+2.31%", up: true  },
  { sym: "AMD",   val: "-0.19%", up: false },
  { sym: "NFLX",  val: "+0.75%", up: true  },
  { sym: "COIN",  val: "-1.34%", up: false },
];

// Duplicate for seamless loop
const TAPE = [...TICKER_ITEMS, ...TICKER_ITEMS];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "rgba(3, 4, 10, 0.97)",
      borderBottom: "1px solid var(--bg-border)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* ── Ticker tape strip ── */}
      <div style={{
        height: "28px",
        borderBottom: "1px solid rgba(26, 42, 61, 0.6)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)",
      }}>
        <div className="ticker-tape-inner">
          {TAPE.map((t, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "0 24px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              borderRight: "1px solid var(--bg-border)",
            }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{t.sym}</span>
              <span style={{
                color: t.up ? "var(--accent-green)" : "var(--accent-red)",
                fontWeight: 500,
              }}>{t.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 24px",
        width: "100%",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30,
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-green))",
            borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(0,188,212,0.4)",
          }}>
            <TrendingUp size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px", fontFamily: "var(--font-mono)" }}>
            Alpha<span className="gradient-text">Signal</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "2px" }}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                padding: "5px 14px",
                borderRadius: "5px",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
                color: active ? "var(--accent-cyan)" : "var(--text-muted)",
                background: active ? "rgba(0,188,212,0.08)" : "transparent",
                border: active ? "1px solid rgba(0,188,212,0.25)" : "1px solid transparent",
                boxShadow: active ? "0 0 12px rgba(0,188,212,0.15)" : "none",
                transition: "all 0.15s",
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--accent-green)",
            boxShadow: "0 0 8px rgba(0, 230, 118, 0.8)",
          }} className="pulse-dot" />
          <span style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "var(--accent-green)",
            letterSpacing: "1px",
          }}>LIVE</span>
        </div>
      </div>
    </nav>
  );
}
