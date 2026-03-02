"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import type { SerializableDailyLog } from "@/lib/db/dashboard.service";

import DisciplineScore from "./DisciplineScore";
import ProtocolCard from "./ProtocolCard";
import ExcuseModal from "./ExcuseModal";
import MoodEnergyPanel from "./MoodEnergyPanel";
import StreakBadge from "./StreakBadge";

type ExcuseCategory = "TIRED" | "BUSY" | "PROCRASTINATED" | "LOW_MOOD" | "OTHER";

interface DashboardViewProps {
  initialLog: SerializableDailyLog;
  disciplineScore: number;
  currentStreak: number;
  username: string;
}

interface ExcuseTarget {
  protocolLogId: string;
  protocolName: string;
}

export default function DashboardView({
  initialLog,
  disciplineScore: initScore,
  currentStreak: initStreak,
  username,
}: DashboardViewProps) {
  const {
    dailyLog,
    disciplineScore,
    currentStreak,
    toggleProtocol,
    logExcuse,
    updateVital,
    loadingProtocol,
  } = useDashboard(initialLog, initScore, initStreak);

  const [excuseTarget, setExcuseTarget] = useState<ExcuseTarget | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const completedCount = dailyLog?.protocolLogs.filter((p) => p.completed).length ?? 0;
  const totalCount = dailyLog?.protocolLogs.length ?? 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  async function handleExcuseSubmit(
    protocolLogId: string,
    category: ExcuseCategory,
    note?: string
  ) {
    await logExcuse(protocolLogId, category, note);
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

          {/* Completion pulse indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className={
                allComplete
                  ? "w-2 h-2 rounded-full bg-[var(--sys-green)] shadow-[0_0_8px_var(--sys-green)] animate-pulse"
                  : "w-2 h-2 rounded-full bg-[var(--sys-amber)]"
              }
            />
            <span className="text-xs text-[var(--sys-muted)] tracking-widest uppercase">
              {allComplete ? "ALL PROTOCOLS COMPLETE" : `${completedCount}/${totalCount} COMPLETE`}
            </span>
          </div>
        </motion.div>

        {/* ── Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1: Score + Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            <DisciplineScore score={disciplineScore} streak={currentStreak} />
            <StreakBadge streak={currentStreak} />
          </motion.div>

          {/* Column 2–3: Protocols */}
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
                      className="w-5 h-1 rounded-full transition-all"
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
                {dailyLog?.protocolLogs.map((pl) => (
                  <ProtocolCard
                    key={pl.id}
                    protocolLogId={pl.id}
                    name={pl.protocol.name}
                    description={pl.protocol.description}
                    order={pl.protocol.order}
                    completed={pl.completed}
                    excuse={pl.excuse}
                    onToggle={toggleProtocol}
                    onExcuse={(id, name) =>
                      setExcuseTarget({ protocolLogId: id, protocolName: name })
                    }
                    loading={loadingProtocol === pl.id}
                  />
                ))}

                {(!dailyLog?.protocolLogs || dailyLog.protocolLogs.length === 0) && (
                  <p className="text-xs text-[var(--sys-muted)] text-center py-4 tracking-wide">
                    No active protocols. Configure them in Settings.
                  </p>
                )}
              </div>
            </div>

            {/* Mood + Energy */}
            <MoodEnergyPanel
              initialMood={dailyLog?.mood ?? null}
              initialEnergy={dailyLog?.energy ?? null}
              onUpdate={updateVital}
            />
          </motion.div>
        </div>

        {/* ── System log footer ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-[var(--sys-border)] pt-4"
        >
          <p className="text-[10px] text-[var(--sys-muted)] tracking-widest">
            LIFEOS · SESSION ACTIVE · DATA SYNCED TO LOCAL INSTANCE
          </p>
        </motion.div>
      </div>

      {/* ── Excuse Modal ─────────────────────────────────── */}
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
