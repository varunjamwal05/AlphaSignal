// ─────────────────────────────────────────────────────────────────────────────
// src/services/yahooFinance.ts
// Real financial data fetching via yahoo-finance2 with graceful degradation
/* eslint-disable @typescript-eslint/no-explicit-any */
import yf from "yahoo-finance2";
const YF = (yf as any).default || yf;
const yahooFinance = typeof YF === "function" ? new YF() : YF;
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

// ── Well-known company name → ticker fallback map ────────────────────────────
const KNOWN_TICKERS: Record<string, string> = {
  apple: "AAPL",
  microsoft: "MSFT",
  google: "GOOGL",
  alphabet: "GOOGL",
  amazon: "AMZN",
  meta: "META",
  facebook: "META",
  nvidia: "NVDA",
  tesla: "TSLA",
  netflix: "NFLX",
  salesforce: "CRM",
  adobe: "ADBE",
  intel: "INTC",
  amd: "AMD",
  "advanced micro devices": "AMD",
  qualcomm: "QCOM",
  broadcom: "AVGO",
  oracle: "ORCL",
  ibm: "IBM",
  "international business machines": "IBM",
  samsung: "005930.KS",
  tsmc: "TSM",
  "taiwan semiconductor": "TSM",
  visa: "V",
  mastercard: "MA",
  "jpmorgan": "JPM",
  "jp morgan": "JPM",
  "goldman sachs": "GS",
  "bank of america": "BAC",
  walmart: "WMT",
  target: "TGT",
  disney: "DIS",
  "the walt disney": "DIS",
  coca: "KO",
  "coca-cola": "KO",
  pepsi: "PEP",
  pepsico: "PEP",
  nike: "NKE",
  "exxon mobil": "XOM",
  exxon: "XOM",
  chevron: "CVX",
  pfizer: "PFE",
  johnson: "JNJ",
  "johnson & johnson": "JNJ",
  unitedhealth: "UNH",
  berkshire: "BRK-B",
  "berkshire hathaway": "BRK-B",
  "berkshire hathaway b": "BRK-B",
  "berkshire hathaway a": "BRK-A",
  ford: "F",
  gm: "GM",
  "general motors": "GM",
  boeing: "BA",
  caterpillar: "CAT",
  "3m": "MMM",
  spotify: "SPOT",
  uber: "UBER",
  lyft: "LYFT",
  airbnb: "ABNB",
  palantir: "PLTR",
  coinbase: "COIN",
  snowflake: "SNOW",
  shopify: "SHOP",
  zoom: "ZM",
  "zoom video": "ZM",
  slack: "CRM",
  twilio: "TWLO",
  crowdstrike: "CRWD",
  datadog: "DDOG",
  mongodb: "MDB",
  "service now": "NOW",
  servicenow: "NOW",
  workday: "WDAY",
  "square": "XYZ",
  block: "XYZ",
};

