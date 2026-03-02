// ============================================================
// LifeOS Demo Data
// Deterministic, realistic data seeded from a fixed date.
// No database, no auth — pure static snapshot.
// ============================================================

import type { SerializableDailyLog } from "@/lib/db/dashboard.service";
import type {
  AnalyticsData,
  SevenDayPoint,
  HeatmapCell,
  ExcuseStat,
  ConsistencyStats,
  SerializableWeeklyReport,
} from "@/lib/db/analytics.service";

// ── Constants ─────────────────────────────────────────────────

export const DEMO_USERNAME = "ARCH_STUDENT_01";

export const DEMO_IDENTITY = {
  targetSelf:
    "A disciplined software engineer who ships products, builds in public, and stays physically sharp — every single day.",
  motivation:
    "I want to prove to myself that I can build the life I designed, not the one that happened to me. Consistency is the only proof.",
};

export const DEMO_PROTOCOLS = [
  { id: "p1", name: "Deep Work — 2h", description: "No distractions. Build or study. Every day.", order: 0 },
  { id: "p2", name: "Physical Training", description: "30min minimum. Gym, run, or bodyweight.", order: 1 },
  { id: "p3", name: "Reading — 30min", description: "Technical or philosophical. No social media.", order: 2 },
];

// ── Anchor date (always "today" in demo) ──────────────────────
// We use a fixed reference so snapshot data is stable.
// We compute relative to actual today so "today" feels real.

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function isoStr(d: Date): string {
  return d.toISOString();
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ── Dashboard demo data ───────────────────────────────────────

export function getDemoDashboardData(): {
  dailyLog: SerializableDailyLog;
  disciplineScore: number;
  currentStreak: number;
} {
  const today = daysAgo(0);
  const todayStr = dateStr(today);

  const dailyLog: SerializableDailyLog = {
    id: "demo-log-today",
    userId: "demo-user",
    date: isoStr(today),
    mood: 7,
    energy: 6,
    disciplineScore: 74.2,
    notes: null,
    createdAt: isoStr(today),
    updatedAt: isoStr(today),
    protocolLogs: [
      {
        id: "pl1",
        userId: "demo-user",
        protocolId: "p1",
        dailyLogId: "demo-log-today",
        date: todayStr,
        completed: true,
        completedAt: new Date(today.getTime() + 2 * 3600_000).toISOString(),
        createdAt: isoStr(today),
        updatedAt: isoStr(today),
        protocol: DEMO_PROTOCOLS[0],
        excuse: null,
      },
      {
        id: "pl2",
        userId: "demo-user",
        protocolId: "p2",
        dailyLogId: "demo-log-today",
        date: todayStr,
        completed: false,
        completedAt: null,
        createdAt: isoStr(today),
        updatedAt: isoStr(today),
        protocol: DEMO_PROTOCOLS[1],
        excuse: null,
      },
      {
        id: "pl3",
        userId: "demo-user",
        protocolId: "p3",
        dailyLogId: "demo-log-today",
        date: todayStr,
        completed: true,
        completedAt: new Date(today.getTime() + 6 * 3600_000).toISOString(),
        createdAt: isoStr(today),
        updatedAt: isoStr(today),
        protocol: DEMO_PROTOCOLS[2],
        excuse: null,
      },
    ],
  };

  return {
    dailyLog,
    disciplineScore: 74.2,
    currentStreak: 5,
  };
}

// ── Analytics demo data ───────────────────────────────────────

// Deterministic completion rates per day for 7-day chart.
// Story: improving week — dipped Thursday, strong finish.
const SEVEN_DAY_RATES = [100, 67, 100, 33, 100, 100, 67];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PROTOCOL_COUNT = 3;

export function getDemoAnalyticsData(): AnalyticsData {
  const sevenDayData = buildDemoSevenDayData();
  const heatmapCells = buildDemoHeatmapCells();
  const excuseStats = buildDemoExcuseStats();
  const consistency = buildDemoConsistency();
  const weeklyReport = buildDemoWeeklyReport();

  return { sevenDayData, consistency, excuseStats, heatmapCells, weeklyReport };
}

function buildDemoSevenDayData(): SevenDayPoint[] {
  const points: SevenDayPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const rate = SEVEN_DAY_RATES[6 - i];
    const completed = Math.round((rate / 100) * PROTOCOL_COUNT);

    points.push({
      date: isoStr(d),
      dayLabel: DAY_LABELS[d.getDay()],
      shortDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completedCount: completed,
      totalCount: PROTOCOL_COUNT,
      completionRate: rate,
    });
  }

  return points;
}

