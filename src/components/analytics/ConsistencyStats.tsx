"use client";

import { motion } from "framer-motion";
import { scoreColor } from "@/lib/utils";
import type { ConsistencyStats } from "@/lib/db/analytics.service";

interface ConsistencyStatsProps {
  stats: ConsistencyStats;
}

export default function ConsistencyStatsPanel({ stats }: ConsistencyStatsProps) {
  const rateColor = scoreColor(stats.thirtyDayRate);

  return (
    <div className="sys-card p-5 space-y-4">
      <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
        30-DAY CONSISTENCY
      </p>

      {/* Large rate display */}
      <div className="flex items-end gap-3">
        <motion.span
          className="text-5xl font-bold tabular-nums leading-none"
          style={{ color: rateColor }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {stats.thirtyDayRate.toFixed(1)}
        </motion.span>
        <span className="text-lg text-[var(--sys-muted)] mb-1">%</span>
      </div>

      <p className="text-[10px] text-[var(--sys-muted)] tracking-widest uppercase -mt-2">
        PROTOCOL COMPLETION RATE
      </p>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--sys-border)]">
        <StatItem
          label="PERFECT DAYS"
          value={stats.thirtyDayPerfectDays}
          suffix="/ 30"
          color="var(--sys-green)"
        />
        <StatItem
          label="LONGEST STREAK"
          value={stats.longestStreak}
          suffix={stats.longestStreak === 1 ? "day" : "days"}
          color="var(--sys-amber)"
        />
        <StatItem
          label="ACTIVE PROTOCOLS"
          value={stats.activeProtocolCount}
          suffix="/ 3"
          color="var(--sys-cyan)"
        />
        <StatItem
          label="LOGS RECORDED"
          value={stats.totalProtocols}
          suffix="entries"
          color="var(--sys-muted)"
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number;
  suffix: string;
  color: string;
}

function StatItem({ label, value, suffix, color }: StatItemProps) {
  return (
    <div>
      <p className="text-[9px] text-[var(--sys-muted)] tracking-[0.2em] uppercase mb-0.5">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-xl font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-[10px] text-[var(--sys-muted)]">{suffix}</span>
      </div>
    </div>
  );
}
