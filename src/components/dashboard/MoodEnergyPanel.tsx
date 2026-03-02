"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface MoodEnergyPanelProps {
  initialMood: number | null;
  initialEnergy: number | null;
  onUpdate: (field: "mood" | "energy", value: number) => Promise<void>;
}

export default function MoodEnergyPanel({
  initialMood,
  initialEnergy,
  onUpdate,
}: MoodEnergyPanelProps) {
  const [mood, setMood] = useState(initialMood ?? 5);
  const [energy, setEnergy] = useState(initialEnergy ?? 5);
  const [saving, setSaving] = useState<"mood" | "energy" | null>(null);
  const [, startTransition] = useTransition();

  async function handleCommit(field: "mood" | "energy", value: number) {
    setSaving(field);
    try {
      await onUpdate(field, value);
    } finally {
      startTransition(() => setSaving(null));
    }
  }

  return (
    <div className="sys-card p-5">
      <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase mb-4">
        SYSTEM VITALS
      </p>

      <div className="space-y-5">
        <VitalSlider
          label="MOOD"
          value={mood}
          onChange={setMood}
          onCommit={(v) => handleCommit("mood", v)}
          saving={saving === "mood"}
          color="var(--sys-cyan)"
          lowLabel="Depleted"
          highLabel="Optimal"
        />
        <VitalSlider
          label="ENERGY"
          value={energy}
          onChange={setEnergy}
          onCommit={(v) => handleCommit("energy", v)}
          saving={saving === "energy"}
          color="var(--sys-amber)"
          lowLabel="Drained"
          highLabel="Peak"
        />
      </div>
    </div>
  );
}

// ── Vital slider component ─────────────────────────────────────

interface VitalSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
  saving: boolean;
  color: string;
  lowLabel: string;
  highLabel: string;
}

function VitalSlider({
  label,
  value,
  onChange,
  onCommit,
  saving,
  color,
  lowLabel,
  highLabel,
}: VitalSliderProps) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color }}
          >
            {value}
          </span>
          <span className="text-[10px] text-[var(--sys-muted)]">/10</span>
          {saving && (
            <span className="text-[9px] text-[var(--sys-muted)] tracking-widest animate-pulse">
              SYNC...
            </span>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div className="relative py-2">
        <div className="h-1.5 rounded-full bg-[var(--sys-border)] relative">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseUp={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ margin: 0 }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-[var(--sys-muted)] tracking-wide">
          1 — {lowLabel}
        </span>
        <span className="text-[9px] text-[var(--sys-muted)] tracking-wide">
          {highLabel} — 10
        </span>
      </div>

      {/* Tick marks */}
      <div className="flex justify-between px-0 mt-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-px h-1.5 rounded-full transition-colors",
              i < value - 1
                ? "opacity-60"
                : i === value - 1
                ? "opacity-100"
                : "opacity-20 bg-[var(--sys-muted)]"
            )}
            style={i <= value - 1 ? { background: color } : {}}
          />
        ))}
      </div>
    </div>
  );
}
