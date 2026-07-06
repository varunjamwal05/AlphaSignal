# AlphaSignal — AI Investment Research Agent

> Production-grade AI-powered investment research platform built with Next.js 15, LangGraph.js, Google Gemini, PostgreSQL, and Recharts.

---

## Overview

AlphaSignal is an autonomous investment research agent that researches any publicly listed company and delivers a transparent, evidence-backed investment recommendation (INVEST / WATCH / PASS). It is designed to look and feel like a professional financial SaaS terminal, inspired by Bloomberg Terminal, Linear, and Perplexity AI.

**This is not a chatbot.** It is a multi-step LangGraph AI agent that autonomously:
1. Plans the research strategy
2. Fetches real financial data from Yahoo Finance
3. Retrieves and classifies recent news
4. Evaluates investment risks and growth opportunities
5. Calculates a weighted investment score
6. Validates its own recommendation via a Reflection node
7. Generates a comprehensive, cited investment report

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript (Strict) |
| Styling | Tailwind CSS + Custom CSS Design System |
| AI Orchestration | LangGraph.js + LangChain.js |
| LLM | Google Gemini 1.5 Flash |
| Database | PostgreSQL + Prisma ORM 6 |
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
└─────────────────────┬──────────────────────────────────-┘
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
│  Prisma ORM (PostgreSQL Cache + History)                │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Main research dashboard
│   ├── history/page.tsx      # Research history
│   ├── compare/page.tsx      # Company comparison
│   └── api/
│       ├── research/route.ts # SSE streaming agent API
│       ├── history/route.ts  # History records
│       └── report/[id]/route.ts
├── agents/
│   ├── graph.ts              # LangGraph workflow
│   ├── state.ts              # Shared agent state (Annotation)
│   ├── nodes/                # Planner, research, analysis, reflection nodes
│   └── tools/                # LangChain tools (7 tools)
├── components/
│   ├── layout/               # Navbar, Providers
│   └── dashboard/            # AgentTimeline, RecommendationCard, MetricCards,
│                             # ChartsPanel, NewsPanel, RiskPanel, ReportPanel, CitationsPanel
├── services/
│   ├── yahooFinance.ts       # Real financial data (no mock data)
│   └── geminiService.ts      # Gemini LLM integration
└── types/
    └── agent.ts              # Zod schemas + TypeScript interfaces
```

---

## LangGraph Workflow

```
START
  ↓
Planner Node           — sets research strategy & tool list
  ↓
Company Research       — resolves ticker via Yahoo Finance, fetches profile
  ↓
Financial Analysis     — retrieves income statements, balance sheet, cash flow
  ↓ (parallel with ↑ via Promise.all)
Valuation              — P/E, PEG, EV/EBITDA, Price/Sales, current price
  ↓
News Analysis          — fetches 12 recent articles via Yahoo Finance
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
- Score ≥ 65 → **INVEST**
- Score 45–64 → **WATCH**
- Score < 45 → **PASS**

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- Google Gemini API key

### 1. Clone & Install

```bash
cd "InsideIIM Project"
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/investment_research"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

Or use [Supabase](https://supabase.com) and paste your connection string.

### 4. Initialize Database

```bash
npx prisma db push
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NEXT_PUBLIC_APP_URL` | ❌ | App URL for production |

---

## API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/research` | POST | Start research (SSE stream). Body: `{ company: string }` |
| `/api/history` | GET | Get 50 most recent research reports |
| `/api/report/:id` | GET | Get full report by ID with execution logs |

### SSE Events (POST /api/research)

| Event | Payload |
|---|---|
| `start` | `{ company, message, timestamp }` |
| `node_complete` | `{ node, status, summary, elapsedMs }` |
| `scores_update` | `WeightedScores` object |
| `recommendation_update` | `{ recommendation, confidence }` |
| `complete` | `{ historyId, report }` |
| `error` | `{ message }` |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables (`DATABASE_URL`, `GEMINI_API_KEY`)
4. Deploy — Vercel handles Next.js 15 automatically
5. Run `npx prisma db push` against your production database

---

## Trade-offs & Design Decisions

- **yahoo-finance2 without an API key**: Uses public endpoints — may hit rate limits under heavy traffic. For production scale, use a paid financial data API (Alpha Vantage, Financial Modeling Prep).
- **No mock data policy**: When financial data is unavailable, the app clearly marks fields as "N/A" rather than fabricating values. Transparency over completeness.
- **SSE over WebSocket**: Simpler to deploy on Vercel serverless without a persistent connection manager.
- **Prisma v6 on Prisma 7 CLI**: npm resolves to Prisma 6 for stable `schema.prisma` URL handling compatible with Next.js 15.
- **Gemini 1.5 Flash**: Chosen for speed and cost efficiency for multi-step analysis. Gemini 2.5 Flash is a drop-in upgrade.

---

## Future Improvements

- [ ] Full company comparison with side-by-side Recharts
- [ ] Alpha Vantage / FMP paid API integration for richer fundamentals
- [ ] User authentication (NextAuth.js) for personal watchlists
- [ ] Email report delivery
- [ ] Websocket real-time multi-user collaboration
- [ ] SEC filing direct parser (EDGAR XBRL)
- [ ] Custom LLM model selection (OpenAI GPT-4o, Claude)
- [ ] Portfolio-level analysis across multiple stocks
