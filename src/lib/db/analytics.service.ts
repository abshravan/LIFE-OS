// ============================================================
// Analytics Data Service — Phase 3
// All queries are server-side. Returns serialisable data
// (Date → string) safe to pass as server component props.
// ============================================================

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { generateWeeklyReport } from "@/lib/discipline/weekly-report";

// ── Serialisable types ────────────────────────────────────────

export interface SevenDayPoint {
  date: string;            // ISO string
  dayLabel: string;        // "Mon"
  shortDate: string;       // "Mar 2"
  completedCount: number;
  totalCount: number;
  completionRate: number;  // 0–100
}

export interface HeatmapCell {
  date: string;            // "YYYY-MM-DD"
  completionRate: number;  // 0–100, -1 = no protocols scheduled
  completedCount: number;
  totalCount: number;
  isFuture: boolean;
}

export interface ExcuseStat {
  category: string;        // enum key
  label: string;           // human label
  count: number;
  percentage: number;
}

export interface ConsistencyStats {
  thirtyDayRate: number;       // 0–100 completion %
  thirtyDayPerfectDays: number;
  longestStreak: number;
  totalProtocols: number;
  activeProtocolCount: number;
}

export interface SerializableWeeklyReport {
  weekStart: string;
  weekEnd: string;
  completionPercent: number;
  weakestDay: string | null;
  mostSkippedProtocol: string | null;
  excuseBreakdown: Record<string, number>;
  suggestions: string[];
  disciplineScore: number;
  generatedAt: string;
}

export interface AnalyticsData {
  sevenDayData: SevenDayPoint[];
  consistency: ConsistencyStats;
  excuseStats: ExcuseStat[];
  heatmapCells: HeatmapCell[];
  weeklyReport: SerializableWeeklyReport | null;
}

// ── Label maps ─────────────────────────────────────────────────

const EXCUSE_LABELS: Record<string, string> = {
  TIRED:          "Low Energy / Tired",
  BUSY:           "Too Busy",
  PROCRASTINATED: "Procrastination",
  LOW_MOOD:       "Low Mood",
  OTHER:          "Other",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Main entry point ───────────────────────────────────────────

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  const now = new Date();
  const today = startOfDay(now);

  const [
    sevenDayData,
    consistency,
    excuseStats,
    heatmapCells,
    weeklyReport,
  ] = await Promise.all([
    buildSevenDayData(userId, today),
    buildConsistencyStats(userId, today),
    buildExcuseStats(userId, today),
    buildHeatmapCells(userId, today),
    getOrGenerateWeeklyReport(userId),
  ]);

  return { sevenDayData, consistency, excuseStats, heatmapCells, weeklyReport };
}

// ── 7-day completion chart ─────────────────────────────────────

async function buildSevenDayData(
  userId: string,
  today: Date
): Promise<SevenDayPoint[]> {
  const sevenDaysAgo = new Date(today.getTime() - 6 * 86_400_000);

  const logs = await prisma.protocolLog.findMany({
    where: { userId, date: { gte: sevenDaysAgo, lte: today } },
    select: { date: true, completed: true },
  });

  const points: SevenDayPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const dateStr = toDateStr(d);

    const dayLogs = logs.filter((l) => toDateStr(l.date) === dateStr);
    const total = dayLogs.length;
    const completed = dayLogs.filter((l) => l.completed).length;

    points.push({
      date: d.toISOString(),
      dayLabel: DAY_LABELS[d.getDay()],
      shortDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completedCount: completed,
      totalCount: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return points;
}

// ── 30-day consistency stats ───────────────────────────────────

async function buildConsistencyStats(
  userId: string,
  today: Date
): Promise<ConsistencyStats> {
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 86_400_000);

  const [logs, protocols] = await Promise.all([
    prisma.protocolLog.findMany({
      where: { userId, date: { gte: thirtyDaysAgo, lte: today } },
      select: { date: true, completed: true },
    }),
    prisma.protocol.findMany({
      where: { userId, isActive: true },
      select: { id: true },
    }),
  ]);

  const total = logs.length;
  const done = logs.filter((l) => l.completed).length;
  const thirtyDayRate = total > 0 ? Math.round((done / total) * 100 * 10) / 10 : 0;

  // Group by date for perfect-day count and longest streak
  const byDate = new Map<string, { done: number; total: number }>();
  for (const log of logs) {
    const key = toDateStr(log.date);
    const e = byDate.get(key) ?? { done: 0, total: 0 };
    e.total++;
    if (log.completed) e.done++;
    byDate.set(key, e);
  }

  let thirtyDayPerfectDays = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  const sortedDates = [...byDate.keys()].sort();
  for (const date of sortedDates) {
    const { done: d, total: t } = byDate.get(date)!;
    const isPerfect = t > 0 && d === t;
    if (isPerfect) {
      thirtyDayPerfectDays++;
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    thirtyDayRate,
    thirtyDayPerfectDays,
    longestStreak,
    totalProtocols: total,
    activeProtocolCount: protocols.length,
  };
}

// ── Excuse analysis ────────────────────────────────────────────

async function buildExcuseStats(
  userId: string,
  today: Date
): Promise<ExcuseStat[]> {
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 86_400_000);

  const excuses = await prisma.excuse.findMany({
    where: { protocolLog: { userId, date: { gte: thirtyDaysAgo, lte: today } } },
    select: { category: true },
  });

  if (excuses.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const e of excuses) {
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  }

  const total = excuses.length;

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({
      category,
      label: EXCUSE_LABELS[category] ?? category,
      count,
      percentage: Math.round((count / total) * 100),
    }));
}

