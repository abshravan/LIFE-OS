// ============================================================
// Weekly Diagnostic Report Generator
// ============================================================

import type { ExcuseBreakdown, WeeklyReportData } from "@/types";
import { calculateDisciplineIndex, computeCurrentStreak } from "./calculator";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ProtocolLogData {
  date: Date;
  completed: boolean;
  protocol: { name: string };
  excuse: { category: string } | null;
}

export function generateWeeklyReport(
  logs: ProtocolLogData[],
  weekStart: Date,
  weekEnd: Date,
  protocolCount: number
): Omit<WeeklyReportData, "weekStart" | "weekEnd"> {
  if (logs.length === 0 || protocolCount === 0) {
    return emptyReport();
  }

  // ── Completion % ─────────────────────────────────────────
  const totalSlots = protocolCount * 7;
  const completedSlots = logs.filter((l) => l.completed).length;
  const completionPercent = Math.round((completedSlots / totalSlots) * 100 * 10) / 10;

  // ── Weakest day ──────────────────────────────────────────
  const dayRates: Record<string, { done: number; total: number }> = {};
  for (const log of logs) {
    const day = DAYS[log.date.getDay()];
    if (!dayRates[day]) dayRates[day] = { done: 0, total: 0 };
    dayRates[day].total++;
    if (log.completed) dayRates[day].done++;
  }

  let weakestDay: string | null = null;
  let lowestRate = Infinity;
  for (const [day, { done, total }] of Object.entries(dayRates)) {
    const rate = done / total;
    if (rate < lowestRate) {
      lowestRate = rate;
      weakestDay = day;
    }
  }

  // ── Most skipped protocol ────────────────────────────────
  const skipCount: Record<string, number> = {};
  for (const log of logs) {
    if (!log.completed) {
      const name = log.protocol.name;
      skipCount[name] = (skipCount[name] ?? 0) + 1;
    }
  }

  let mostSkippedProtocol: string | null = null;
  let maxSkips = 0;
  for (const [name, count] of Object.entries(skipCount)) {
    if (count > maxSkips) {
      maxSkips = count;
      mostSkippedProtocol = name;
    }
  }

  // ── Excuse breakdown ─────────────────────────────────────
  const excuseBreakdown: ExcuseBreakdown = {
    TIRED: 0,
    BUSY: 0,
    PROCRASTINATED: 0,
    LOW_MOOD: 0,
    OTHER: 0,
  };

  for (const log of logs) {
    if (!log.completed && log.excuse) {
      const cat = log.excuse.category as keyof ExcuseBreakdown;
      excuseBreakdown[cat] = (excuseBreakdown[cat] ?? 0) + 1;
    }
  }

  // ── Discipline score ─────────────────────────────────────
  const dayRecords = Array.from(
    new Map(
      logs
        .map((l) => l.date.toISOString().split("T")[0])
        .map((date) => {
          const dayLogs = logs.filter(
            (l) => l.date.toISOString().split("T")[0] === date
          );
          return [
            date,
            {
              date,
              allCompleted: dayLogs.every((l) => l.completed),
            },
          ];
        })
    ).values()
  ).sort((a, b) => b.date.localeCompare(a.date));

  const currentStreak = computeCurrentStreak(dayRecords, weekEnd);
  const weeklyPerfectDays = dayRecords.filter((d) => d.allCompleted).length;

  const { score: disciplineScore } = calculateDisciplineIndex({
    completionRate: completionPercent,
    currentStreak,
    weeklyPerfectDays,
  });

  // ── Suggestions ──────────────────────────────────────────
  const suggestions = generateSuggestions({
    completionPercent,
    weakestDay,
    mostSkippedProtocol,
    excuseBreakdown,
    weeklyPerfectDays,
  });

  return {
    completionPercent,
    weakestDay,
    mostSkippedProtocol,
    excuseBreakdown,
    suggestions,
    disciplineScore,
  };
}

// ── Suggestion engine ─────────────────────────────────────────

interface SuggestionContext {
  completionPercent: number;
  weakestDay: string | null;
  mostSkippedProtocol: string | null;
  excuseBreakdown: ExcuseBreakdown;
  weeklyPerfectDays: number;
}

function generateSuggestions(ctx: SuggestionContext): string[] {
  const suggestions: string[] = [];
  const topExcuse = getTopExcuse(ctx.excuseBreakdown);

  if (ctx.completionPercent < 50) {
    suggestions.push(
      "System integrity is critically low. Reduce protocol count or set shorter sessions."
    );
  } else if (ctx.completionPercent < 75) {
    suggestions.push(
      "Consistency below threshold. Identify and eliminate single largest blocker."
    );
  }

  if (ctx.weakestDay) {
    suggestions.push(
      `${ctx.weakestDay} is your lowest-output day. Pre-schedule protocol execution before 09:00 on ${ctx.weakestDay}s.`
    );
  }

  if (ctx.mostSkippedProtocol) {
    suggestions.push(
      `Protocol "${ctx.mostSkippedProtocol}" is your weakest node. Consider reducing its time requirement or re-evaluating its design.`
    );
  }

  if (topExcuse === "TIRED") {
    suggestions.push(
      "Fatigue is the primary interference pattern. Audit sleep schedule — protocol execution requires a rested system."
    );
  } else if (topExcuse === "PROCRASTINATED") {
    suggestions.push(
      "Procrastination is the dominant failure mode. Implement a 2-minute protocol trigger immediately upon waking."
    );
  } else if (topExcuse === "BUSY") {
    suggestions.push(
      "Busyness is causing protocol failures. Time-block protocols as non-negotiable meetings."
    );
  } else if (topExcuse === "LOW_MOOD") {
    suggestions.push(
      "Mood dependency detected. Protocols must execute regardless of state — automate the trigger, remove the decision."
    );
  }

  if (ctx.weeklyPerfectDays >= 5) {
    suggestions.push("Strong week. Maintain trajectory. Consider adding a fourth micro-protocol.");
  }

  return suggestions.slice(0, 4); // Cap at 4 suggestions
}

function getTopExcuse(breakdown: ExcuseBreakdown): keyof ExcuseBreakdown | null {
  let top: keyof ExcuseBreakdown | null = null;
  let max = 0;
  for (const [key, val] of Object.entries(breakdown) as [keyof ExcuseBreakdown, number][]) {
    if (val > max) {
      max = val;
      top = key;
    }
  }
  return max > 0 ? top : null;
}

function emptyReport(): Omit<WeeklyReportData, "weekStart" | "weekEnd"> {
  return {
    completionPercent: 0,
    weakestDay: null,
    mostSkippedProtocol: null,
    excuseBreakdown: { TIRED: 0, BUSY: 0, PROCRASTINATED: 0, LOW_MOOD: 0, OTHER: 0 },
    suggestions: ["No protocol data available for this week. Initialize your first protocol."],
    disciplineScore: 0,
  };
}
