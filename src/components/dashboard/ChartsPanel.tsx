"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import type { FinancialData, WeightedScores, SentimentAnalysis } from "@/types/agent";

function ChartCard({ title, children, height = 220 }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <div className="terminal-card" style={{ padding: "20px" }}>
      <h4 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)", marginBottom: "16px" }}>
        {title}
      </h4>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

const tooltipContentStyle = { background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" };

export function ChartsPanel({
  financials,
  scores,
  sentiment,
}: {
  financials?: FinancialData;
  scores?: WeightedScores;
  sentiment?: SentimentAnalysis;
}) {
  const revenueData = financials?.metrics
    ?.sort((a, b) => a.year - b.year)
    .map((m) => ({
      year: `FY${m.year}`,
      revenue: m.revenue ? +(m.revenue / 1e9).toFixed(2) : null,
      netIncome: m.netIncome ? +(m.netIncome / 1e9).toFixed(2) : null,
    })) ?? [];

  const radarData = scores ? [
    { subject: "Financials", score: scores.financialHealthScore },
    { subject: "Growth", score: scores.growthScore },
    { subject: "Risk", score: scores.riskScore },
    { subject: "Sentiment", score: scores.sentimentScore },
    { subject: "Valuation", score: scores.valuationScore },
  ] : [];

  const pieData = sentiment ? [
    { name: "Positive", value: sentiment.positiveCount, color: "#10b981" },
    { name: "Negative", value: sentiment.negativeCount, color: "#ef4444" },
    { name: "Neutral",  value: sentiment.neutralCount,  color: "#8b9bb4" },
  ].filter((d) => d.value > 0) : [];

  const scoreBarData = scores ? [
    { name: "Financial", score: scores.financialHealthScore },
    { name: "Growth",    score: scores.growthScore },
    { name: "Risk",      score: scores.riskScore },
    { name: "Sentiment", score: scores.sentimentScore },
    { name: "Valuation", score: scores.valuationScore },
  ] : [];

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4"];

  if (!financials && !scores && !sentiment) return null;

  return (
    <div className="terminal-card" style={{ padding: "24px" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "20px", fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Visual Analysis
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>

        {revenueData.length > 1 && (
          <ChartCard title="Revenue & Net Income (Billions USD)" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
                <XAxis dataKey="year" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipContentStyle} formatter={(v: unknown) => [`$${v}B`]} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRev)" name="Revenue" connectNulls />
                <Area type="monotone" dataKey="netIncome" stroke="#3b82f6" strokeWidth={2} fill="url(#colorInc)" name="Net Income" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {radarData.length > 0 && (
          <ChartCard title="Investment Score Radar" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--bg-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={tooltipContentStyle} formatter={(v: unknown) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {pieData.length > 0 && (
          <ChartCard title="News Sentiment Distribution" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipContentStyle} formatter={(v: unknown, name: unknown) => [`${v} articles`, String(name)]} />
                <Legend formatter={(v: string) => <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {scoreBarData.length > 0 && (
          <ChartCard title="Weighted Score Components" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={tooltipContentStyle} formatter={(v: unknown) => [`${v}/100`]} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}
                  fill="#3b82f6"
                  // Use gradient color per bar via cell
                >
                  {scoreBarData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