// ── Resolve ticker symbol from company name ───────────────────────────────────
export async function resolveTickerFromName(
  companyName: string
): Promise<{ ticker: string; name: string } | null> {
  const input = companyName.trim();
  const inputLower = input.toLowerCase();

  // Tier 1: If it looks like a ticker (all caps, 1-5 chars), try directly
  if (/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(input)) {
    try {
      const summary: any = await yahooFinance.quoteSummary(input, {
        modules: ["price"] as any,
      });
      if (summary?.price?.symbol) {
        return {
          ticker: summary.price.symbol,
          name: summary.price.longName ?? summary.price.shortName ?? input,
        };
      }
    } catch { /* fall through */ }
  }

  // Tier 2: Search Yahoo Finance quotes
  try {
    const results: any = await yahooFinance.search(input, {
      quotesCount: 8,
      newsCount: 0,
    });
    const quotes: any[] = results?.quotes ?? [];

    // Accept EQUITY or MUTUALFUND types
    const equity = quotes.find(
      (q: any) =>
        q.quoteType === "EQUITY" ||
        q.typeDisp === "Equity" ||
        (q.symbol && q.shortname)
    );

    if (equity?.symbol) {
      return {
        ticker: equity.symbol as string,
        name: (equity.longname ?? equity.shortname ?? input) as string,
      };
    }
  } catch { /* fall through */ }

  // Tier 3: Well-known company name map
  const mapped = KNOWN_TICKERS[inputLower];
  if (mapped) {
    return { ticker: mapped, name: input };
  }

  // Tier 4: Try partial match in known tickers
  const partialKey = Object.keys(KNOWN_TICKERS).find((k) =>
    k.includes(inputLower) || inputLower.includes(k)
  );
  if (partialKey) {
    return { ticker: KNOWN_TICKERS[partialKey], name: input };
  }

  // Tier 5: LLM-based spelling correction — handles typos like "mircosoft" → "Microsoft"
  try {
    const openAIKey = process.env.OPENAI_API_KEY;
    let llm;
    if (openAIKey) {
      const { ChatOpenAI } = await import("@langchain/openai");
      llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        apiKey: openAIKey,
        temperature: 0,
      });
    } else {
      const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
      llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0,
      });
    }
    const response = await llm.invoke(
      `You are a company name resolver. The user typed: "${input}"
This might be a typo or misspelling of a well-known publicly listed company.
If you can identify the most likely intended company, respond with ONLY the correct company name (e.g. "Microsoft") or its ticker (e.g. "MSFT").
If you cannot identify any company, respond with exactly: UNKNOWN`
    );
    const corrected = String(response.content).trim();
    if (corrected && corrected !== "UNKNOWN" && corrected.toLowerCase() !== inputLower) {
      // Retry resolution with corrected name (avoid infinite loop by not calling Tier 5 again)
      const correctedLower = corrected.toLowerCase();
      // Check known tickers first
      const knownMatch = KNOWN_TICKERS[correctedLower];
      if (knownMatch) return { ticker: knownMatch, name: corrected };
      // Try Yahoo search with corrected name
      try {
        const results: any = await yahooFinance.search(corrected, {
          quotesCount: 5,
          newsCount: 0,
        });
        const equity = (results?.quotes ?? []).find(
          (q: any) => q.quoteType === "EQUITY" || q.typeDisp === "Equity" || (q.symbol && q.shortname)
        );
        if (equity?.symbol) {
          return { ticker: equity.symbol as string, name: (equity.longname ?? equity.shortname ?? corrected) as string };
        }
      } catch { /* ignore */ }
    }
  } catch { /* LLM unavailable */ }

  return null;
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
    const results = await Promise.allSettled([
      yahooFinance.fundamentalsTimeSeries(ticker, { period1: '2020-01-01', type: 'annual', module: 'financials' }),
      yahooFinance.fundamentalsTimeSeries(ticker, { period1: '2020-01-01', type: 'annual', module: 'balance-sheet' }),
      yahooFinance.fundamentalsTimeSeries(ticker, { period1: '2020-01-01', type: 'annual', module: 'cash-flow' }),
    ]);

    const financials = results[0].status === 'fulfilled' ? results[0].value : [];
    const balanceSheet = results[1].status === 'fulfilled' ? results[1].value : [];
    const cashFlow = results[2].status === 'fulfilled' ? results[2].value : [];

    if (results[0].status === 'rejected') availabilityNotes.push(`Income statement failed: ${results[0].reason}`);
    if (results[1].status === 'rejected') availabilityNotes.push(`Balance sheet failed: ${results[1].reason}`);
    if (results[2].status === 'rejected') availabilityNotes.push(`Cash flow failed: ${results[2].reason}`);

    const mergedByYear: Record<number, Partial<FinancialMetric>> = {};

    // 1. Process financials (Income Statement)
    if (Array.isArray(financials)) {
      for (const stmt of financials) {
        if (!stmt.date) continue;
        const year = new Date(stmt.date).getFullYear();
        if (!mergedByYear[year]) {
          mergedByYear[year] = { year, period: "ANNUAL" };
        }
        const m = mergedByYear[year];
        m.revenue = stmt.totalRevenue ?? undefined;
        m.netIncome = stmt.netIncome ?? undefined;
        m.operatingIncome = stmt.operatingIncome ?? undefined;
        m.operatingMargin = stmt.operatingIncome && stmt.totalRevenue 
          ? (stmt.operatingIncome / stmt.totalRevenue) * 100 
          : undefined;
        m.grossMargin = stmt.grossProfit && stmt.totalRevenue
          ? (stmt.grossProfit / stmt.totalRevenue) * 100
          : undefined;
        m.ebitda = stmt.EBITDA ?? undefined;
        m.eps = stmt.dilutedEPS ?? stmt.basicEPS ?? undefined;
      }
    }

    // 2. Process balance sheet
    if (Array.isArray(balanceSheet)) {
      for (const stmt of balanceSheet) {
        if (!stmt.date) continue;
        const year = new Date(stmt.date).getFullYear();
        if (!mergedByYear[year]) {
          mergedByYear[year] = { year, period: "ANNUAL" };
        }
        const m = mergedByYear[year];
        m.totalDebt = stmt.totalDebt ?? stmt.longTermDebt ?? undefined;
        m.cashAndEquivalents = stmt.cashAndCashEquivalents ?? stmt.cashCashEquivalentsAndShortTermInvestments ?? undefined;
        m.totalAssets = stmt.totalAssets ?? undefined;
        m.totalEquity = stmt.stockholdersEquity ?? stmt.commonStockEquity ?? undefined;
        if (m.totalEquity && m.totalDebt) {
          m.debtToEquity = m.totalDebt / m.totalEquity;
        }
      }
    }

    // 3. Process cash flow
    if (Array.isArray(cashFlow)) {
      for (const stmt of cashFlow) {
        if (!stmt.date) continue;
        const year = new Date(stmt.date).getFullYear();
        if (!mergedByYear[year]) {
          mergedByYear[year] = { year, period: "ANNUAL" };
        }
        const m = mergedByYear[year];
        m.freeCashFlow = stmt.freeCashFlow ?? undefined;
      }
    }

    // Compute derived metrics
    for (const yearKey in mergedByYear) {
      const m = mergedByYear[yearKey];
      if (m.netIncome && m.totalEquity) {
        m.returnOnEquity = (m.netIncome / m.totalEquity) * 100;
      }
    }

    const metrics: FinancialMetric[] = Object.values(mergedByYear).filter(
      (m): m is FinancialMetric => m.year !== undefined
    );

    if (metrics.length === 0) {
      availabilityNotes.push("No financial statement data returned");
    } else {
      citations.push(cite("Financial Statements"));
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
      priceToSales: sd?.priceToSalesTrailing12Months ?? ks?.priceToSalesTrailing12Months ?? undefined,
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
