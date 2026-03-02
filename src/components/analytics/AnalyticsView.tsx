"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AnalyticsData, SerializableWeeklyReport } from "@/lib/db/analytics.service";

import CompletionChart from "./CompletionChart";
import ConsistencyStatsPanel from "./ConsistencyStats";
import ExcuseBreakdownChart from "./ExcuseBreakdownChart";
import ActivityHeatmap from "./ActivityHeatmap";
import WeeklyReportCard from "./WeeklyReportCard";

interface AnalyticsViewProps {
  data: AnalyticsData;
}

const FADE_UP = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3 },
});

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const [weeklyReport, setWeeklyReport] = useState<SerializableWeeklyReport | null>(
    data.weeklyReport
  );

  async function handleRegenerate() {
    const res = await fetch("/api/weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("Failed to regenerate report");

    const result = await res.json();
    if (result.success && result.data) {
      // Normalise Date fields returned by the API
      const r = result.data;
      setWeeklyReport({
        weekStart: r.weekStart,
        weekEnd: r.weekEnd,
        completionPercent: r.completionPercent,
        weakestDay: r.weakestDay,
        mostSkippedProtocol: r.mostSkippedProtocol,
        excuseBreakdown: r.excuseBreakdown ?? {},
        suggestions: r.suggestions ?? [],
        disciplineScore: r.disciplineScore,
        generatedAt: r.generatedAt,
      });
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div {...FADE_UP(0)}>
        <p className="text-[10px] tracking-[0.35em] text-[var(--sys-muted)] uppercase">
          SYSTEM DIAGNOSTICS
        </p>
        <h1 className="text-2xl font-bold tracking-wider mt-1">Analytics</h1>
        <p className="text-xs text-[var(--sys-muted)] mt-0.5">
          Performance analysis · Last 30 days
        </p>
      </motion.div>

      {/* ── Weekly Diagnostic Report ─────────────────────── */}
      {weeklyReport && (
        <motion.div {...FADE_UP(0.05)}>
          <WeeklyReportCard
            report={weeklyReport}
            onRegenerate={handleRegenerate}
          />
        </motion.div>
      )}

      {/* ── Row 1: 7-day chart + 30-day stats ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div {...FADE_UP(0.1)} className="lg:col-span-2">
          <CompletionChart data={data.sevenDayData} />
        </motion.div>

        <motion.div {...FADE_UP(0.15)}>
          <ConsistencyStatsPanel stats={data.consistency} />
        </motion.div>
      </div>

      {/* ── Activity Heatmap ─────────────────────────────── */}
      <motion.div {...FADE_UP(0.2)}>
        <ActivityHeatmap cells={data.heatmapCells} />
      </motion.div>

      {/* ── Excuse Breakdown ─────────────────────────────── */}
      <motion.div {...FADE_UP(0.25)}>
        <ExcuseBreakdownChart data={data.excuseStats} />
      </motion.div>

      {/* ── System footer ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-t border-[var(--sys-border)] pt-4"
      >
        <p className="text-[10px] text-[var(--sys-muted)] tracking-widest">
          LIFEOS ANALYTICS · DATA RANGE: 90 DAYS · AUTO-REFRESH: SESSION
        </p>
      </motion.div>
    </div>
  );
}
