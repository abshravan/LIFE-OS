import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Setup",
};

export default function SetupPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] text-[var(--sys-muted)] uppercase">
          IDENTITY CALIBRATION
        </p>
        <h1 className="text-2xl font-bold tracking-wider mt-1">System Setup</h1>
      </div>
      {/* Phase 1 onboarding: IdentityForm + ProtocolSetup will go here */}
      <div className="sys-card p-8 text-center text-[var(--sys-muted)]">
        <p className="text-sm tracking-widest">SETUP MODULE</p>
        <p className="text-xs mt-2">Identity & Protocol Calibration — Phase 1</p>
      </div>
    </div>
  );
}
