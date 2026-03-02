"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ExcuseCategory = "TIRED" | "BUSY" | "PROCRASTINATED" | "LOW_MOOD" | "OTHER";

const EXCUSE_LABELS: Record<ExcuseCategory, string> = {
  TIRED: "Low Energy",
  BUSY: "Too Busy",
  PROCRASTINATED: "Procrastination",
  LOW_MOOD: "Low Mood",
  OTHER: "Other",
};

interface ProtocolCardProps {
  protocolLogId: string;
  name: string;
  description: string | null;
  order: number;
  completed: boolean;
  excuse: { category: string; note: string | null } | null;
  onToggle: (protocolLogId: string, completed: boolean) => Promise<void>;
  onExcuse: (protocolLogId: string, protocolName: string) => void;
  loading?: boolean;
}

export default function ProtocolCard({
  protocolLogId,
  name,
  description,
  order,
  completed,
  excuse,
  onToggle,
  onExcuse,
  loading = false,
}: ProtocolCardProps) {
  const excuseCategory = excuse?.category as ExcuseCategory | undefined;

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-lg border p-4 transition-colors",
        "flex items-start gap-4",
        completed
          ? "border-[var(--sys-green)]/25 bg-[var(--sys-green)]/5"
          : excuse
          ? "border-[var(--sys-red)]/20 bg-[var(--sys-red)]/3"
          : "border-[var(--sys-border)] bg-[var(--sys-surface)]"
      )}
    >
      {/* Completion toggle */}
      <button
        onClick={() => onToggle(protocolLogId, !completed)}
        disabled={loading}
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all mt-0.5",
          "disabled:cursor-not-allowed",
          completed
            ? "border-[var(--sys-green)] bg-[var(--sys-green)] shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            : "border-[var(--sys-border)] hover:border-[var(--sys-cyan)] bg-transparent"
        )}
      >
        {completed && <Check size={14} className="text-[var(--sys-bg)]" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[9px] font-bold tracking-[0.2em] text-[var(--sys-muted)]"
            )}
          >
            P{String(order + 1).padStart(2, "0")}
          </span>
          <h3
            className={cn(
              "text-sm font-medium tracking-wide transition-colors truncate",
              completed
                ? "text-[var(--sys-green)] line-through decoration-[var(--sys-green)]/40"
                : "text-[var(--sys-text)]"
            )}
          >
            {name}
          </h3>
        </div>

        {description && (
          <p className="text-[11px] text-[var(--sys-muted)] mt-0.5 truncate">
            {description}
          </p>
        )}

        {completed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-[var(--sys-green)] mt-1 tracking-widest uppercase"
          >
            ✓ Protocol Executed Successfully
          </motion.p>
        )}

        {!completed && excuse && excuseCategory && (
          <p className="text-[10px] text-[var(--sys-red)]/70 mt-1 tracking-wide">
            Logged: {EXCUSE_LABELS[excuseCategory]}
            {excuse.note ? ` — ${excuse.note}` : ""}
          </p>
        )}
      </div>

      {/* Excuse button — shown when not completed */}
      {!completed && !loading && (
        <button
          onClick={() => onExcuse(protocolLogId, name)}
          className={cn(
            "flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] tracking-widest uppercase transition-colors",
            excuse
              ? "text-[var(--sys-red)]/60 hover:text-[var(--sys-red)]"
              : "text-[var(--sys-muted)] hover:text-[var(--sys-amber)]"
          )}
          title="Log excuse"
        >
          <AlertCircle size={11} />
          {excuse ? "EDIT" : "EXCUSE"}
        </button>
      )}
    </motion.div>
  );
}
