"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ExcuseCategory = "TIRED" | "BUSY" | "PROCRASTINATED" | "LOW_MOOD" | "OTHER";

interface ExcuseModalProps {
  protocolName: string;
  protocolLogId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (protocolLogId: string, category: ExcuseCategory, note?: string) => Promise<void>;
}

const EXCUSE_OPTIONS: { value: ExcuseCategory; label: string; impact: string }[] = [
  { value: "TIRED",         label: "Low Energy / Tired",    impact: "-2" },
  { value: "BUSY",          label: "Too Busy",              impact: "-3" },
  { value: "PROCRASTINATED",label: "Procrastination",       impact: "-4" },
  { value: "LOW_MOOD",      label: "Low Mood",              impact: "-2" },
  { value: "OTHER",         label: "Other",                 impact: "-1" },
];

export default function ExcuseModal({
  protocolName,
  protocolLogId,
  open,
  onClose,
  onSubmit,
}: ExcuseModalProps) {
  const [selected, setSelected] = useState<ExcuseCategory | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    try {
      await onSubmit(protocolLogId, selected, note.trim() || undefined);
      setSelected(null);
      setNote("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelected(null);
    setNote("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <div className="sys-card w-full max-w-md p-6 border border-[var(--sys-red)]/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] text-[var(--sys-red)] uppercase">
                    INTEGRITY BREACH DETECTED
                  </p>
                  <h3 className="text-base font-bold mt-1 tracking-wide">
                    {protocolName}
                  </h3>
                  <p className="text-xs text-[var(--sys-muted)] mt-0.5">
                    Log the interference pattern to improve future execution.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-[var(--sys-muted)] hover:text-[var(--sys-text)] transition-colors ml-4 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Excuse options */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase mb-2">
                  SELECT INTERFERENCE TYPE
                </p>
                {EXCUSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all border",
                      "text-left",
                      selected === opt.value
                        ? "border-[var(--sys-red)]/50 bg-[var(--sys-red)]/8 text-[var(--sys-text)]"
                        : "border-[var(--sys-border)] text-[var(--sys-muted)] hover:border-[var(--sys-border)] hover:text-[var(--sys-text)]"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold tracking-wider",
                        selected === opt.value
                          ? "text-[var(--sys-red)]"
                          : "text-[var(--sys-muted)]"
                      )}
                    >
                      INTEGRITY IMPACT: {opt.impact}
                    </span>
                  </button>
                ))}
              </div>

              {/* Optional note */}
              <div className="mb-5">
                <label className="block text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase mb-1.5">
                  ADDITIONAL CONTEXT (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What exactly happened?"
                  maxLength={200}
                  className={cn(
                    "w-full bg-[var(--sys-bg)] border border-[var(--sys-border)] rounded px-3 py-2 text-sm",
                    "text-[var(--sys-text)] placeholder:text-[var(--sys-muted)]",
                    "outline-none focus:border-[var(--sys-muted)] transition-colors"
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 rounded-md text-xs tracking-widest uppercase border border-[var(--sys-border)] text-[var(--sys-muted)] hover:text-[var(--sys-text)] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selected || loading}
                  className={cn(
                    "flex-1 py-2 rounded-md text-xs tracking-widest uppercase font-medium transition-all",
                    "bg-[var(--sys-red)]/10 border border-[var(--sys-red)]/40 text-[var(--sys-red)]",
                    "hover:bg-[var(--sys-red)]/15 disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? "LOGGING..." : "LOG BREACH"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
