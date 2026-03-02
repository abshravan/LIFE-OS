"use client";

import { cn } from "@/lib/utils";

interface IdentityStepProps {
  targetSelf: string;
  motivation: string;
  onChange: (field: "targetSelf" | "motivation", value: string) => void;
  errors: Partial<Record<"targetSelf" | "motivation", string>>;
}

export default function IdentityStep({
  targetSelf,
  motivation,
  onChange,
  errors,
}: IdentityStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-cyan)] uppercase mb-1">
          STEP 01 — IDENTITY MATRIX
        </p>
        <h2 className="text-xl font-bold tracking-wide">Define Your Target State</h2>
        <p className="text-xs text-[var(--sys-muted)] mt-1 leading-relaxed">
          This is your north star. The system will measure every action against this definition.
        </p>
      </div>

      <TextArea
        label="WHO DO YOU WANT TO BECOME?"
        placeholder="e.g. A disciplined software engineer who ships products, stays fit, and builds in public consistently."
        value={targetSelf}
        onChange={(v) => onChange("targetSelf", v)}
        error={errors.targetSelf}
        rows={4}
        hint="Be specific. Vague targets produce vague results."
      />

      <TextArea
        label="WHY DOES THIS MATTER TO YOU?"
        placeholder="e.g. I want to prove to myself that I can build the life I designed — not the one that happened to me."
        value={motivation}
        onChange={(v) => onChange("motivation", v)}
        error={errors.motivation}
        rows={4}
        hint="Your why is the fuel when motivation drops."
      />
    </div>
  );
}

// ── Shared textarea ────────────────────────────────────────────

interface TextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rows?: number;
  hint?: string;
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 3,
  hint,
}: TextAreaProps) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase mb-1.5">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-[var(--sys-bg)] border rounded-md px-3 py-2.5 text-sm resize-none",
          "text-[var(--sys-text)] placeholder:text-[var(--sys-muted)]",
          "transition-colors outline-none leading-relaxed",
          "focus:border-[var(--sys-cyan)] focus:ring-1 focus:ring-[var(--sys-cyan)]/30",
          error
            ? "border-[var(--sys-red)]"
            : "border-[var(--sys-border)] hover:border-[var(--sys-muted)]"
        )}
      />
      {hint && !error && (
        <p className="text-[10px] text-[var(--sys-muted)] mt-1 tracking-wide">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] text-[var(--sys-red)] mt-1 tracking-wide">✗ {error}</p>
      )}
    </div>
  );
}
