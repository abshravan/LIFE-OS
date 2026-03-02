import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { generateWeeklyReport } from "@/lib/discipline/weekly-report";
import { ok, err, unauthorized, serverError } from "@/lib/api/response";

// GET /api/weekly-report?weekStart=YYYY-MM-DD — fetch stored report for a week
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const weekStart = request.nextUrl.searchParams.get("weekStart");

    if (!weekStart) return err("weekStart parameter required", 400);

    const report = await prisma.weeklyReport.findUnique({
      where: {
        userId_weekStart: {
          userId: session.userId,
          weekStart: new Date(weekStart),
        },
      },
    });

    return ok(report);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

// POST /api/weekly-report — generate (or regenerate) this week's report
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => ({}));
    const weekStartParam = body.weekStart as string | undefined;

    // Default to the most recent Monday
    const weekStart = weekStartParam
      ? new Date(weekStartParam)
      : getMostRecentMonday();

    const weekEnd = new Date(weekStart.getTime() + 6 * 86_400_000);

    const [logs, protocols] = await Promise.all([
      prisma.protocolLog.findMany({
        where: {
          userId: session.userId,
          date: { gte: weekStart, lte: weekEnd },
        },
        include: {
          protocol: { select: { name: true } },
          excuse: { select: { category: true } },
        },
      }),
      prisma.protocol.findMany({
        where: { userId: session.userId, isActive: true },
      }),
    ]);

    const reportData = generateWeeklyReport(
      logs.map((l) => ({
        date: l.date,
        completed: l.completed,
        protocol: l.protocol,
        excuse: l.excuse,
      })),
      weekStart,
      weekEnd,
      protocols.length
    );

    // Cast excuseBreakdown to Prisma's Json type (required for typed JSON fields)
    const excuseBreakdownJson =
      reportData.excuseBreakdown as unknown as Prisma.InputJsonValue;

    const report = await prisma.weeklyReport.upsert({
      where: {
        userId_weekStart: { userId: session.userId, weekStart },
      },
      create: {
        userId: session.userId,
        weekStart,
        weekEnd,
        ...reportData,
        excuseBreakdown: excuseBreakdownJson,
      },
      update: { ...reportData, excuseBreakdown: excuseBreakdownJson },
    });

    return ok(report, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

function getMostRecentMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(now.getTime() - diff * 86_400_000);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
