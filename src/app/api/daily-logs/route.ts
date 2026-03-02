import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { dailyLogSchema } from "@/lib/auth/validation";
import {
  calculateDisciplineIndex,
  computeCurrentStreak,
} from "@/lib/discipline/calculator";
import { ok, err, unauthorized, serverError } from "@/lib/api/response";

// GET /api/daily-logs?date=YYYY-MM-DD   — fetch a single day's log
// GET /api/daily-logs?from=YYYY-MM-DD&to=YYYY-MM-DD — fetch a range
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (date) {
      const log = await prisma.dailyLog.findUnique({
        where: { userId_date: { userId: session.userId, date: new Date(date) } },
        include: {
          protocolLogs: {
            include: {
              protocol: { select: { name: true } },
              excuse: true,
            },
            orderBy: { protocol: { order: "asc" } },
          },
        },
      });
      return ok(log);
    }

    if (from && to) {
      const logs = await prisma.dailyLog.findMany({
        where: {
          userId: session.userId,
          date: { gte: new Date(from), lte: new Date(to) },
        },
        include: { protocolLogs: { include: { excuse: true } } },
        orderBy: { date: "asc" },
      });
      return ok(logs);
    }

    return err("Provide ?date= or ?from=&to= parameters", 400);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

// POST /api/daily-logs — create or update today's log (mood, energy)
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = dailyLogSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { date, mood, energy, notes } = parsed.data;
    const dateObj = new Date(date);

    // Get active protocols for this user to scaffold ProtocolLogs
    const protocols = await prisma.protocol.findMany({
      where: { userId: session.userId, isActive: true },
      orderBy: { order: "asc" },
    });

    // Upsert the daily log
    const dailyLog = await prisma.dailyLog.upsert({
      where: { userId_date: { userId: session.userId, date: dateObj } },
      create: {
        userId: session.userId,
        date: dateObj,
        mood,
        energy,
        notes,
        protocolLogs: {
          create: protocols.map((p) => ({
            userId: session.userId,
            protocolId: p.id,
            date: dateObj,
            completed: false,
          })),
        },
      },
      update: { mood, energy, notes },
      include: {
        protocolLogs: {
          include: {
            protocol: { select: { name: true } },
            excuse: true,
          },
          orderBy: { protocol: { order: "asc" } },
        },
      },
    });

    // Recompute and cache discipline score
    const score = await recomputeDisciplineScore(session.userId, dateObj);
    await prisma.dailyLog.update({
      where: { id: dailyLog.id },
      data: { disciplineScore: score },
    });

    return ok({ ...dailyLog, disciplineScore: score }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

// ── Helper: recompute discipline score ────────────────────────

async function recomputeDisciplineScore(
  userId: string,
  asOf: Date
): Promise<number> {
  // 30-day completion rate
  const thirtyDaysAgo = new Date(asOf.getTime() - 30 * 86_400_000);

  const logs = await prisma.protocolLog.findMany({
    where: { userId, date: { gte: thirtyDaysAgo, lte: asOf } },
    select: { completed: true, date: true, protocolId: true },
  });

  const total = logs.length;
  const completed = logs.filter((l) => l.completed).length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  // Group by date to find days where ALL protocols were done
  const byDate = new Map<string, { done: number; total: number }>();
  for (const log of logs) {
    const key = log.date.toISOString().split("T")[0];
    const entry = byDate.get(key) ?? { done: 0, total: 0 };
    entry.total++;
    if (log.completed) entry.done++;
    byDate.set(key, entry);
  }

  const dayRecords = [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, v]) => ({ date, allCompleted: v.done === v.total && v.total > 0 }));

  const currentStreak = computeCurrentStreak(dayRecords, asOf);

  // Weekly perfect days (last 7 days)
  const sevenDaysAgo = new Date(asOf.getTime() - 7 * 86_400_000);
  const weeklyPerfectDays = dayRecords.filter(
    (d) => d.allCompleted && new Date(d.date) >= sevenDaysAgo
  ).length;

  const result = calculateDisciplineIndex({
    completionRate,
    currentStreak,
    weeklyPerfectDays,
  });

  return result.score;
}
