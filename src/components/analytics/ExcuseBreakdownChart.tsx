"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { LabelProps } from "recharts";
import type { ExcuseStat } from "@/lib/db/analytics.service";

interface ExcuseBreakdownChartProps {
  data: ExcuseStat[];
}

const CATEGORY_COLORS: Record<string, string> = {
  PROCRASTINATED: "#EF4444",
  BUSY:           "#F59E0B",
  TIRED:          "#06B6D4",
  LOW_MOOD:       "#8B5CF6",
  OTHER:          "#6B7280",
};

function ExcuseTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ExcuseStat }>;
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
        {d.label.toUpperCase()}
      </p>
      <p style={{ color: "#E2E8F0" }}>
        {d.count} {d.count === 1 ? "INCIDENT" : "INCIDENTS"}
      </p>
      <p style={{ color: CATEGORY_COLORS[d.category] ?? "#6B7280", marginTop: 2 }}>
        {d.percentage}% OF ALL EXCUSES
      </p>
    </div>
  );
}

export default function ExcuseBreakdownChart({ data }: ExcuseBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="sys-card p-5">
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase mb-4">
          EXCUSE PATTERN ANALYSIS
        </p>
        <div className="flex items-center justify-center h-32 text-center">
          <div>
            <p className="text-sm text-[var(--sys-green)] tracking-widest">
              NO EXCUSES LOGGED
            </p>
            <p className="text-xs text-[var(--sys-muted)] mt-1">
              All protocols executed without interference.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-card p-5">
      <div className="mb-4">
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          EXCUSE PATTERN ANALYSIS
        </p>
        <p className="text-xs text-[var(--sys-muted)] mt-0.5">
          Interference types — last 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          barCategoryGap="25%"
        >
          <XAxis
            type="number"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ExcuseTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} label={PercentLabel}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] ?? "#6B7280"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Dominant pattern callout */}
      {data[0] && (
        <div className="mt-4 pt-3 border-t border-[var(--sys-border)]">
          <p className="text-[10px] tracking-widest text-[var(--sys-muted)] uppercase">
            DOMINANT PATTERN
          </p>
          <p className="text-sm mt-0.5" style={{ color: CATEGORY_COLORS[data[0].category] }}>
            {data[0].label}{" "}
            <span className="text-[var(--sys-muted)] text-xs">
              ({data[0].percentage}% of missed protocols)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// Custom label that shows percentage next to bar
function PercentLabel(props: LabelProps) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const value = Number(props.value ?? 0);
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      fontSize={10}
      fill="#6B7280"
      fontFamily="inherit"
    >
      {value}×
    </text>
  );
}
