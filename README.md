# HiddenEdge — AI Investment Research Terminal

> Production-grade AI-powered investment research platform built with Next.js 15, LangGraph.js, Google Gemini, PostgreSQL (Supabase), and Recharts. Styled as a full trading terminal experience.

---

## Overview

HiddenEdge is an autonomous investment research agent that researches any publicly listed company and delivers a transparent, evidence-backed investment recommendation (**INVEST / WATCH / PASS**). The UI is designed to feel like a professional trading terminal — inspired by Bloomberg Terminal and TradingView — with live-animated stock cards, scrolling ticker tapes, candlestick chart backgrounds, and monospace data displays.

**This is not a chatbot.** It is a multi-step LangGraph AI agent that autonomously:
1. Plans the research strategy
2. Fetches real financial data from Yahoo Finance
3. Retrieves and classifies recent news
4. Evaluates investment risks and growth opportunities
5. Calculates a weighted investment score
6. Validates its own recommendation via a Reflection node
7. Generates a comprehensive, cited investment report

---

## Screenshots

> Landing page — animated stock cards, candlestick chart background, terminal-style search bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript (Strict) |
| Styling | Custom CSS Design System (Space Grotesk + JetBrains Mono) |
| AI Orchestration | LangGraph.js + LangChain.js |
| LLM | Google Gemini 2.0 Flash |
| Database | PostgreSQL (Supabase) + Prisma ORM 6 |
| Data Fetching | Yahoo Finance via `yahoo-finance2` |
| State Management | TanStack React Query v5 |
| Charts | Recharts |
| Validation | Zod |
| Export | jsPDF + html2canvas |
| Deployment | Vercel |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 15 App Router                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ Landing Page │ │  Dashboard   │ │ History/Compare │ │
│  └──────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │  SSE Stream (POST /api/research)
┌─────────────────────▼───────────────────────────────────┐
│  LangGraph Agent Engine (src/agents/graph.ts)           │
│                                                         │
│  Planner ──► Company Research ──► Financial Analysis    │
│         ──► News Analysis ──► Risk Analysis             │
│         ──► Growth Analysis ──► Decision Engine         │
│         ──► Reflection/Validation ──► Report Generator  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  LangChain Tools (src/agents/tools/)                    │
│  CompanyProfileTool | FinancialAnalysisTool             │
│  ValuationTool | NewsRetrievalTool | NewsSentimentTool  │
│  RiskAssessmentTool | GrowthAnalysisTool                │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  Data Services                                          │
│  Yahoo Finance (Real Data) | Google Gemini (Analysis)   │
│  Prisma ORM (Supabase PostgreSQL — History + Cache)     │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx                  # Trading terminal landing page
│   ├── globals.css               # Design system (trading terminal theme)
│   ├── layout.tsx                # Root layout + font loading
│   ├── dashboard/page.tsx        # Main research dashboard (SSE streaming)
│   ├── history/page.tsx          # Research history (Supabase backed)
│   ├── compare/page.tsx          # Side-by-side company comparison + radar chart
│   └── api/
│       ├── research/route.ts     # SSE streaming agent API
│       ├── history/route.ts      # History records
│       └── compare/route.ts      # Comparison endpoint
├── agents/
│   ├── graph.ts                  # LangGraph workflow definition
│   ├── state.ts                  # Shared agent state (Annotation)
│   ├── nodes/                    # 8 agent nodes
│   └── tools/                    # 7 LangChain tools
├── components/
│   ├── layout/                   # Navbar (ticker tape), Providers
│   └── dashboard/                # AgentTimeline, RecommendationCard, MetricCards,
│                                 # ChartsPanel, NewsPanel, RiskPanel, ReportPanel
├── services/
│   ├── yahooFinance.ts           # 5-tier company resolver + real financial data
│   └── geminiService.ts          # Gemini LLM integration
└── types/
    └── agent.ts                  # Zod schemas + TypeScript interfaces
```

---

## LangGraph Workflow

```
START
  ↓
Planner Node           — sets research strategy & tool list
  ↓
