// src/app/api/report/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.researchHistory.findUnique({
      where: { id: params.id },
      include: { executionLogs: { orderBy: { createdAt: "asc" } } },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