// 91 days of heatmap. Story: rough start → improving → strong recent.
// Uses a simple deterministic schedule keyed on day index.
function buildDemoHeatmapCells(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const today = daysAgo(0);

  // Align to the Monday 12 weeks before this week's Monday
  const dow = today.getDay();
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = daysAgo(daysToMon);
  const startDate = daysAgo(daysToMon + 12 * 7);

  const cursor = new Date(startDate);
  const endDate = new Date(thisMonday.getTime() + 6 * 86_400_000);

  let dayIndex = 0;

  while (cursor <= endDate) {
    const isFuture = cursor > today;
    const weekIndex = Math.floor(dayIndex / 7); // 0 = oldest
    const weekDow = cursor.getDay();

    let rate: number;

    if (isFuture) {
      rate = -1;
    } else {
      // Narrative arc: inconsistent → building → disciplined
      const baseRate =
        weekIndex < 4  ? 45   // rough start
        : weekIndex < 7  ? 65  // building
        : weekIndex < 10 ? 82  // disciplined
        : 88;                  // strong recent

      // Weekdays are stronger; weekends are weaker
      const dayFactor =
        weekDow === 0 || weekDow === 6 ? -15  // weekend dip
        : weekDow === 4                 ? -20  // Thursday slump
        : weekDow === 1                 ? 8    // Monday momentum
        : 5;

      // Pseudorandom variation using day index (deterministic)
      const jitter = ((dayIndex * 17 + 13) % 30) - 15;

      rate = Math.min(100, Math.max(0, baseRate + dayFactor + jitter));

      // Snap to clean buckets: 0 / 33 / 67 / 100 (3 protocols)
      rate =
        rate >= 90 ? 100
        : rate >= 60 ? 67
        : rate >= 30 ? 33
        : 0;
    }

    const completed = rate <= 0 ? 0 : Math.round((rate / 100) * PROTOCOL_COUNT);

    cells.push({
      date: dateStr(cursor),
      completionRate: rate,
      completedCount: completed,
      totalCount: isFuture ? 0 : PROTOCOL_COUNT,
      isFuture,
    });

    cursor.setDate(cursor.getDate() + 1);
    dayIndex++;
  }

  return cells;
}

function buildDemoExcuseStats(): ExcuseStat[] {
  const raw = [
    { category: "PROCRASTINATED", label: "Procrastination",   count: 9 },
    { category: "TIRED",          label: "Low Energy / Tired", count: 6 },
    { category: "BUSY",           label: "Too Busy",           count: 4 },
    { category: "LOW_MOOD",       label: "Low Mood",           count: 2 },
    { category: "OTHER",          label: "Other",              count: 1 },
  ];

  const total = raw.reduce((s, r) => s + r.count, 0);

  return raw.map((r) => ({
    ...r,
    percentage: Math.round((r.count / total) * 100),
  }));
}

function buildDemoConsistency(): ConsistencyStats {
  return {
    thirtyDayRate: 78.9,
    thirtyDayPerfectDays: 17,
    longestStreak: 8,
    totalProtocols: 90, // 30 days × 3 protocols
    activeProtocolCount: 3,
  };
}

function buildDemoWeeklyReport(): SerializableWeeklyReport {
  const monday = daysAgo(daysAgo(0).getDay() === 0 ? 6 : daysAgo(0).getDay() - 1);
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);

  return {
    weekStart: isoStr(monday),
    weekEnd: isoStr(sunday),
    completionPercent: 76.2,
    weakestDay: "Thursday",
    mostSkippedProtocol: "Physical Training",
    excuseBreakdown: {
      PROCRASTINATED: 3,
      TIRED: 2,
      BUSY: 1,
      LOW_MOOD: 0,
      OTHER: 0,
    },
    suggestions: [
      "Thursday is your lowest-output day. Pre-schedule protocol execution before 09:00 on Thursdays.",
      "Protocol \"Physical Training\" is your weakest node. Consider reducing its time requirement to 20min minimum.",
      "Procrastination is the dominant failure mode. Implement a 2-minute protocol trigger immediately upon waking.",
      "Consistency is trending upward. Maintain trajectory — do not add new protocols until 85% rate is sustained.",
    ],
    disciplineScore: 74.2,
    generatedAt: new Date().toISOString(),
  };
}
