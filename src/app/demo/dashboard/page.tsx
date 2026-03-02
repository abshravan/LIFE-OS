import type { Metadata } from "next";
import { getDemoDashboardData, DEMO_USERNAME } from "@/lib/demo/data";
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Demo — Dashboard" };

export default function DemoDashboardPage() {
  const { dailyLog, disciplineScore, currentStreak } = getDemoDashboardData();

  return (
    <DashboardView
      initialLog={dailyLog}
      disciplineScore={disciplineScore}
      currentStreak={currentStreak}
      username={DEMO_USERNAME}
    />
  );
}
