"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Settings, LogOut, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JWTPayload } from "@/lib/auth/jwt";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  systemLabel: string;
}

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    systemLabel: "CORE_STATUS",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart2,
    systemLabel: "DIAGNOSTICS",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    systemLabel: "CONFIG",
  },
];

interface AppShellProps {
  user: JWTPayload;
  children: React.ReactNode;
}

export default function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-dvh flex">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-r border-[var(--sys-border)] flex flex-col">
        {/* Logo */}
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

        {/* User identity */}
        <div className="px-5 py-3 border-b border-[var(--sys-border)]">
          <p className="text-[10px] text-[var(--sys-muted)] tracking-widest uppercase">
            OPERATOR
          </p>
          <p className="text-sm font-medium mt-0.5 truncate">{user.username}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group",
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

        {/* Logout */}
        <div className="p-2 border-t border-[var(--sys-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-[var(--sys-muted)] hover:text-[var(--sys-red)] hover:bg-[var(--sys-red)]/5 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-xs tracking-widest uppercase">TERMINATE</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
