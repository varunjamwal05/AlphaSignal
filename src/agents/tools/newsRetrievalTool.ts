// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/newsRetrievalTool.ts
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchCompanyNews } from "@/services/yahooFinance";

export const newsRetrievalTool = new DynamicStructuredTool({
  name: "NewsRetrievalTool",
  description: "Fetches recent news articles about a company from Yahoo Finance news feed.",
  schema: z.object({
    ticker: z.string(),
    companyName: z.string(),
    count: z.number().default(12),
  }),
  func: async ({ ticker, companyName, count }) => {
    const { articles, citations } = await fetchCompanyNews(ticker, companyName, count);
    return JSON.stringify({ articles, citations });
  },
});
