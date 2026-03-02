"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import IdentityStep from "./IdentityStep";
import ProtocolsStep, { type ProtocolDraft } from "./ProtocolsStep";

type Step = 0 | 1;

interface IdentityData {
  targetSelf: string;
  motivation: string;
}

interface FormErrors {
  identity: Partial<Record<"targetSelf" | "motivation", string>>;
  protocols: Partial<Record<number, string>>;
  server: string;
}

const STEPS = ["IDENTITY MATRIX", "PROTOCOL DEFINITION"];

export default function SetupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);

  const [identity, setIdentity] = useState<IdentityData>({
    targetSelf: "",
    motivation: "",
  });
  const [protocols, setProtocols] = useState<ProtocolDraft[]>([
    { name: "", description: "" },
  ]);
  const [errors, setErrors] = useState<FormErrors>({
    identity: {},
    protocols: {},
    server: "",
  });

  function updateIdentity(
    field: "targetSelf" | "motivation",
    value: string
  ) {
    setIdentity((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({
      ...p,
      identity: { ...p.identity, [field]: undefined },
    }));
  }

  // ── Validation ─────────────────────────────────────────────

  function validateIdentity(): boolean {
    const errs: FormErrors["identity"] = {};
    if (!identity.targetSelf || identity.targetSelf.length < 10) {
      errs.targetSelf = "Please describe your target state (min 10 chars)";
    }
    if (!identity.motivation || identity.motivation.length < 10) {
      errs.motivation = "Please describe your motivation (min 10 chars)";
    }
    setErrors((p) => ({ ...p, identity: errs }));
    return Object.keys(errs).length === 0;
  }

  function validateProtocols(): boolean {
    const errs: FormErrors["protocols"] = {};
    protocols.forEach((p, i) => {
      if (!p.name || p.name.length < 2) {
        errs[i] = "Protocol name must be at least 2 characters";
      }
    });
    setErrors((p) => ({ ...p, protocols: errs }));
    return Object.keys(errs).length === 0;
  }

  // ── Navigation ─────────────────────────────────────────────

  function handleNext() {
    if (step === 0) {
      if (validateIdentity()) setStep(1);
    }
  }

  function handleBack() {
    setStep(0);
  }

  // ── Submit ─────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateProtocols()) return;

    setLoading(true);
    setErrors((p) => ({ ...p, server: "" }));

    try {
      // 1. Save identity
      const identityRes = await fetch("/api/user/identity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identity),
      });

      if (!identityRes.ok) {
        const d = await identityRes.json();
        throw new Error(d.error ?? "Failed to save identity");
      }

      // 2. Save protocols
      const protocolsRes = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocols: protocols
            .filter((p) => p.name.trim())
            .map((p, i) => ({
              name: p.name.trim(),
              description: p.description.trim() || undefined,
              order: i,
            })),
        }),
      });

      if (!protocolsRes.ok) {
        const d = await protocolsRes.json();
        throw new Error(d.error ?? "Failed to save protocols");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setErrors((p) => ({
        ...p,
        server: e instanceof Error ? e.message : "Setup failed. Retry.",
      }));
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all",
                i < step
                  ? "border-[var(--sys-cyan)] bg-[var(--sys-cyan)] text-[var(--sys-bg)]"
                  : i === step
                  ? "border-[var(--sys-cyan)] text-[var(--sys-cyan)]"
                  : "border-[var(--sys-border)] text-[var(--sys-muted)]"
              )}
            >
              {i < step ? <Check size={10} /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] tracking-widest uppercase hidden sm:block",
                i === step
                  ? "text-[var(--sys-cyan)]"
                  : i < step
                  ? "text-[var(--sys-text)]"
                  : "text-[var(--sys-muted)]"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 min-w-[24px] transition-colors",
                  i < step ? "bg-[var(--sys-cyan)]" : "bg-[var(--sys-border)]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="sys-card p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 0 ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 0 ? 12 : -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 ? (
              <IdentityStep
                targetSelf={identity.targetSelf}
                motivation={identity.motivation}
                onChange={updateIdentity}
                errors={errors.identity}
              />
            ) : (
              <ProtocolsStep
                protocols={protocols}
                onChange={setProtocols}
                errors={errors.protocols}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {errors.server && (
          <p className="mt-4 text-xs text-[var(--sys-red)] bg-[var(--sys-red)]/5 border border-[var(--sys-red)]/20 rounded px-3 py-2">
            ✗ {errors.server}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--sys-border)]">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={cn(
              "flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors px-3 py-2 rounded",
              step === 0
                ? "opacity-0 pointer-events-none"
                : "text-[var(--sys-muted)] hover:text-[var(--sys-text)]"
            )}
          >
            <ChevronLeft size={14} />
            BACK
          </button>

          {step === 0 ? (
            <button
              onClick={handleNext}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium tracking-widest uppercase",
                "bg-[var(--sys-cyan)] text-[var(--sys-bg)] hover:opacity-90 transition-opacity"
              )}
            >
              NEXT
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium tracking-widest uppercase",
                "bg-[var(--sys-cyan)] text-[var(--sys-bg)] hover:opacity-90 transition-opacity",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "animate-pulse"
              )}
            >
              {loading ? "INITIALIZING..." : "LAUNCH SYSTEM"}
              {!loading && <Check size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
