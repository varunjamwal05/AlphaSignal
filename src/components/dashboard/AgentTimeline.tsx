"use client";
import { CheckCircle2, Circle, Loader2, XCircle, Clock } from "lucide-react";

interface StreamLog {
  node: string;
  status: string;
  summary: string;
  elapsedMs?: number;
}

const NODE_ORDER = [
  "Planner",
  "Company Research",
  "Financial Analysis",
  "News Analysis",
  "Risk Analysis",
  "Growth Analysis",
  "Decision Engine",
  "Reflection & Validation",
  "Report Generator",
];

export function AgentTimeline({
  logs,
  status,
  company,
}: {
  logs: StreamLog[];
  status: string;
  company: string;
}) {
  const completedNodes = new Set(logs.map((l) => l.node));
  const currentNode = status === "running" ? logs.at(-1)?.node : undefined;

  const getLog = (nodeName: string) => logs.find((l) => l.node === nodeName);
  const getState = (nodeName: string): "idle" | "running" | "completed" | "failed" => {
    const log = getLog(nodeName);
    if (!log) {
      // Check if this node comes after the current running node
      const currentIndex = NODE_ORDER.findIndex((n) => n === currentNode);
      const nodeIndex = NODE_ORDER.findIndex((n) => n === nodeName);
      if (currentIndex !== -1 && nodeIndex > currentIndex) return "idle";
      if (status === "running" && nodeIndex === currentIndex + 1) return "idle";
      return "idle";
    }
    if (log.status === "FAILED") return "failed";
    if (log.status === "COMPLETED") return "completed";
    return "running";
  };

  // The currently running node is the one after the last completed node
  const lastCompletedIndex = logs.length > 0
    ? NODE_ORDER.findIndex((n) => n === logs.at(-1)?.node)
    : -1;
  const activeNodeIndex = status === "running" ? lastCompletedIndex + 1 : -1;

  return (
    <div className="terminal-card" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          {status === "running" && (
            <Loader2 size={14} color="var(--accent-blue)" style={{ animation: "spin 1s linear infinite" }} />
          )}
          <span style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>
            Agent Execution
          </span>
        </div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{company || "—"}</p>
        <div style={{ marginTop: "8px", height: "2px", borderRadius: "2px", background: "var(--bg-border)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, (logs.length / NODE_ORDER.length) * 100)}%`,
            background: "linear-gradient(90deg, #10b981, #3b82f6)",
            transition: "width 0.5s ease",
            borderRadius: "2px",
          }} />
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
          {logs.length}/{NODE_ORDER.length} nodes completed
        </p>
      </div>

      {/* Node list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NODE_ORDER.map((nodeName, i) => {
          const log = getLog(nodeName);
          const isActive = i === activeNodeIndex;
          const isDone = log?.status === "COMPLETED";
          const isFailed = log?.status === "FAILED";
          const isPending = !log && !isActive;

          return (
            <div key={nodeName} className={isDone || isActive ? "slide-in" : ""}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: isActive ? "rgba(59,130,246,0.08)" : isDone ? "rgba(16,185,129,0.05)" : "transparent",
                border: isActive ? "1px solid rgba(59,130,246,0.2)" : isDone ? "1px solid rgba(16,185,129,0.1)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                {/* Icon */}
                <div style={{ flexShrink: 0, marginTop: "2px" }}>
                  {isDone && <CheckCircle2 size={16} color="var(--accent-green)" />}
                  {isFailed && <XCircle size={16} color="var(--accent-red)" />}
                  {isActive && <Loader2 size={16} color="var(--accent-blue)" style={{ animation: "spin 1s linear infinite" }} />}
                  {isPending && <Circle size={16} color="var(--text-muted)" />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "13px", fontWeight: 500,
                    color: isDone ? "var(--text-primary)" : isActive ? "var(--accent-blue)" : "var(--text-muted)",
                  }}>
                    {nodeName}
                  </div>
                  {log?.summary && (
                    <div style={{
                      fontSize: "11px", color: "var(--text-muted)",
                      marginTop: "2px", lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                    }}>
                      {log.summary}
                    </div>
                  )}
                  {log?.elapsedMs && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                      <Clock size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {log.elapsedMs < 1000 ? `${log.elapsedMs}ms` : `${(log.elapsedMs / 1000).toFixed(1)}s`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {status === "complete" && (
        <div style={{
          marginTop: "16px", padding: "10px 14px", borderRadius: "8px",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          fontSize: "12px", color: "var(--accent-green)", fontWeight: 600,
          textAlign: "center",
        }}>
          ✓ Analysis Complete
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
