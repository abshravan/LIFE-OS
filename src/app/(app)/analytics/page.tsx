import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          SYSTEM DIAGNOSTICS
        </p>
        <h1 className="text-2xl font-bold tracking-wider mt-1">Analytics</h1>
      </div>
      {/* Phase 3: AnalyticsView component will be added here */}
      <div className="sys-card p-8 text-center text-[var(--sys-muted)]">
        <p className="text-sm tracking-widest">ANALYTICS MODULE</p>
        <p className="text-xs mt-2">Phase 3 — Initializing...</p>
      </div>
    </div>
  );
}
