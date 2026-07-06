// ─────────────────────────────────────────────────────────────────────────────
// src/agents/tools/companyProfileTool.ts
// LangChain tool for fetching real company profile data
// ─────────────────────────────────────────────────────────────────────────────
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { resolveTickerFromName, fetchCompanyProfile } from "@/services/yahooFinance";

export const companyProfileTool = new DynamicStructuredTool({
  name: "CompanyProfileTool",
  description: "Fetches real company profile information including sector, industry, business description, CEO, market cap, and employees from Yahoo Finance.",
  schema: z.object({
    companyName: z.string().describe("The company name or ticker symbol to look up"),
  }),
  func: async ({ companyName }) => {
    // Attempt to resolve ticker
    const resolved = await resolveTickerFromName(companyName);
    if (!resolved) {
      return JSON.stringify({ error: `Could not identify company: ${companyName}`, ticker: null, profile: null, citations: [] });
    }

    const { profile, citations } = await fetchCompanyProfile(resolved.ticker);
    return JSON.stringify({ ticker: resolved.ticker, profile, citations });
  },
});
