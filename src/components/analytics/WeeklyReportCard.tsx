"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { cn, scoreColor, scoreLabel } from "@/lib/utils";
import type { SerializableWeeklyReport } from "@/lib/db/analytics.service";

interface WeeklyReportCardProps {
  report: SerializableWeeklyReport;
  onRegenerate: () => Promise<void>;
}

const EXCUSE_LABELS: Record<string, string> = {
  TIRED:          "Fatigue",
  BUSY:           "Time Conflict",
  PROCRASTINATED: "Procrastination",
  LOW_MOOD:       "Low Mood",
  OTHER:          "Other",
};

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function WeeklyReportCard({
  report,
  onRegenerate,
}: WeeklyReportCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const color = scoreColor(report.disciplineScore);
  const label = scoreLabel(report.disciplineScore);

  const excuseEntries = Object.entries(report.excuseBreakdown).filter(
    ([, count]) => (count as number) > 0
  ) as [string, number][];

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div
      className="sys-card border overflow-hidden"
      style={{ borderColor: `${color}25` }}
    >
      {/* ── Header bar ─────────────────────────────────────── */}
      <div
        className="px-5 py-3 flex items-center justify-between border-b"
        style={{
          borderColor: `${color}20`,
          background: `${color}06`,
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} style={{ color }} />
          <p
            className="text-[10px] tracking-[0.3em] uppercase font-bold"
            style={{ color }}
          >
            SYSTEM DIAGNOSTIC COMPLETE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-[var(--sys-muted)] hover:text-[var(--sys-text)] transition-colors"
            title="Regenerate report"
          >
            <RefreshCw
              size={13}
              className={regenerating ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-[var(--sys-muted)] hover:text-[var(--sys-text)] transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5 space-y-5">
              {/* Week range + score */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] text-[var(--sys-muted)] tracking-widest uppercase">
                    DIAGNOSTIC PERIOD
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {formatWeekRange(report.weekStart, report.weekEnd)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color }}
                  >
                    {report.disciplineScore.toFixed(1)}
                  </p>
                  <p
                    className="text-[9px] tracking-[0.2em] uppercase font-bold"
                    style={{ color }}
                  >
                    {label}
                  </p>
                </div>
              </div>

              {/* Key metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric
                  label="COMPLETION"
                  value={`${report.completionPercent.toFixed(1)}%`}
                  highlight={report.completionPercent >= 75}
                />
                <Metric
                  label="WEAKEST DAY"
                  value={report.weakestDay ?? "N/A"}
                  danger={!!report.weakestDay}
                />
                <Metric
                  label="MOST SKIPPED"
                  value={report.mostSkippedProtocol ?? "None"}
                  danger={!!report.mostSkippedProtocol}
                  truncate
                />
                <Metric
                  label="EXCUSE COUNT"
                  value={
                    excuseEntries.length > 0
                      ? String(excuseEntries.reduce((s, [, c]) => s + c, 0))
                      : "0"
                  }
                  danger={excuseEntries.length > 0}
                />
              </div>

              {/* Excuse breakdown inline */}
              {excuseEntries.length > 0 && (
                <div>
                  <p className="text-[9px] text-[var(--sys-muted)] tracking-[0.2em] uppercase mb-2">
                    INTERFERENCE LOG
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {excuseEntries.map(([cat, count]) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded text-[10px] border border-[var(--sys-red)]/20 bg-[var(--sys-red)]/5 text-[var(--sys-red)]"
                      >
                        {EXCUSE_LABELS[cat] ?? cat}: {count}×
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* System suggestions */}
              {report.suggestions.length > 0 && (
                <div className="border-t border-[var(--sys-border)] pt-4">
                  <p className="text-[9px] text-[var(--sys-cyan)] tracking-[0.2em] uppercase mb-3">
                    SYSTEM RECOMMENDATIONS
                  </p>
                  <div className="space-y-2">
                    {report.suggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-3"
                      >
                        <span className="text-[var(--sys-cyan)] text-[10px] mt-0.5 flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <p className="text-xs text-[var(--sys-muted)] leading-relaxed">
                          {s}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <p className="text-[9px] text-[var(--sys-muted)]/50 tracking-widest pt-1 border-t border-[var(--sys-border)]">
                GENERATED:{" "}
                {new Date(report.generatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
  truncate?: boolean;
}

function Metric({ label, value, highlight, danger, truncate }: MetricProps) {
  return (
    <div className="bg-[var(--sys-bg)] rounded-md border border-[var(--sys-border)] p-3">
      <p className="text-[9px] text-[var(--sys-muted)] tracking-[0.15em] uppercase mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold",
          truncate && "truncate",
          highlight
            ? "text-[var(--sys-green)]"
            : danger
            ? "text-[var(--sys-red)]"
            : "text-[var(--sys-text)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}