Company Research       — 5-tier ticker resolver (ticker → Yahoo search → known map → partial → LLM spell-fix)
  ↓
Financial Analysis     — income statements, balance sheet, cash flow
  ↓
Valuation              — P/E, PEG, EV/EBITDA, Price/Sales, current price
  ↓
News Analysis          — fetches recent articles via Yahoo Finance
  ↓
News Sentiment         — Gemini classifies each article (POSITIVE/NEGATIVE/NEUTRAL)
  ↓
Risk Analysis          — Gemini evaluates competition, debt, regulatory, macro risks
  ↓
Growth Analysis        — Gemini assesses moats, AI initiatives, expansion
  ↓
Decision Engine        — weighted score: Financial 30%, Growth 25%, Risk 20%, Sentiment 15%, Valuation 10%
  ↓
Reflection & Validation — checks evidence, conflicts, missing risks, adjusts confidence
  ↓ (loopback if insufficient data, max 1 retry)
Report Generator       — Gemini produces full markdown + structured JSON report
  ↓
END
```

---

## Scoring System

| Dimension | Weight | How Scored |
|---|---|---|
| Financial Health | 30% | Operating margin, FCF, debt/equity, ROE, revenue growth |
| Growth Outlook | 25% | Innovation, competitive advantages, AI strategy (Gemini) |
| Risk Assessment | 20% | Inverted risk score (lower risk = higher score) |
| News Sentiment | 15% | Normalized sentiment score from -1.0 to 1.0 |
| Valuation | 10% | PE ratio, PEG ratio, EV/EBITDA vs industry benchmarks |

**Recommendation Thresholds:**
- Score ≥ 65 → **INVEST** 🟢
- Score 45–64 → **WATCH** 🟡
- Score < 45 → **PASS** 🔴

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database — **Supabase free tier recommended** (no Docker needed)
- Google Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/varunjamwal05/AlphaSignal.git
cd HiddenEdge
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase connection (session pooler — port 5432)
# IMPORTANT: URL-encode special characters in your password
# e.g. @ → %40, / → %2F
DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"

GEMINI_API_KEY="your-gemini-api-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Note on Supabase passwords with special characters:** If your Supabase password contains `@`, `/`, `#` etc., URL-encode them before pasting into `DATABASE_URL`. Example: `-@abc/xyz` → `-%40abc%2Fxyz`

### 3. Initialize Database

```bash
npx prisma db push
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (use session pooler port 5432 for Supabase) |
| `DIRECT_URL` | ✅ | Direct connection for Prisma migrations (same as DATABASE_URL for Supabase session pooler) |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NEXT_PUBLIC_APP_URL` | ❌ | App URL for production |

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/research` | POST | Start research (SSE stream). Body: `{ company: string }` |
| `/api/history` | GET | Get 50 most recent research reports |
| `/api/compare` | GET | Compare two companies. Query: `?c1=AAPL&c2=MSFT` |

### SSE Events (POST /api/research)

| Event | Payload |
|---|---|
| `start` | `{ company, message, timestamp }` |
| `node_complete` | `{ node, status, summary, elapsedMs }` |
| `scores_update` | `WeightedScores` object |
| `recommendation_update` | `{ recommendation, confidence }` |
| `complete` | `{ historyId, report, financials, valuation, news, sentiment, risks, opportunities, citations }` |
| `error` | `{ message }` |

---

## UI — Trading Terminal Design System

The UI uses a custom trading terminal design system (no component library):

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#03040a` | Page background |
| `--accent-cyan` | `#38bdf8` | Primary brand, borders, active states |
| `--accent-green` | `#00c97a` | BUY / positive / INVEST |
| `--accent-red` | `#f04f63` | SELL / negative / PASS |
| `--accent-amber` | `#f5a623` | WATCH / caution |
| `--font-sans` | Space Grotesk | Headings, body text |
| `--font-mono` | JetBrains Mono | Numbers, tickers, inputs, buttons |

