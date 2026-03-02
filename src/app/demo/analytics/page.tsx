import type { Metadata } from "next";
import { getDemoAnalyticsData } from "@/lib/demo/data";
import AnalyticsView from "@/components/analytics/AnalyticsView";

export const metadata: Metadata = { title: "Demo — Analytics" };

export default function DemoAnalyticsPage() {
  const data = getDemoAnalyticsData();

  return <AnalyticsView data={data} />;
}
