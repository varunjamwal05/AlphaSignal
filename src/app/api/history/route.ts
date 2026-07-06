// src/app/api/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const history = await prisma.researchHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        company: true,
        ticker: true,
        recommendation: true,
        score: true,
        confidence: true,
        summary: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ history });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
