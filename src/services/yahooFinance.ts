// ─────────────────────────────────────────────────────────────────────────────
// src/services/yahooFinance.ts
// Real financial data fetching via yahoo-finance2 with graceful degradation
// ─────────────────────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
import yahooFinance from "yahoo-finance2";
import type {
  CompanyProfile,
  FinancialData,
  FinancialMetric,
  Valuation,
  Citation,
} from "@/types/agent";

const SOURCE = "Yahoo Finance";
const SOURCE_TYPE = "YAHOO_FINANCE" as const;
const now = () => new Date().toISOString();

function cite(section: string): Citation {
  return { source: SOURCE, type: SOURCE_TYPE, section, retrievedAt: now() };
}

// ── Resolve ticker symbol from company name ───────────────────────────────────
export async function resolveTickerFromName(
  companyName: string
): Promise<{ ticker: string; name: string } | null> {
  try {
    const results: any = await yahooFinance.search(companyName, {
      quotesCount: 5,
      newsCount: 0,
    });
    const equity = (results.quotes ?? []).find(
      (q: any) => q.quoteType === "EQUITY"
    );
    if (equity?.symbol) {
      return { ticker: equity.symbol as string, name: (equity.shortname ?? companyName) as string };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Fetch company profile ─────────────────────────────────────────────────────
export async function fetchCompanyProfile(
  ticker: string
): Promise<{ profile: CompanyProfile | null; citations: Citation[] }> {
  const citations: Citation[] = [];
  try {
    const summary: any = await yahooFinance.quoteSummary(ticker, {
      modules: ["assetProfile", "summaryDetail", "defaultKeyStatistics", "price"] as any,
    });

    const p = summary.assetProfile;
    const price = summary.price;

    const profile: CompanyProfile = {
      name: price?.longName ?? price?.shortName ?? ticker,
      ticker,
      exchange: price?.exchangeName ?? undefined,
      sector: p?.sector ?? undefined,
      industry: p?.industry ?? undefined,
      description: p?.longBusinessSummary ?? undefined,
      ceo: p?.companyOfficers?.[0]?.name ?? undefined,
      headquarters: p?.city && p?.country ? `${p.city}, ${p.country}` : undefined,
      employees: p?.fullTimeEmployees ?? undefined,
      website: p?.website ?? undefined,
      marketCap: price?.marketCap ?? undefined,
      currency: price?.currency ?? "USD",
      country: p?.country ?? undefined,
    };

    citations.push(cite("Company Profile"));
    return { profile, citations };
  } catch (err) {
    console.error(`[Yahoo Finance] Failed to fetch profile for ${ticker}:`, err);
    return { profile: null, citations };
  }
}

// ── Fetch financial statements ────────────────────────────────────────────────
export async function fetchFinancials(
  ticker: string
): Promise<{ financials: FinancialData | null; citations: Citation[] }> {
  const citations: Citation[] = [];
  const availabilityNotes: string[] = [];

  try {
    const [income, cashflow] = await Promise.allSettled([
      yahooFinance.quoteSummary(ticker, {
        modules: ["incomeStatementHistory"] as any,
      }),
      yahooFinance.quoteSummary(ticker, {
        modules: ["cashflowStatementHistory", "balanceSheetHistory"] as any,
      }),
    ]);

    const metrics: FinancialMetric[] = [];

    if (income.status === "fulfilled") {
      const summary: any = income.value;
      const annual: any[] = summary.incomeStatementHistory?.incomeStatementHistory ?? [];
      for (const stmt of annual) {
        const m: FinancialMetric = {
          year: new Date(stmt.endDate).getFullYear(),
          period: "ANNUAL",
          revenue: stmt.totalRevenue ?? undefined,
          netIncome: stmt.netIncome ?? undefined,
          operatingIncome: stmt.operatingIncome ?? undefined,
          grossMargin: stmt.grossProfit && stmt.totalRevenue
            ? (stmt.grossProfit / stmt.totalRevenue) * 100
            : undefined,
          ebitda: stmt.ebitda ?? undefined,
          eps: stmt.dilutedEPS ?? undefined,
        };
        metrics.push(m);
      }
      citations.push(cite("Income Statement History"));
    } else {
      availabilityNotes.push("Income statement history not available");
    }

    if (cashflow.status === "fulfilled") {
      const summary: any = cashflow.value;
      const cfStmts: any[] = summary.cashflowStatementHistory?.cashflowStatements ?? [];
      for (const cf of cfStmts) {
        const year = new Date(cf.endDate).getFullYear();
        const existing = metrics.find((m) => m.year === year && m.period === "ANNUAL");
        const fcf = cf.totalCashFromOperatingActivities != null && cf.capitalExpenditures != null
          ? cf.totalCashFromOperatingActivities + (cf.capitalExpenditures ?? 0)
          : undefined;
        if (existing) existing.freeCashFlow = fcf;
      }

      const bsStmts: any[] = summary.balanceSheetHistory?.balanceSheetStatements ?? [];
      for (const bs of bsStmts) {
        const year = new Date(bs.endDate).getFullYear();
        const existing = metrics.find((m) => m.year === year && m.period === "ANNUAL");
        if (existing) {
          existing.totalDebt = bs.longTermDebt ?? undefined;
          existing.cashAndEquivalents = bs.cash ?? undefined;
          existing.totalAssets = bs.totalAssets ?? undefined;
          existing.totalEquity = bs.totalStockholderEquity ?? undefined;
          if (bs.totalStockholderEquity && bs.longTermDebt) {
            existing.debtToEquity = bs.longTermDebt / bs.totalStockholderEquity;
          }
        }
      }
      citations.push(cite("Cash Flow & Balance Sheet History"));
    } else {
      availabilityNotes.push("Cash flow and balance sheet not available");
    }

    const sorted = [...metrics].sort((a, b) => b.year - a.year);
    let revenueGrowthYoY: number | undefined;
    if (sorted.length >= 2 && sorted[0].revenue && sorted[1].revenue) {
      revenueGrowthYoY = ((sorted[0].revenue - sorted[1].revenue) / sorted[1].revenue) * 100;
    }
    let profitMargin: number | undefined;
    if (sorted[0]?.revenue && sorted[0]?.netIncome) {
      profitMargin = (sorted[0].netIncome / sorted[0].revenue) * 100;
    }
    if (metrics.length === 0) availabilityNotes.push("No financial statement data returned");

    return { financials: { metrics, revenueGrowthYoY, profitMargin, availabilityNotes }, citations };
  } catch (err) {
    console.error(`[Yahoo Finance] Failed to fetch financials for ${ticker}:`, err);
    return { financials: { metrics: [], availabilityNotes: ["Financial data unavailable"] }, citations };
  }
}

// ── Fetch valuation metrics ───────────────────────────────────────────────────
export async function fetchValuation(
  ticker: string
): Promise<{ valuation: Valuation | null; citations: Citation[] }> {
  const citations: Citation[] = [];
  try {
    const summary: any = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics", "financialData"] as any,
    });

    const sd = summary.summaryDetail;
    const ks = summary.defaultKeyStatistics;
    const fd = summary.financialData;

    const valuation: Valuation = {
      peRatio: sd?.trailingPE ?? undefined,
      pegRatio: ks?.pegRatio ?? undefined,
      evToEbitda: ks?.enterpriseToEbitda ?? undefined,
      priceToSales: ks?.priceToSalesTrailing12Months ?? undefined,
      priceToBook: ks?.priceToBook ?? undefined,
      enterpriseValue: ks?.enterpriseValue ?? undefined,
      forwardPE: sd?.forwardPE ?? undefined,
      dividendYield: sd?.dividendYield ?? undefined,
      beta: sd?.beta ?? undefined,
      fiftyTwoWeekHigh: sd?.fiftyTwoWeekHigh ?? undefined,
      fiftyTwoWeekLow: sd?.fiftyTwoWeekLow ?? undefined,
      currentPrice: fd?.currentPrice ?? undefined,
      availabilityNotes: [],
    };

    citations.push(cite("Valuation Metrics"));
    return { valuation, citations };
  } catch (err) {
    console.error(`[Yahoo Finance] Failed to fetch valuation for ${ticker}:`, err);
    return { valuation: { availabilityNotes: ["Valuation metrics unavailable"] }, citations };
  }
}

// ── Fetch recent news ────────────────────────────────────────────────────────
export async function fetchCompanyNews(
  ticker: string,
  companyName: string,
  count = 15
): Promise<{ articles: Array<{ title: string; url: string; source: string; publishedAt: string }>; citations: Citation[] }> {
  const citations: Citation[] = [];
  try {
    const results: any = await yahooFinance.search(companyName, {
      quotesCount: 0,
      newsCount: count,
    });

    const articles = (results.news ?? []).map((n: any) => ({
      title: n.title,
      url: n.link,
      source: n.publisher,
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
    }));

    if (articles.length > 0) citations.push(cite("Recent News"));
    return { articles, citations };
  } catch (err) {
    console.error(`[Yahoo Finance] Failed to fetch news for ${ticker}:`, err);
    return { articles: [], citations };
  }
}
