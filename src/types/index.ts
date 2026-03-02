// ============================================================
// LifeOS — Shared TypeScript Types
// ============================================================

import type { ExcuseCategory } from "@prisma/client";

// ── Auth ────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ── Identity ─────────────────────────────────────────────────

export interface IdentityInput {
  targetSelf: string;
  motivation: string;
}

// ── Protocols ────────────────────────────────────────────────

export interface ProtocolInput {
  name: string;
  description?: string;
  order: number;
}

export interface Protocol {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

// ── Daily Tracking ───────────────────────────────────────────

export interface DailyLogInput {
  date: string; // "YYYY-MM-DD"
  mood?: number; // 1–10
  energy?: number; // 1–10
  notes?: string;
}

export interface ProtocolCompletion {
  protocolId: string;
  completed: boolean;
}

export interface ExcuseInput {
  protocolLogId: string;
  category: ExcuseCategory;
  note?: string;
}

// ── Analytics ────────────────────────────────────────────────

export interface DayCompletionData {
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface ExcuseBreakdown {
  TIRED: number;
  BUSY: number;
  PROCRASTINATED: number;
  LOW_MOOD: number;
  OTHER: number;
}

// ── Dashboard ────────────────────────────────────────────────

export interface DashboardData {
  disciplineScore: number;
  currentStreak: number;
  todayLog: {
    mood: number | null;
    energy: number | null;
    protocolLogs: Array<{
      id: string;
      protocolId: string;
      protocolName: string;
      completed: boolean;
      excuse: { category: ExcuseCategory; note: string | null } | null;
    }>;
  } | null;
}

// ── Weekly Report ────────────────────────────────────────────

export interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  completionPercent: number;
  weakestDay: string | null;
  mostSkippedProtocol: string | null;
  excuseBreakdown: ExcuseBreakdown;
  suggestions: string[];
  disciplineScore: number;
}

// ── API Responses ────────────────────────────────────────────

export interface ApiSuccess<T = void> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = void> = ApiSuccess<T> | ApiError;
