"use client";

// ── Demo-specific dashboard ─────────────────────────────────
// Identical layout to DashboardView but runs entirely on local
// state — no API calls. Protocol toggles, vitals, and excuses
// all work and update the score in real time.

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SerializableDailyLog } from "@/lib/db/dashboard.service";

import DisciplineScore from "@/components/dashboard/DisciplineScore";
import ProtocolCard from "@/components/dashboard/ProtocolCard";
import ExcuseModal from "@/components/dashboard/ExcuseModal";
import MoodEnergyPanel from "@/components/dashboard/MoodEnergyPanel";
import StreakBadge from "@/components/dashboard/StreakBadge";

type ExcuseCategory = "TIRED" | "BUSY" | "PROCRASTINATED" | "LOW_MOOD" | "OTHER";

interface DemoDashboardViewProps {
  initialLog: SerializableDailyLog;
  initialScore: number;
  currentStreak: number;
  username: string;
}

interface ExcuseTarget {
  protocolLogId: string;
  protocolName: string;
}

// Score per number of completed protocols (0 / 1 / 2 / 3).
// Reflects how the real engine weights daily completion against history.
const DEMO_SCORES = [58.3, 66.7, 74.2, 87.5];

export default function DemoDashboardView({
  initialLog,
  initialScore,
  currentStreak,
  username,
}: DemoDashboardViewProps) {
  const [dailyLog, setDailyLog]         = useState(initialLog);
  const [loadingProtocol, setLoading]   = useState<string | null>(null);
  const [excuseTarget, setExcuseTarget] = useState<ExcuseTarget | null>(null);
  const [celebratingAll, setCelebrating] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Derived values
  const completedCount = dailyLog.protocolLogs.filter((p) => p.completed).length;
  const totalCount     = dailyLog.protocolLogs.length;
  const allComplete    = completedCount === totalCount && totalCount > 0;

  const disciplineScore = useMemo(
    () => DEMO_SCORES[completedCount] ?? initialScore,
    [completedCount, initialScore]
  );

  // ── Protocol toggle (local, instant, no API) ──────────────

  async function handleToggle(id: string, completed: boolean) {
    setLoading(id);
    // Simulate brief loading — makes it feel like the real thing
    await new Promise((r) => setTimeout(r, 220));

    setDailyLog((prev) => {
      const logs = prev.protocolLogs.map((pl) =>
        pl.id === id
          ? {
              ...pl,
              completed,
              completedAt: completed ? new Date().toISOString() : null,
              excuse:      completed ? null : pl.excuse,
            }
          : pl
      );

      // Trigger celebration when all done
      const nowComplete = logs.filter((l) => l.completed).length;
      if (nowComplete === logs.length) {
        setTimeout(() => setCelebrating(true), 100);
        setTimeout(() => setCelebrating(false), 2400);
      }

      return { ...prev, protocolLogs: logs };
    });

    setLoading(null);
  }

  // ── Excuse (local, no API) ────────────────────────────────

  async function handleExcuseSubmit(
    id: string,
    category: ExcuseCategory,
    note?: string
  ) {
    setDailyLog((prev) => ({
      ...prev,
      protocolLogs: prev.protocolLogs.map((pl) =>
        pl.id === id
          ? { ...pl, excuse: { category, note: note ?? null } }
          : pl
      ),
    }));
  }

  // ── Vitals (local, no API) ────────────────────────────────

  async function handleVital(field: "mood" | "energy", value: number) {
    setDailyLog((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* ── Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-[10px] tracking-[0.35em] text-[var(--sys-muted)] uppercase">
              SYSTEM STATUS · {formatDate(today).toUpperCase()}
            </p>
            <h1 className="text-2xl font-bold tracking-wider mt-1">
              OPERATOR{" "}
              <span className="text-[var(--sys-cyan)]">{username.toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div
              className={
                allComplete
                  ? "w-2 h-2 rounded-full bg-[var(--sys-green)] shadow-[0_0_8px_var(--sys-green)] animate-pulse"
                  : "w-2 h-2 rounded-full bg-[var(--sys-amber)]"
              }
            />
            <span className="text-xs text-[var(--sys-muted)] tracking-widest uppercase">
              {allComplete
                ? "ALL PROTOCOLS COMPLETE"
                : `${completedCount}/${totalCount} COMPLETE`}
            </span>
          </div>
        </motion.div>

        {/* ── Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            {/* Score ring — updates live as protocols are toggled */}
            <motion.div
              key={disciplineScore}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <DisciplineScore score={disciplineScore} streak={currentStreak} />
            </motion.div>
            <StreakBadge streak={currentStreak} />
          </motion.div>

          {/* Column 2–3 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="sys-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
                  ACTIVE PROTOCOLS
                </p>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalCount }, (_, i) => (
                    <div
                      key={i}
                      className="w-5 h-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          i < completedCount
                            ? "var(--sys-green)"
                            : "var(--sys-border)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {dailyLog.protocolLogs.map((pl) => (
                  <ProtocolCard
                    key={pl.id}
                    protocolLogId={pl.id}
                    name={pl.protocol.name}
                    description={pl.protocol.description}
                    order={pl.protocol.order}
                    completed={pl.completed}
                    excuse={pl.excuse}
                    onToggle={handleToggle}
                    onExcuse={(id, name) =>
                      setExcuseTarget({ protocolLogId: id, protocolName: name })
                    }
                    loading={loadingProtocol === pl.id}
                  />
                ))}
              </div>
            </div>

            <MoodEnergyPanel
              initialMood={dailyLog?.mood ?? null}
              initialEnergy={dailyLog?.energy ?? null}
              onUpdate={handleVital}
            />
          </motion.div>
        </div>

        {/* ── All-complete celebration ───────────────────── */}
        {celebratingAll && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--sys-green)]/30 bg-[var(--sys-green)]/5"
          >
            <Sparkles size={15} className="text-[var(--sys-green)] flex-shrink-0" />
            <p className="text-xs text-[var(--sys-green)] tracking-widest uppercase">
              OUTSTANDING — ALL PROTOCOLS EXECUTED. DISCIPLINE INDEX RECALCULATED.
            </p>
          </motion.div>
        )}

        {/* ── Footer ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-[var(--sys-border)] pt-4 flex items-center justify-between"
        >
          <p className="text-[10px] text-[var(--sys-muted)] tracking-widest">
            LIFEOS DEMO · INTERACTIONS ARE LOCAL · DATA RESETS ON RELOAD
          </p>
          <p className="text-[10px] text-[var(--sys-muted)]/50 tracking-wider">
            Try checking a protocol →
          </p>
        </motion.div>
      </div>

      <ExcuseModal
        protocolName={excuseTarget?.protocolName ?? ""}
        protocolLogId={excuseTarget?.protocolLogId ?? ""}
        open={excuseTarget !== null}
        onClose={() => setExcuseTarget(null)}
        onSubmit={handleExcuseSubmit}
      />
    </>
  );
}
