// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/valuationTool.ts
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchValuation } from "@/services/yahooFinance";

export const valuationTool = new DynamicStructuredTool({
  name: "ValuationTool",
  description: "Fetches real valuation metrics including P/E ratio, PEG ratio, EV/EBITDA, Price-to-Sales, current price, and 52-week range from Yahoo Finance.",
  schema: z.object({
    ticker: z.string().describe("Stock ticker symbol"),
  }),
  func: async ({ ticker }) => {
    const { valuation, citations } = await fetchValuation(ticker);
    return JSON.stringify({ valuation, citations });
  },
});
