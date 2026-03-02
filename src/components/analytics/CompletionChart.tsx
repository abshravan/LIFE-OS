"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { SevenDayPoint } from "@/lib/db/analytics.service";

interface CompletionChartProps {
  data: SevenDayPoint[];
}

function barColor(rate: number, total: number): string {
  if (total === 0) return "#1F2937";   // no protocols
  if (rate === 100) return "#10B981";   // full completion — green
  if (rate >= 50)   return "#06B6D4";   // partial — cyan
  if (rate > 0)     return "#F59E0B";   // low — amber
  return "#EF4444";                      // zero — red
}

// Custom tooltip styled to match system aesthetic
function SystemTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: SevenDayPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1F2937",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "inherit",
      }}
    >
      <p style={{ color: "#6B7280", letterSpacing: "0.1em", marginBottom: 4 }}>
        {d.shortDate.toUpperCase()}
      </p>
      <p style={{ color: "#E2E8F0", fontWeight: 600 }}>
        {d.completedCount}/{d.totalCount} PROTOCOLS
      </p>
      <p
        style={{
          color: barColor(d.completionRate, d.totalCount),
          marginTop: 2,
        }}
      >
        {d.totalCount > 0 ? `${d.completionRate}% COMPLETE` : "NO PROTOCOLS"}
      </p>
    </div>
  );
}

export default function CompletionChart({ data }: CompletionChartProps) {
  return (
    <div className="sys-card p-5">
      <div className="mb-4">
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          7-DAY PROTOCOL EXECUTION
        </p>
        <p className="text-xs text-[var(--sys-muted)] mt-0.5">
          Daily completion rate — last 7 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#1F2937"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "inherit", letterSpacing: 2 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            content={<SystemTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="completionRate" radius={[3, 3, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={barColor(entry.completionRate, entry.totalCount)}
                opacity={entry.totalCount === 0 ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--sys-border)]">
        {[
          { color: "#10B981", label: "100%" },
          { color: "#06B6D4", label: "50–99%" },
          { color: "#F59E0B", label: "1–49%" },
          { color: "#EF4444", label: "0%" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="text-[9px] text-[var(--sys-muted)] tracking-widest">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
