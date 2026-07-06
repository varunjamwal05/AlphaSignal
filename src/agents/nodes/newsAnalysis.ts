// ─────────────────────────────────────────────────────────────────────────────
// src/agents/nodes/newsAnalysis.ts
// Retrieves news and runs sentiment classification
// ─────────────────────────────────────────────────────────────────────────────
import { newsRetrievalTool } from "@/agents/tools/newsRetrievalTool";
import { newsSentimentTool } from "@/agents/tools/newsSentimentTool";
import type { GraphState } from "@/agents/state";
import type { AgentLogEntry, NewsArticle, SentimentAnalysis, Citation } from "@/types/agent";

export async function newsAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const newsRaw = await newsRetrievalTool.invoke({
      ticker: state.ticker!,
      companyName: state.profile?.name ?? state.company,
      count: 12,
    });
    const newsResult = JSON.parse(newsRaw) as {
      articles?: Array<{ title: string; url: string; source: string; publishedAt: string }>;
      citations?: Citation[];
    };

    const articles = newsResult.articles ?? [];

    // Run sentiment only if we have articles
    let sentiment: SentimentAnalysis | undefined;
    let sentimentCitations: Citation[] = [];
    let enrichedArticles: NewsArticle[] = articles.map((a) => ({
      ...a,
      sentiment: "NEUTRAL" as const,
      sentimentScore: 0,
    }));

    if (articles.length > 0) {
      const sentRaw = await newsSentimentTool.invoke({
        companyName: state.profile?.name ?? state.company,
        articles,
      });
      const sentResult = JSON.parse(sentRaw) as {
        sentiment?: SentimentAnalysis;
        articles?: NewsArticle[];
        citations?: Citation[];
      };
      sentiment = sentResult.sentiment;
      enrichedArticles = sentResult.articles ?? enrichedArticles;
      sentimentCitations = sentResult.citations ?? [];
    }

    const log: AgentLogEntry = {
      nodeName: "News Analysis",
      status: "COMPLETED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      outputSummary: `Retrieved ${articles.length} articles. Sentiment: ${sentiment?.overall ?? "N/A"} (score: ${sentiment?.score?.toFixed(2) ?? "N/A"})`,
    };

    return {
      news: enrichedArticles,
      sentiment,
      citations: [...(newsResult.citations ?? []), ...sentimentCitations],
      toolResults: { news: enrichedArticles, sentiment },
      logs: [log],
    };
  } catch (err) {
    const log: AgentLogEntry = {
      nodeName: "News Analysis",
      status: "FAILED",
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedMs: Date.now() - start,
      error: String(err),
    };
    return { news: [], logs: [log] };
  }
}
