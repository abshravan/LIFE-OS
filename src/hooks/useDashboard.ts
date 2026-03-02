"use client";

import { useState, useCallback } from "react";
import type {
  SerializableDailyLog,
  SerializableProtocolLog,
} from "@/lib/db/dashboard.service";

type ExcuseCategory = "TIRED" | "BUSY" | "PROCRASTINATED" | "LOW_MOOD" | "OTHER";

interface UseDashboardReturn {
  dailyLog: SerializableDailyLog;
  disciplineScore: number;
  currentStreak: number;
  toggleProtocol: (protocolLogId: string, completed: boolean) => Promise<void>;
  logExcuse: (
    protocolLogId: string,
    category: ExcuseCategory,
    note?: string
  ) => Promise<void>;
  updateVital: (field: "mood" | "energy", value: number) => Promise<void>;
  loadingProtocol: string | null;
}

export function useDashboard(
  initialLog: SerializableDailyLog,
  initialScore: number,
  initialStreak: number
): UseDashboardReturn {
  const [dailyLog, setDailyLog] = useState<SerializableDailyLog>(initialLog);
  const [disciplineScore, setDisciplineScore] = useState(initialScore);
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [loadingProtocol, setLoadingProtocol] = useState<string | null>(null);

  // ── Toggle protocol completion ─────────────────────────────

  const toggleProtocol = useCallback(
    async (protocolLogId: string, completed: boolean) => {
      setLoadingProtocol(protocolLogId);

      // Optimistic update
      setDailyLog((prev) => ({
        ...prev,
        protocolLogs: prev.protocolLogs.map(
          (pl): SerializableProtocolLog =>
            pl.id === protocolLogId
              ? {
                  ...pl,
                  completed,
                  completedAt: completed ? new Date().toISOString() : null,
                  excuse: completed ? null : pl.excuse,
                }
              : pl
        ),
      }));

      try {
        const res = await fetch("/api/daily-logs/complete", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ protocolLogId, completed }),
        });

        if (!res.ok) throw new Error("Failed to update");

        // Refresh discipline score from server
        await refreshScore(setDisciplineScore);
      } catch {
        // Revert optimistic update on failure
        setDailyLog((prev) => ({
          ...prev,
          protocolLogs: prev.protocolLogs.map(
            (pl): SerializableProtocolLog =>
              pl.id === protocolLogId ? { ...pl, completed: !completed } : pl
          ),
        }));
      } finally {
        setLoadingProtocol(null);
      }
    },
    []
  );

  // ── Log excuse ─────────────────────────────────────────────

  const logExcuse = useCallback(
    async (protocolLogId: string, category: ExcuseCategory, note?: string) => {
      const res = await fetch("/api/excuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolLogId, category, note }),
      });

      if (!res.ok) throw new Error("Failed to log excuse");

      setDailyLog((prev) => ({
        ...prev,
        protocolLogs: prev.protocolLogs.map(
          (pl): SerializableProtocolLog =>
            pl.id === protocolLogId
              ? { ...pl, excuse: { category, note: note ?? null } }
              : pl
        ),
      }));
    },
    []
  );

  // ── Update vitals (mood / energy) ─────────────────────────

  const updateVital = useCallback(
    async (field: "mood" | "energy", value: number) => {
      const today = new Date().toISOString().split("T")[0];

      const res = await fetch("/api/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update vital");

      setDailyLog((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return {
    dailyLog,
    disciplineScore,
    currentStreak,
    toggleProtocol,
    logExcuse,
    updateVital,
    loadingProtocol,
  };
}

// ── Score refresh helper ───────────────────────────────────────

async function refreshScore(
  setScore: (score: number) => void
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/daily-logs?date=${today}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.data?.disciplineScore != null) {
      setScore(data.data.disciplineScore);
    }
  } catch {
    // Non-critical — score display will be stale but functional
  }
}
