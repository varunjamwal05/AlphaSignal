// ─────────────────────────────────────────────────────────────────────────────
// src/app/api/research/route.ts
// SSE streaming endpoint — runs the LangGraph agent and streams node events
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { buildInvestmentGraph } from "@/agents/graph";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RequestSchema = z.object({
  company: z.string().min(1).max(200),
});

export const maxDuration = 300; // 5 minute timeout for Vercel

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { company } = parsed.data;

  // Build SSE response stream
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController;
  let streamClosed = false;

  const send = (event: string, data: unknown) => {
    if (streamClosed) return;
    try {
      controller.enqueue(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      streamClosed = true;
    }
  };

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
    cancel() {
      streamClosed = true;
    },
  });

  // Run the graph asynchronously and stream events
  (async () => {
    try {
      send("start", { company, message: "Research agent started", timestamp: new Date().toISOString() });

      const graph = buildInvestmentGraph();
      let finalState: Record<string, unknown> = {};
      let processedLogs = 0;

      // Stream graph execution using LangGraph's stream API
      const graphStream = await graph.stream(
        { company, loopCount: 0 },
        { recursionLimit: 25 }
      );

      for await (const chunk of graphStream) {
        if (streamClosed) break;

        // Each chunk is { nodeName: stateUpdate }
        const [nodeName, stateUpdate] = Object.entries(chunk)[0] as [string, Record<string, unknown>];
        finalState = { ...finalState, ...stateUpdate };

        // Send new log entries if present
        const logs = (stateUpdate?.logs ?? []) as Array<{ nodeName: string; status: string; outputSummary?: string; elapsedMs?: number; error?: string }>;
        for (const log of logs) {
          send("node_complete", {
            node: log.nodeName,
            status: log.status,
            summary: log.outputSummary ?? log.error ?? "",
            elapsedMs: log.elapsedMs,
          });
          processedLogs++;
        }

        // Send intermediate score updates
        if (stateUpdate.scores) {
          send("scores_update", stateUpdate.scores);
        }
        if (stateUpdate.recommendation) {
          send("recommendation_update", { recommendation: stateUpdate.recommendation, confidence: stateUpdate.confidence });
        }
      }

      // Stream complete — save to DB
      const state = finalState as Record<string, unknown>;
      if (state.report && state.ticker) {
        const report = state.report as { recommendation?: string; investmentScore?: number; confidence?: number; investmentThesis?: string };
        try {
          const history = await prisma.researchHistory.create({
            data: {
              company,
              ticker: state.ticker as string,
              recommendation: report.recommendation ?? "WATCH",
              score: report.investmentScore ?? 50,
              confidence: report.confidence ?? 50,
              summary: report.investmentThesis?.substring(0, 500) ?? "",
              // Merge scores into reportData so the Compare page radar chart has real data
              reportData: { ...(state.report as object), scores: state.scores ?? {} } as object,
              citations: (state.citations ?? []) as object,
            },
          });
          send("complete", { 
            historyId: history.id, 
            report: state.report,
            financials: state.financials,
            valuation: state.valuation,
            news: state.news,
            sentiment: state.sentiment,
            risks: state.risks,
            opportunities: state.opportunities,
            citations: state.citations,
          });
        } catch (dbErr) {
          console.error("[Research API] DB save failed:", dbErr);
          send("complete", { 
            historyId: null, 
            report: state.report,
            financials: state.financials,
            valuation: state.valuation,
            news: state.news,
            sentiment: state.sentiment,
            risks: state.risks,
            opportunities: state.opportunities,
            citations: state.citations,
          });
        }
      } else {
        send("error", { message: state.error ?? "Research completed but no report was generated." });
      }
    } catch (err) {
      console.error("[Research API] Graph execution error:", err);
      send("error", { message: String(err) });
    } finally {
      if (!streamClosed) {
        try { controller.close(); } catch { /* ignore */ }
      }
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
