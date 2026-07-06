import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveTickerFromName } from "@/services/yahooFinance";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const c1 = url.searchParams.get("c1");
    const c2 = url.searchParams.get("c2");

    if (!c1 || !c2) {
      return NextResponse.json({ error: "Missing companies" }, { status: 400 });
    }

    // Try to resolve both inputs to tickers using our 4-tier Yahoo Finance resolver
    const t1 = await resolveTickerFromName(c1);
    const t2 = await resolveTickerFromName(c2);

    const ticker1 = t1?.ticker ?? c1.toUpperCase();
    const ticker2 = t2?.ticker ?? c2.toUpperCase();

    // Fetch latest research for both
    const [report1, report2] = await Promise.all([
      prisma.researchHistory.findFirst({
        where: { OR: [{ ticker: ticker1 }, { company: { equals: c1, mode: "insensitive" } }] },
        orderBy: { createdAt: "desc" },
      }),
      prisma.researchHistory.findFirst({
        where: { OR: [{ ticker: ticker2 }, { company: { equals: c2, mode: "insensitive" } }] },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!report1) {
      return NextResponse.json({ error: `Could not find a past research report for '${t1?.name ?? c1}'. Please analyze it on the Dashboard first.` }, { status: 404 });
    }
    if (!report2) {
      return NextResponse.json({ error: `Could not find a past research report for '${t2?.name ?? c2}'. Please analyze it on the Dashboard first.` }, { status: 404 });
    }

    return NextResponse.json({ report1, report2 });
  } catch (error) {
    console.error("[Compare API Error]", error);
    return NextResponse.json({ error: "Failed to compare companies" }, { status: 500 });
  }
}
