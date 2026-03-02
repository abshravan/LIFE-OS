// ============================================================
// Dashboard Data Service
// Server-side only. Returns serializable data safe to pass
// as Next.js server → client component props.
// ============================================================

import { prisma } from "./prisma";
import {
  calculateDisciplineIndex,
  computeCurrentStreak,
} from "@/lib/discipline/calculator";

// ── Serializable types (Date → string) ───────────────────────
// These mirror Prisma shapes but with Date fields as strings,
// since Next.js serialises server component props via JSON.

export interface SerializableProtocolLog {
  id: string;
  userId: string;
  protocolId: string;
  dailyLogId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  protocol: {
    id: string;
    name: string;
    description: string | null;
    order: number;
  };
  excuse: {
    category: string;
    note: string | null;
  } | null;
}

export interface SerializableDailyLog {
  id: string;
  userId: string;
  date: string;
  mood: number | null;
  energy: number | null;
  disciplineScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  protocolLogs: SerializableProtocolLog[];
}

export interface DashboardData {
  setupRequired: false;
  identity: { targetSelf: string; motivation: string };
  dailyLog: SerializableDailyLog;
  disciplineScore: number;
  currentStreak: number;
}

export interface SetupRequired {
  setupRequired: true;
}

// ── Main entry point ──────────────────────────────────────────

export async function getDashboardData(
  userId: string
): Promise<DashboardData | SetupRequired> {
  const [identity, protocols] = await Promise.all([
    prisma.identity.findUnique({
      where: { userId },
      select: { targetSelf: true, motivation: true },
    }),
    prisma.protocol.findMany({
      where: { userId, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true, order: true },
    }),
  ]);

  if (!identity || protocols.length === 0) {
    return { setupRequired: true };
  }

  const today = startOfDay(new Date());
  const rawLog = await getOrCreateDailyLog(userId, today, protocols);

  if (!rawLog) {
    return { setupRequired: true };
  }

  const { disciplineScore, currentStreak } = await computeMetrics(userId, today);

  // Update cached score (fire and forget)
  if (rawLog.disciplineScore !== disciplineScore) {
    prisma.dailyLog
      .update({ where: { id: rawLog.id }, data: { disciplineScore } })
      .catch(() => {});
  }

  // Serialize all Date objects to ISO strings
  const dailyLog = serializeDailyLog(rawLog);

  return {
    setupRequired: false,
    identity,
    dailyLog,
    disciplineScore,
    currentStreak,
  };
}

// ── Helpers ───────────────────────────────────────────────────

type RawDailyLog = NonNullable<Awaited<ReturnType<typeof fetchDailyLog>>>;

async function fetchDailyLog(userId: string, date: Date) {
  return prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date } },
    include: {
      protocolLogs: {
        include: {
          protocol: {
            select: { id: true, name: true, description: true, order: true },
          },
          excuse: { select: { category: true, note: true } },
        },
        orderBy: { protocol: { order: "asc" } },
      },
    },
  });
}

async function getOrCreateDailyLog(
  userId: string,
  date: Date,
  protocols: Array<{ id: string }>
): Promise<RawDailyLog | null> {
  const existing = await fetchDailyLog(userId, date);
  if (existing) return existing;

  await prisma.dailyLog.create({
    data: {
      userId,
      date,
      protocolLogs: {
        create: protocols.map((p) => ({
          userId,
          protocolId: p.id,
          date,
          completed: false,
        })),
      },
    },
  });

  return fetchDailyLog(userId, date);
}

async function computeMetrics(userId: string, asOf: Date) {
  const thirtyDaysAgo = new Date(asOf.getTime() - 30 * 86_400_000);

  const logs = await prisma.protocolLog.findMany({
    where: { userId, date: { gte: thirtyDaysAgo, lte: asOf } },
    select: { completed: true, date: true },
  });

  const total = logs.length;
  const done = logs.filter((l) => l.completed).length;
  const completionRate = total > 0 ? (done / total) * 100 : 0;

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
    .map(([date, v]) => ({
      date,
      allCompleted: v.done === v.total && v.total > 0,
    }));

  const currentStreak = computeCurrentStreak(dayRecords, asOf);
  const weeklyPerfectDays = dayRecords.slice(0, 7).filter((d) => d.allCompleted).length;

  const { score: disciplineScore } = calculateDisciplineIndex({
    completionRate,
    currentStreak,
    weeklyPerfectDays,
  });

  return { disciplineScore, currentStreak };
}

function serializeDailyLog(log: RawDailyLog): SerializableDailyLog {
  return {
    id: log.id,
    userId: log.userId,
    date: log.date.toISOString(),
    mood: log.mood,
    energy: log.energy,
    disciplineScore: log.disciplineScore,
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    protocolLogs: log.protocolLogs.map((pl) => ({
      id: pl.id,
      userId: pl.userId,
      protocolId: pl.protocolId,
      dailyLogId: pl.dailyLogId,
      date: pl.date.toISOString(),
      completed: pl.completed,
      completedAt: pl.completedAt?.toISOString() ?? null,
      createdAt: pl.createdAt.toISOString(),
      updatedAt: pl.updatedAt.toISOString(),
      protocol: pl.protocol,
      excuse: pl.excuse,
    })),
  };
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
