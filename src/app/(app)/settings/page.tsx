import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          SYSTEM CONFIGURATION
        </p>
        <h1 className="text-2xl font-bold tracking-wider mt-1">Settings</h1>
      </div>

      <div className="space-y-3">
        <Link
          href="/setup"
          className="sys-card p-4 flex items-center justify-between hover:border-[var(--sys-cyan)]/30 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium tracking-wide">Identity & Protocols</p>
            <p className="text-xs text-[var(--sys-muted)] mt-0.5">
              Update your target self and core protocol definitions
            </p>
          </div>
          <ArrowRight
            size={16}
            className="text-[var(--sys-muted)] group-hover:text-[var(--sys-cyan)] transition-colors"
          />
        </Link>
      </div>

      <div className="mt-8 sys-card p-4 text-center text-[var(--sys-muted)]">
        <p className="text-xs tracking-widest">
          MORE CONFIGURATION OPTIONS — PHASE 3
        </p>
      </div>
    </div>
  );
}
