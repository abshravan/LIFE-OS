"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu } from "lucide-react";

// ── Boot lines ──────────────────────────────────────────────

interface BootLine {
  text: string;
  color: "muted" | "default" | "cyan" | "green" | "amber";
  delay: number; // ms after mount
}

const LINES: BootLine[] = [
  { text: "> LIFEOS v1.0 — BOOT SEQUENCE INITIATED",  color: "muted",   delay:    0 },
  { text: "> LOADING DISCIPLINE ENGINE...",            color: "default", delay:  380 },
  { text: "  [OK] ENGINE READY",                      color: "green",   delay:  720 },
  { text: "> RESOLVING OPERATOR PROFILE...",           color: "default", delay:  950 },
  { text: "  OPERATOR ID: ARCH_STUDENT_01",           color: "cyan",    delay: 1200 },
  { text: "> LOADING PROTOCOL MANIFEST...",            color: "default", delay: 1440 },
  { text: "  P01  DEEP WORK — 2H ............. [OK]", color: "green",   delay: 1650 },
  { text: "  P02  PHYSICAL TRAINING .......... [OK]", color: "green",   delay: 1820 },
  { text: "  P03  READING — 30MIN ............. [OK]",color: "green",   delay: 1990 },
  { text: "> COMPUTING DISCIPLINE INDEX...",           color: "default", delay: 2220 },
  { text: "  INDEX: 74.2  STATUS: STABLE",            color: "cyan",    delay: 2520 },
  { text: "  CONSECUTIVE STREAK: 5 DAYS",             color: "amber",   delay: 2720 },
  { text: "> ALL SYSTEMS NOMINAL",                    color: "green",   delay: 2970 },
  { text: "> ENGAGING DASHBOARD...",                  color: "cyan",    delay: 3340 },
];

const LAST_DELAY = 3340;
const EXIT_AT    = LAST_DELAY + 600;  // when overlay starts fading
const DONE_AT    = EXIT_AT   + 500;   // when onComplete fires

const COLOR: Record<BootLine["color"], string> = {
  muted:   "#6B7280",
  default: "#E2E8F0",
  cyan:    "#06B6D4",
  green:   "#10B981",
  amber:   "#F59E0B",
};

// ── Component ────────────────────────────────────────────────

interface DemoBootSequenceProps {
  onComplete: () => void;
}

export default function DemoBootSequence({ onComplete }: DemoBootSequenceProps) {
  const [visible, setVisible] = useState(0);   // how many lines shown
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Skip if already booted this browser session
    if (sessionStorage.getItem("lifeos-demo-booted") === "1") {
      onCompleteRef.current();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), line.delay));
    });

    timers.push(setTimeout(() => setExiting(true), EXIT_AT));

    timers.push(
      setTimeout(() => {
        sessionStorage.setItem("lifeos-demo-booted", "1");
        onCompleteRef.current();
      }, DONE_AT)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  function skip() {
    sessionStorage.setItem("lifeos-demo-booted", "1");
    onCompleteRef.current();
  }

  const progress = (visible / LINES.length) * 100;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "#080C14" }}
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(6,182,212,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex items-center gap-3 mb-10"
          >
            <Cpu size={26} style={{ color: "#06B6D4" }} />
            <span
              className="text-2xl font-bold tracking-[0.3em]"
              style={{ color: "#E2E8F0" }}
            >
              LIFE<span style={{ color: "#06B6D4" }}>OS</span>
            </span>
            <span
              className="ml-2 text-[10px] tracking-[0.25em] px-2 py-0.5 rounded border"
              style={{
                color: "#06B6D4",
                borderColor: "rgba(6,182,212,0.3)",
                background: "rgba(6,182,212,0.08)",
              }}
            >
              DEMO
            </span>
          </motion.div>

          {/* Terminal window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg rounded-xl overflow-hidden"
            style={{
              border: "1px solid #1F2937",
              background: "#0B0F19",
              boxShadow: "0 0 40px rgba(6,182,212,0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-1.5 px-4 py-3 border-b"
              style={{ background: "#111827", borderColor: "#1F2937" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444", opacity: 0.7 }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B", opacity: 0.7 }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#10B981", opacity: 0.7 }} />
              <span
                className="ml-3 text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "#6B7280" }}
              >
                lifeos — boot terminal
              </span>
            </div>

            {/* Lines */}
            <div className="p-5 space-y-1.5" style={{ minHeight: 290 }}>
              {LINES.slice(0, visible).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-xs leading-relaxed"
                  style={{ color: COLOR[line.color] }}
                >
                  {line.text}
                  {/* Blinking cursor only on the newest line */}
                  {i === visible - 1 && <span className="demo-cursor" />}
                </motion.p>
              ))}
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-4">
              <div
                className="h-px rounded overflow-hidden"
                style={{ background: "#1F2937" }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background: "#06B6D4",
                    boxShadow: "0 0 8px #06B6D4",
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Skip */}
          <button
            onClick={skip}
            className="relative mt-8 text-[10px] tracking-[0.25em] uppercase transition-colors"
            style={{ color: "#4B5563" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#06B6D4")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#4B5563")
            }
          >
            SKIP SEQUENCE →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
