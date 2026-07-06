"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, History, GitCompare, Settings } from "lucide-react";

const navLinks = [
  { href: "/", label: "Research" },
  { href: "/history", label: "History" },
  { href: "/compare", label: "Compare" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "rgba(9, 10, 15, 0.95)",
      borderBottom: "1px solid var(--bg-border)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      height: "64px",
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 24px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #10b981, #3b82f6)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.3px" }}>
            Alpha<span className="gradient-text">Signal</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px" }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "6px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
              background: pathname === link.href ? "var(--bg-card)" : "transparent",
              border: pathname === link.href ? "1px solid var(--bg-border)" : "1px solid transparent",
              transition: "all 0.15s",
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent-green)",
            boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)",
          }} className="pulse-dot" />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>LIVE</span>
        </div>
      </div>
    </nav>
  );
}
