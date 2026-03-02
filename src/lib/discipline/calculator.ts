// ============================================================
// Discipline Index Calculator
// ============================================================
// Formula:
//   Score = (completionRate * 0.60) + (streakScore * 0.20) + (weeklyTrend * 0.20)
//
// All inputs and output are in range [0, 100].
// ============================================================

export interface DisciplineInputs {
  /** Percentage of protocols completed over the tracked period (0–100) */
  completionRate: number;
  /** Current consecutive-day streak with all protocols done */
  currentStreak: number;
  /** Max streak considered "perfect" for normalization (default: 30) */
  maxStreakCap?: number;
  /**
   * Number of days this week where ALL active protocols were completed (0–7).
   * Used to compute weekly consistency trend.
   */
  weeklyPerfectDays: number;
}

export interface DisciplineResult {
  score: number; // 0–100, rounded to 1 decimal
  breakdown: {
    completionComponent: number;
    streakComponent: number;
    weeklyTrendComponent: number;
  };
}

const WEIGHTS = {
  completion: 0.6,
  streak: 0.2,
  weeklyTrend: 0.2,
} as const;

/**
 * Normalize the current streak to a 0–100 scale using a soft cap.
 * Uses a logarithmic curve so early streaks count meaningfully,
 * while very long streaks approach 100 asymptotically.
 */
function normalizeStreak(streak: number, cap: number): number {
  if (streak <= 0) return 0;
  // log curve: score = min(100, (log(streak+1) / log(cap+1)) * 100)
  const normalized = (Math.log(streak + 1) / Math.log(cap + 1)) * 100;
  return Math.min(100, normalized);
}

export function calculateDisciplineIndex(
  inputs: DisciplineInputs
): DisciplineResult {
  const { completionRate, currentStreak, maxStreakCap = 30, weeklyPerfectDays } =
    inputs;

  const streakNormalized = normalizeStreak(currentStreak, maxStreakCap);
  const weeklyTrend = (weeklyPerfectDays / 7) * 100;

  const completionComponent = Math.min(100, completionRate) * WEIGHTS.completion;
  const streakComponent = streakNormalized * WEIGHTS.streak;
  const weeklyTrendComponent = weeklyTrend * WEIGHTS.weeklyTrend;

  const score = Math.round(
    (completionComponent + streakComponent + weeklyTrendComponent) * 10
  ) / 10;

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      completionComponent: Math.round(completionComponent * 10) / 10,
      streakComponent: Math.round(streakComponent * 10) / 10,
      weeklyTrendComponent: Math.round(weeklyTrendComponent * 10) / 10,
    },
  };
}

// ── Streak calculation from log data ──────────────────────

export interface DayCompletionRecord {
  date: string; // ISO date string "YYYY-MM-DD"
  allCompleted: boolean;
}

/**
 * Computes the current streak from a sorted list of daily completion records.
 * Expects records to be sorted newest-first.
 * A streak is the number of consecutive days (ending today or yesterday)
 * where all protocols were completed.
 */
export function computeCurrentStreak(
  records: DayCompletionRecord[],
  today: Date = new Date()
): number {
  if (records.length === 0) return 0;

  const todayStr = toDateString(today);
  const yesterdayStr = toDateString(
    new Date(today.getTime() - 86_400_000)
  );

  // Streak must start from today or yesterday (gaps break it)
  const mostRecent = records[0].date;
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) return 0;

  let streak = 0;
  let expected = mostRecent;

  for (const record of records) {
    if (record.date !== expected) break; // gap found
    if (!record.allCompleted) break; // incomplete day
    streak++;
    expected = toDateString(
      new Date(new Date(record.date).getTime() - 86_400_000)
    );
  }

  return streak;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
