import type { Metadata } from "next";
import { getDemoAnalyticsData } from "@/lib/demo/data";
import DemoAnalyticsWrapper from "@/components/demo/DemoAnalyticsWrapper";

export const metadata: Metadata = { title: "Demo — Analytics" };

export default function DemoAnalyticsPage() {
  const data = getDemoAnalyticsData();
  return <DemoAnalyticsWrapper data={data} />;
}
