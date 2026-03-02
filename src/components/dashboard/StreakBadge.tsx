"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export default function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        isActive
          ? "border-[var(--sys-amber)]/30 bg-[var(--sys-amber)]/5"
          : "border-[var(--sys-border)]",
        className
      )}
    >
      <Flame
        size={16}
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-[var(--sys-amber)]" : "text-[var(--sys-muted)]"
        )}
      />
      <div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={streak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-xl font-bold tabular-nums leading-none",
              isActive ? "text-[var(--sys-amber)]" : "text-[var(--sys-muted)]"
            )}
          >
            {streak}
          </motion.span>
          <span className="text-xs text-[var(--sys-muted)]">
            {streak === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="text-[9px] tracking-[0.2em] text-[var(--sys-muted)] uppercase mt-0.5">
          {isActive ? "CURRENT STREAK" : "NO STREAK"}
        </p>
      </div>
    </div>
  );
}
