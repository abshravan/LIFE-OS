"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  ArrowRight,
  Cpu,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_USERNAME } from "@/lib/demo/data";

interface NavItem {
  href: string;
  systemLabel: string;
  icon: React.ElementType;
}

const NAV: NavItem[] = [
  { href: "/demo/dashboard", systemLabel: "CORE_STATUS", icon: LayoutDashboard },
  { href: "/demo/analytics", systemLabel: "DIAGNOSTICS", icon: BarChart2 },
];

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col">
      {/* ── Demo banner ───────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-[var(--sys-amber)]/30 bg-[var(--sys-amber)]/6">
        <div className="flex items-center gap-2">
          <FlaskConical size={13} className="text-[var(--sys-amber)]" />
          <span className="text-[10px] tracking-[0.25em] text-[var(--sys-amber)] uppercase font-bold">
            DEMO MODE — Read-only snapshot. No data is saved.
          </span>
        </div>
        <Link
          href="/register"
          className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] tracking-widest uppercase font-medium transition-colors bg-[var(--sys-cyan)] text-[var(--sys-bg)] hover:opacity-90"
        >
          INITIALIZE REAL SYSTEM
          <ArrowRight size={11} />
        </Link>
      </div>

      {/* ── App layout ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-[var(--sys-border)] flex flex-col">
          <div className="p-5 border-b border-[var(--sys-border)]">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-[var(--sys-cyan)]" />
              <span className="text-lg font-bold tracking-wider">
                LIFE<span className="text-[var(--sys-cyan)]">OS</span>
              </span>
            </div>
            <p className="text-[10px] text-[var(--sys-muted)] tracking-widest mt-0.5">
              DISCIPLINE SYSTEM v1.0
            </p>
          </div>

          <div className="px-5 py-3 border-b border-[var(--sys-border)]">
            <p className="text-[10px] text-[var(--sys-muted)] tracking-widest uppercase">
              OPERATOR
            </p>
            <p className="text-sm font-medium mt-0.5 truncate">{DEMO_USERNAME}</p>
          </div>

          <nav className="flex-1 py-4 space-y-1 px-2">
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive
                      ? "bg-[var(--sys-cyan)]/10 text-[var(--sys-cyan)] border border-[var(--sys-cyan)]/20"
                      : "text-[var(--sys-muted)] hover:text-[var(--sys-text)] hover:bg-[var(--sys-border)]/50"
                  )}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="text-xs tracking-widest uppercase font-medium">
                    {item.systemLabel}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="p-3 border-t border-[var(--sys-border)]">
            <Link
              href="/register"
              className={cn(
                "flex items-center justify-center gap-2 w-full py-2.5 rounded-md",
                "text-[10px] tracking-widest uppercase font-medium",
                "bg-[var(--sys-cyan)]/10 border border-[var(--sys-cyan)]/25",
                "text-[var(--sys-cyan)] hover:bg-[var(--sys-cyan)]/15 transition-colors"
              )}
            >
              START FOR REAL
              <ArrowRight size={11} />
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto relative z-10">{children}</main>
      </div>
    </div>
  );
}
