"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HeatmapCell } from "@/lib/db/analytics.service";

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellColor(cell: HeatmapCell): string {
  if (cell.isFuture || cell.totalCount === 0) return "var(--sys-border)";
  if (cell.completionRate === -1) return "var(--sys-border)";
  if (cell.completionRate === 100) return "#10B981";  // green
  if (cell.completionRate >= 50)  return "#0891B2";   // cyan-600
  if (cell.completionRate > 0)    return "#B45309";   // amber-700
  return "#991B1B";                                    // red-800 (all missed)
}

function cellOpacity(cell: HeatmapCell): number {
  if (cell.isFuture || cell.totalCount === 0) return 0.3;
  if (cell.completionRate === 100) return 1;
  if (cell.completionRate >= 50) return 0.75;
  if (cell.completionRate > 0) return 0.6;
  return 0.5;
}

function formatCellDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  // Organise cells into week columns (Mon=0 … Sun=6)
  // cells are sorted Mon–Sun oldest to newest
  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  for (const cell of cells) {
    const dow = new Date(cell.date + "T00:00:00").getDay(); // 0=Sun
    const moIndex = dow === 0 ? 6 : dow - 1;               // 0=Mon

    if (moIndex === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Month labels: show when first day of month appears in a week
  const monthLabels: Map<number, string> = new Map();
  weeks.forEach((week, wi) => {
    for (const cell of week) {
      const d = new Date(cell.date + "T00:00:00");
      if (d.getDate() === 1) {
        monthLabels.set(wi, d.toLocaleDateString("en-US", { month: "short" }));
        break;
      }
    }
  });

  const CELL_SIZE = 13;
  const CELL_GAP = 3;
  const STEP = CELL_SIZE + CELL_GAP;

  return (
    <div className="sys-card p-5">
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          ACTIVITY MATRIX — 13 WEEKS
        </p>
        <p className="text-xs text-[var(--sys-muted)] mt-0.5">
          Daily protocol execution density
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-0 relative" style={{ minWidth: "fit-content" }}>
          {/* Day labels column */}
          <div
            className="flex flex-col justify-between mr-2 flex-shrink-0"
            style={{ paddingTop: 20, gap: CELL_GAP }}
          >
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className="text-[9px] text-[var(--sys-muted)] tracking-wider leading-none flex items-center"
                style={{ height: CELL_SIZE, opacity: i % 2 === 0 ? 1 : 0 }}
              >
                {d.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex mb-1" style={{ gap: CELL_GAP }}>
              {weeks.map((_, wi) => (
                <div
                  key={wi}
                  className="text-[9px] text-[var(--sys-muted)] tracking-wider"
                  style={{ width: CELL_SIZE, flexShrink: 0 }}
                >
                  {monthLabels.get(wi) ?? ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                  {/* Fill missing days at start of first week */}
                  {wi === 0 &&
                    Array.from({
                      length: 7 - week.length,
                    }).map((_, i) => (
                      <div
                        key={`pad-${i}`}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    ))}
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      className={cn(
                        "rounded-sm cursor-default transition-transform hover:scale-125",
                        cell.isFuture && "cursor-not-allowed"
                      )}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        background: cellColor(cell),
                        opacity: cellOpacity(cell),
                        flexShrink: 0,
                        boxShadow:
                          cell.completionRate === 100
                            ? "0 0 4px rgba(16,185,129,0.5)"
                            : "none",
                      }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ cell, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--sys-border)]">
        <span className="text-[9px] text-[var(--sys-muted)] tracking-widest uppercase">
          LESS
        </span>
        {[
          { color: "var(--sys-border)", label: "No data" },
          { color: "#991B1B", label: "0%" },
          { color: "#B45309", label: "1–49%" },
          { color: "#0891B2", label: "50–99%" },
          { color: "#10B981", label: "100%" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1" title={item.label}>
            <div
              className="rounded-sm"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: item.color,
                flexShrink: 0,
              }}
            />
          </div>
        ))}
        <span className="text-[9px] text-[var(--sys-muted)] tracking-widest uppercase">
          MORE
        </span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 16, top: tooltip.y - 8 }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid #1F2937",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 11,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            <p style={{ color: "#6B7280", letterSpacing: "0.1em", marginBottom: 4 }}>
              {formatCellDate(tooltip.cell.date).toUpperCase()}
            </p>
            {tooltip.cell.isFuture ? (
              <p style={{ color: "#6B7280" }}>FUTURE DATE</p>
            ) : tooltip.cell.totalCount === 0 ? (
              <p style={{ color: "#6B7280" }}>NO PROTOCOLS LOGGED</p>
            ) : (
              <>
                <p style={{ color: "#E2E8F0" }}>
                  {tooltip.cell.completedCount}/{tooltip.cell.totalCount} COMPLETED
                </p>
                <p
                  style={{
                    color: cellColor(tooltip.cell),
                    marginTop: 2,
                  }}
                >
                  {tooltip.cell.completionRate}% EXECUTION RATE
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
