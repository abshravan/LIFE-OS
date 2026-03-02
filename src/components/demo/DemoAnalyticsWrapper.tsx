"use client";

// Thin client wrapper that passes a no-op regenerate to AnalyticsView
// so the "Regenerate" button doesn't hit the API (which would 401).

import AnalyticsView from "@/components/analytics/AnalyticsView";
import type { AnalyticsData } from "@/lib/db/analytics.service";

export default function DemoAnalyticsWrapper({ data }: { data: AnalyticsData }) {
  return <AnalyticsView data={data} onRegenerate={async () => {}} />;
}
