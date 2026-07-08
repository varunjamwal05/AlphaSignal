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

## Future Improvements

- [ ] Alpha Vantage / FMP paid API for richer fundamentals
- [ ] User authentication (NextAuth.js) for personal watchlists
- [ ] Real-time price data integration (WebSocket)
- [ ] Email report delivery
- [ ] SEC filing direct parser (EDGAR XBRL)
- [ ] Portfolio-level analysis across multiple stocks
- [ ] Custom LLM model selection (OpenAI GPT-4o, Claude)
- [ ] Mobile-responsive trading dashboard