**Key UI features:**
- Scrolling stock ticker tape in Navbar (AAPL, MSFT, NVDA…)
- Animated live price cards on landing page
- SVG candlestick chart background
- Subtle grid overlay across all pages
- Monospace inputs styled as order-entry terminals
- Neon glow badges for INVEST / WATCH / PASS signals

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set environment variables: `DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`
4. Deploy — Vercel handles Next.js 15 automatically
5. Run `npx prisma db push` against your production database URL

---

## Trade-offs & Design Decisions

- **5-tier company resolver:** Direct ticker → Yahoo search → Known map → Partial match → **LLM spell correction** (handles typos like "mircosoft" → "Microsoft")
- **yahoo-finance2 without a paid API key:** Uses public endpoints — may hit rate limits under heavy traffic. For production scale, use Alpha Vantage or Financial Modeling Prep.
- **No mock data policy:** When financial data is unavailable, fields display as "N/A" — never fabricated. Transparency over completeness.
- **SSE over WebSocket:** Simpler to deploy on Vercel serverless without a persistent connection manager.
- **Supabase session pooler (port 5432):** More reliable than transaction pooler (port 6543) for Prisma's connection model.
- **Gemini 2.0 Flash:** Chosen for speed and cost efficiency across multi-step analysis.

---

## Example Runs

> The following are realistic sample executions demonstrating how the agent processes different companies and produces structured investment recommendations.

---

### Example 1 — Apple Inc. (AAPL)

**Input:** `Apple`

| Field | Value |
|---|---|
| **Ticker Resolved** | AAPL |
| **Recommendation** | 🟡 WATCH |
| **Confidence Score** | 71% |
| **Overall Investment Score** | 61 / 100 |

**Key Findings:**
- Revenue growth has moderated to ~2% YoY, but gross margins remain strong at ~45%
- Services segment continues to expand, partially offsetting hardware saturation
- P/E ratio (~28×) is elevated relative to large-cap tech peers given single-digit growth
- News sentiment: predominantly NEUTRAL with positive signals around Vision Pro and India expansion
- Risks: heavy China revenue exposure (~19% of total revenue) and ongoing App Store regulatory scrutiny
- Free cash flow generation remains exceptional at >$100B annually, supporting buybacks

**Executive Summary:**
> Apple remains one of the highest-quality businesses globally, with a fortress balance sheet and unmatched brand loyalty. However, the current valuation prices in near-perfect execution at a time when hardware growth is plateauing and regulatory headwinds are intensifying. The Services pivot is encouraging, but insufficient to justify a premium multiple without accelerating revenue expansion. **Recommendation: WATCH** — monitor for a valuation pullback or a catalyst from the AI hardware cycle before initiating a position.

---

### Example 2 — Tesla Inc. (TSLA)

**Input:** `Tesla`

| Field | Value |
|---|---|
| **Ticker Resolved** | TSLA |
| **Recommendation** | 🔴 PASS |
| **Confidence Score** | 68% |
| **Overall Investment Score** | 41 / 100 |

**Key Findings:**
- Automotive gross margins compressed to ~17%, down significantly from prior-year highs
- Aggressive price cuts have stimulated volume but structurally hurt profitability
- News sentiment: NEGATIVE-leaning, driven by executive distraction concerns and brand perception issues
- Valuation remains stretched at ~60× forward earnings versus traditional auto peers at ~6–8×
- Cybertruck ramp and energy storage growth represent genuine optionality but are not yet material
- Competitive intensity in EVs from BYD and legacy OEMs is intensifying across all major markets

**Executive Summary:**
> Tesla faces a challenging intersection of compressed margins, elevated valuation, and rising competitive pressure just as the EV market matures. While the long-term thesis around Full Self-Driving and energy storage remains intact, near-term earnings risk is high and sentiment is fragile. The risk-to-reward profile does not support initiating a new position at current levels. **Recommendation: PASS** — revisit if margins stabilize above 20% or if valuation contracts meaningfully.

---

### Example 3 — NVIDIA Corporation (NVDA)

**Input:** `NVIDIA`

