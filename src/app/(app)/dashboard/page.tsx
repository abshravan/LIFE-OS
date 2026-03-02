import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          SYSTEM STATUS
        </p>
        <h1 className="text-2xl font-bold tracking-wider mt-1">Dashboard</h1>
      </div>
      {/* Phase 2: DashboardView component will be added here */}
      <div className="sys-card p-8 text-center text-[var(--sys-muted)]">
        <p className="text-sm tracking-widest">DASHBOARD MODULE</p>
        <p className="text-xs mt-2">Phase 2 — Initializing...</p>
      </div>
    </div>
  );
}
