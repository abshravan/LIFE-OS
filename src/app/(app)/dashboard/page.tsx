import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/db/dashboard.service";
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

// No caching — always fetch fresh dashboard data
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData(session.userId);

  if (data.setupRequired) {
    redirect("/setup");
  }

  return (
    <DashboardView
      initialLog={data.dailyLog}
      disciplineScore={data.disciplineScore}
      currentStreak={data.currentStreak}
      username={session.username}
    />
  );
}