| Field | Value |
|---|---|
| **Ticker Resolved** | NVDA |
| **Recommendation** | 🟢 INVEST |
| **Confidence Score** | 84% |
| **Overall Investment Score** | 79 / 100 |

**Key Findings:**
- Revenue grew ~122% YoY, driven almost entirely by Data Center GPU demand from hyperscalers
- Operating margins expanded to ~62%, reflecting exceptional pricing power in AI accelerators
- News sentiment: strongly POSITIVE — Blackwell architecture ramp, sovereign AI deals, and enterprise adoption
- CUDA ecosystem creates deep switching costs; competitive alternatives remain 12–18 months behind
- Valuation is high (~35× forward earnings) but partially justified by hypergrowth and margin expansion
- Key risk: customer concentration — Microsoft, Google, Meta, and Amazon collectively account for a significant share of Data Center revenue

**Executive Summary:**
> NVIDIA has established itself as the dominant infrastructure layer for the AI compute cycle, with no credible near-term challenger to its GPU + CUDA platform combination. Revenue growth, margin expansion, and order backlog all point to sustained demand from hyperscalers and enterprises. While the valuation demands continued execution without misstep, the structural positioning and earnings momentum justify a long-term conviction position for growth-oriented investors. **Recommendation: INVEST** — suitable for portfolios with a 12–24 month horizon and tolerance for high-multiple volatility.

---

## Current Limitations

- **Yahoo Finance public endpoints:** The `yahoo-finance2` library relies on unauthenticated public endpoints, which may be rate-limited or temporarily unavailable under heavy concurrent traffic.
- **News coverage:** Article retrieval depends on what Yahoo Finance indexes publicly; niche or small-cap companies may return sparse news, affecting sentiment accuracy.
- **Not financial advice:** Recommendation scores (INVEST / WATCH / PASS) are generated algorithmically to assist research workflows and should not be treated as professional financial or investment advice.
- **Reflection retry cap:** The Reflection & Validation node is intentionally limited to a maximum of one retry loop to keep total agent latency under 30 seconds; edge cases with ambiguous data may not trigger a full second pass.
- **No real-time streaming market data:** Price data is fetched at request time via Yahoo Finance snapshots and is not continuously streamed; intra-day price movements between queries are not reflected.
- **LLM output variability:** Gemini-generated analysis (risk, growth, sentiment) may vary slightly between runs for the same company due to the probabilistic nature of large language models.

---

## Future Improvements

- [ ] **Alpha Vantage / FMP paid API for richer fundamentals** — Replaces public Yahoo Finance endpoints with verified, rate-limit-free data, improving reliability and unlocking deeper metrics such as earnings call transcripts and institutional ownership.
- [ ] **User authentication (NextAuth.js) for personal watchlists** — Allows individual users to save, tag, and track their own research history, making the platform useful as an ongoing portfolio research tool rather than a one-off lookup.
- [ ] **Real-time price data integration (WebSocket)** — Streams live bid/ask and tick data into the terminal UI, enabling users to correlate AI research findings with live market behaviour without switching to another platform.
- [ ] **Email report delivery** — Automatically dispatches the full PDF research report to a user's inbox after analysis completes, improving shareability for investment teams and personal record-keeping.
- [ ] **SEC filing direct parser (EDGAR XBRL)** — Parses 10-K and 10-Q filings directly from EDGAR, adding primary-source financial validation that reduces reliance on third-party data aggregators.
- [ ] **Portfolio-level analysis across multiple stocks** — Runs the agent across an entire watchlist in batch mode, surfacing cross-portfolio risk concentration and correlation insights rather than analysing companies in isolation.
- [ ] **Custom LLM model selection (OpenAI GPT-4o, Claude)** — Lets users choose their preferred LLM backend, enabling cost/capability trade-offs and reducing vendor lock-in to a single AI provider.
- [ ] **Mobile-responsive trading dashboard** — Adapts the terminal layout to smaller screens, broadening the accessible audience and allowing researchers to review reports on the go.
