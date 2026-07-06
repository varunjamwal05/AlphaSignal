// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/financialAnalysisTool.ts
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchFinancials } from "@/services/yahooFinance";

export const financialAnalysisTool = new DynamicStructuredTool({
  name: "FinancialAnalysisTool",
  description: "Retrieves real financial statements including revenue, net income, cash flow, debt, margins, and EPS from Yahoo Finance.",
  schema: z.object({
    ticker: z.string().describe("Stock ticker symbol (e.g. AAPL, MSFT)"),
  }),
  func: async ({ ticker }) => {
    const { financials, citations } = await fetchFinancials(ticker);
    return JSON.stringify({ financials, citations });
  },
});
