"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string[];
  password?: string[];
}

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setServerError(data.error);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Connection failed. Check your network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sys-card p-8">
      <div className="mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--sys-cyan)] uppercase mb-1">
          ACCESS PROTOCOL
        </p>
        <h2 className="text-lg font-bold tracking-wide">Authentication</h2>
        <p className="text-xs text-[var(--sys-muted)] mt-1">
          Enter credentials to access the system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="EMAIL"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email?.[0]}
          placeholder="operator@domain.com"
        />
        <Field
          label="PASSWORD"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
          placeholder="••••••••"
        />

        {serverError && (
          <p className="text-xs text-[var(--sys-red)] tracking-wide bg-[var(--sys-red)]/5 border border-[var(--sys-red)]/20 rounded px-3 py-2">
            ✗ {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-2.5 rounded-md text-sm font-medium tracking-widest uppercase transition-all",
            "bg-[var(--sys-cyan)] text-[var(--sys-bg)] hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            loading && "animate-pulse"
          )}
        >
          {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[var(--sys-border)] space-y-3">
        <div className="text-center">
          <p className="text-xs text-[var(--sys-muted)]">
            No system profile?{" "}
            <Link
              href="/register"
              className="text-[var(--sys-cyan)] hover:opacity-80 transition-opacity"
            >
              Initialize Account
            </Link>
          </p>
        </div>

        {/* Demo mode entry */}
        <Link
          href="/demo"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2 rounded-md",
            "border border-dashed border-[var(--sys-border)]",
            "text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase",
            "hover:border-[var(--sys-amber)]/40 hover:text-[var(--sys-amber)] transition-colors"
          )}
        >
          <span className="text-[var(--sys-amber)]">◈</span>
          VIEW LIVE DEMO — no account required
        </Link>
      </div>
    </div>
  );
}

// ── Shared input field ─────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

function Field({ label, name, type, value, onChange, error, placeholder }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[10px] tracking-[0.2em] text-[var(--sys-muted)] uppercase mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : "email"}
        className={cn(
          "w-full bg-[var(--sys-bg)] border rounded-md px-3 py-2.5 text-sm",
          "text-[var(--sys-text)] placeholder:text-[var(--sys-muted)]",
          "transition-colors outline-none",
          "focus:border-[var(--sys-cyan)] focus:ring-1 focus:ring-[var(--sys-cyan)]/30",
          error
            ? "border-[var(--sys-red)]"
            : "border-[var(--sys-border)] hover:border-[var(--sys-muted)]"
        )}
      />
      {error && (
        <p className="text-[10px] text-[var(--sys-red)] mt-1 tracking-wide">
          ✗ {error}
        </p>
      )}
    </div>
  );
}
