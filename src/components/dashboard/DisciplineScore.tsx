"use client";

import { motion } from "framer-motion";
import { scoreLabel, scoreColor } from "@/lib/utils";

interface DisciplineScoreProps {
  score: number;
  streak: number;
}

export default function DisciplineScore({ score, streak }: DisciplineScoreProps) {
  const label = scoreLabel(score);
  const color = scoreColor(score);

  return (
    <div className="sys-card p-8 flex flex-col items-center">
      <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase mb-4">
        DISCIPLINE INDEX
      </p>

      {/* Score ring */}
      <div className="relative w-40 h-40 mb-4">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--sys-border)"
            strokeWidth="6"
          />
          {/* Progress */}
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{
              strokeDashoffset:
                2 * Math.PI * 52 * (1 - score / 100),
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-[10px] text-[var(--sys-muted)] tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {/* Status label */}
      <div
        className="px-3 py-1 rounded text-xs font-bold tracking-[0.25em] border mb-4"
        style={{
          color,
          borderColor: `${color}40`,
          background: `${color}10`,
        }}
      >
        {label}
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--sys-muted)] tracking-widest uppercase">
          STREAK
        </span>
        <span className="text-lg font-bold text-[var(--sys-cyan)]">
          {streak}
        </span>
        <span className="text-xs text-[var(--sys-muted)]">
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
    </div>
  );
}
