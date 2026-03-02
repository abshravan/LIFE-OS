import type { Metadata } from "next";
import SetupFlow from "@/components/setup/SetupFlow";

export const metadata: Metadata = {
  title: "System Setup",
};

export default function SetupPage() {
  return <SetupFlow />;
}
