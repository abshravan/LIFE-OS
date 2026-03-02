import type { Metadata } from "next";
import { getDemoDashboardData, DEMO_USERNAME } from "@/lib/demo/data";
import DemoDashboardView from "@/components/demo/DemoDashboardView";

export const metadata: Metadata = { title: "Demo — Dashboard" };

export default function DemoDashboardPage() {
  const { dailyLog, disciplineScore, currentStreak } = getDemoDashboardData();

  return (
    <DemoDashboardView
      initialLog={dailyLog}
      initialScore={disciplineScore}
      currentStreak={currentStreak}
      username={DEMO_USERNAME}
    />
  );
}
