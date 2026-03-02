import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { getAnalyticsData } from "@/lib/db/analytics.service";
import AnalyticsView from "@/components/analytics/AnalyticsView";

export const metadata: Metadata = {
  title: "Analytics",
};

// Always fetch fresh — analytics reflect the current state of the DB
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await requireSession().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const data = await getAnalyticsData(session.userId);

  return <AnalyticsView data={data} />;
}