// ── Activity heatmap (last 91 days / 13 weeks) ─────────────────

async function buildHeatmapCells(
  userId: string,
  today: Date
): Promise<HeatmapCell[]> {
  // Start from the Monday 12 weeks before the current week's Monday
  const currentMonday = getMostRecentMonday(today);
  const startDate = new Date(currentMonday.getTime() - 12 * 7 * 86_400_000);

  const logs = await prisma.protocolLog.findMany({
    where: { userId, date: { gte: startDate, lte: today } },
    select: { date: true, completed: true },
  });

  const byDate = new Map<string, { done: number; total: number }>();
  for (const log of logs) {
    const key = toDateStr(log.date);
    const e = byDate.get(key) ?? { done: 0, total: 0 };
    e.total++;
    if (log.completed) e.done++;
    byDate.set(key, e);
  }

  const cells: HeatmapCell[] = [];
  const endDate = new Date(currentMonday.getTime() + 6 * 86_400_000); // Sunday

  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    const key = toDateStr(cursor);
    const entry = byDate.get(key);
    const isFuture = cursor > today;

    cells.push({
      date: key,
      completionRate: entry
        ? entry.total > 0
          ? Math.round((entry.done / entry.total) * 100)
          : 0
        : -1,
      completedCount: entry?.done ?? 0,
      totalCount: entry?.total ?? 0,
      isFuture,
    });

    cursor = new Date(cursor.getTime() + 86_400_000);
  }

  return cells;
}

// ── Weekly report generation ───────────────────────────────────

async function getOrGenerateWeeklyReport(
  userId: string
): Promise<SerializableWeeklyReport | null> {
  const weekStart = getMostRecentMonday(new Date());
  const weekEnd = new Date(weekStart.getTime() + 6 * 86_400_000);

  // Check cache first
  let report = await prisma.weeklyReport.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });

  if (!report) {
    const [logs, protocols] = await Promise.all([
      prisma.protocolLog.findMany({
        where: { userId, date: { gte: weekStart, lte: weekEnd } },
        include: {
          protocol: { select: { name: true } },
          excuse: { select: { category: true } },
        },
      }),
      prisma.protocol.findMany({
        where: { userId, isActive: true },
        select: { id: true },
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

    const excuseJson = reportData.excuseBreakdown as unknown as Prisma.InputJsonValue;

    report = await prisma.weeklyReport.create({
      data: {
        userId,
        weekStart,
        weekEnd,
        ...reportData,
        excuseBreakdown: excuseJson,
      },
    });
  }

  return {
    weekStart: report.weekStart.toISOString(),
    weekEnd: report.weekEnd.toISOString(),
    completionPercent: report.completionPercent,
    weakestDay: report.weakestDay,
    mostSkippedProtocol: report.mostSkippedProtocol,
    excuseBreakdown: report.excuseBreakdown as Record<string, number>,
    suggestions: report.suggestions,
    disciplineScore: report.disciplineScore,
    generatedAt: report.generatedAt.toISOString(),
  };
}

// ── Utilities ──────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMostRecentMonday(from: Date): Date {
  const d = startOfDay(from);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1;
  return new Date(d.getTime() - diff * 86_400_000);
}
