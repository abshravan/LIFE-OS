"use client";

import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProtocolDraft {
  name: string;
  description: string;
}

interface ProtocolsStepProps {
  protocols: ProtocolDraft[];
  onChange: (protocols: ProtocolDraft[]) => void;
  errors: Partial<Record<number, string>>;
}

export default function ProtocolsStep({
  protocols,
  onChange,
  errors,
}: ProtocolsStepProps) {
  function updateProtocol(
    index: number,
    field: keyof ProtocolDraft,
    value: string
  ) {
    const updated = protocols.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  }

  function addProtocol() {
    if (protocols.length >= 3) return;
    onChange([...protocols, { name: "", description: "" }]);
  }

  function removeProtocol(index: number) {
    if (protocols.length <= 1) return;
    onChange(protocols.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] text-[var(--sys-cyan)] uppercase mb-1">
          STEP 02 — PROTOCOL DEFINITION
        </p>
        <h2 className="text-xl font-bold tracking-wide">Define Your Core Protocols</h2>
        <p className="text-xs text-[var(--sys-muted)] mt-1 leading-relaxed">
          These are your daily non-negotiables. Max 3. Every day, they must execute.
        </p>
      </div>

      <div className="space-y-4">
        {protocols.map((protocol, index) => (
          <div
            key={index}
            className={cn(
              "sys-card p-4 relative border",
              errors[index]
                ? "border-[var(--sys-red)]/40"
                : "border-[var(--sys-border)]"
            )}
          >
            {/* Protocol number badge */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded border border-[var(--sys-cyan)]/30 bg-[var(--sys-cyan)]/5 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--sys-cyan)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={protocol.name}
                  onChange={(e) => updateProtocol(index, "name", e.target.value)}
                  placeholder={`Protocol name (e.g. "${PLACEHOLDERS[index]?.name}")`}
                  className={cn(
                    "w-full bg-[var(--sys-bg)] border rounded px-3 py-2 text-sm",
                    "text-[var(--sys-text)] placeholder:text-[var(--sys-muted)]",
                    "transition-colors outline-none",
                    "focus:border-[var(--sys-cyan)] focus:ring-1 focus:ring-[var(--sys-cyan)]/30",
                    errors[index]
                      ? "border-[var(--sys-red)]"
                      : "border-[var(--sys-border)]"
                  )}
                />
                <input
                  type="text"
                  value={protocol.description}
                  onChange={(e) =>
                    updateProtocol(index, "description", e.target.value)
                  }
                  placeholder={`Details (e.g. "${PLACEHOLDERS[index]?.description}")`}
                  className={cn(
                    "w-full bg-[var(--sys-bg)] border rounded px-3 py-2 text-xs",
                    "text-[var(--sys-muted)] placeholder:text-[var(--sys-muted)]/60",
                    "transition-colors outline-none",
                    "focus:border-[var(--sys-border)] focus:ring-0",
                    "border-[var(--sys-border)]/50"
                  )}
                />
                {errors[index] && (
                  <p className="text-[10px] text-[var(--sys-red)] tracking-wide">
                    ✗ {errors[index]}
                  </p>
                )}
              </div>

              {protocols.length > 1 && (
                <button
                  onClick={() => removeProtocol(index)}
                  className="flex-shrink-0 p-1.5 text-[var(--sys-muted)] hover:text-[var(--sys-red)] transition-colors mt-0.5"
                  title="Remove protocol"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {protocols.length < 3 && (
        <button
          onClick={addProtocol}
          className={cn(
            "w-full py-2.5 rounded-md text-xs tracking-widest uppercase",
            "border border-dashed border-[var(--sys-border)]",
            "text-[var(--sys-muted)] hover:text-[var(--sys-cyan)]",
            "hover:border-[var(--sys-cyan)]/40 transition-colors",
            "flex items-center justify-center gap-2"
          )}
        >
          <Plus size={14} />
          ADD PROTOCOL ({protocols.length}/3)
        </button>
      )}

      <div className="text-[10px] text-[var(--sys-muted)] tracking-wide leading-relaxed border-l-2 border-[var(--sys-cyan)]/20 pl-3">
        <span className="text-[var(--sys-cyan)]">SYSTEM NOTE:</span> Start with
        habits you can execute every single day — even on your worst days. You can
        update protocols later from settings.
      </div>
    </div>
  );
}

const PLACEHOLDERS = [
  {
    name: "Deep Work — 2 hours",
    description: "No distractions. Build or study. Every day.",
  },
  {
    name: "Physical Training",
    description: "30min minimum. Gym, run, or bodyweight.",
  },
  {
    name: "Reading — 30 minutes",
    description: "Technical or philosophical. No social media.",
  },
];
