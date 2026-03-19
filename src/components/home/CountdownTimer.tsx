"use client";

import { useState, useEffect } from "react";

function getTimeRemaining() {
  const deadline = new Date("2026-04-08T00:00:00+05:30").getTime();
  const diff = Math.max(0, deadline - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const unitConfig = [
  { key: "days", label: "DAYS", accent: "#9b59ff" },
  { key: "hours", label: "HRS", accent: "#ff2d78" },
  { key: "minutes", label: "MIN", accent: "#00f5ff" },
  { key: "seconds", label: "SEC", accent: "#ffe600" },
] as const;

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    const id = setInterval(() => setTime(getTimeRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* bg line */}
      <div className="neon-line mb-0" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.5))" }} />
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(232,224,255,0.5)" }}>
            ⚡ Registration Closes In
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(255,45,120,0.5), transparent)" }} />
        </div>

        {/* Timer grid */}
        <div className="flex justify-center gap-3 sm:gap-6">
          {unitConfig.map(({ key, label, accent }) => {
            const val = mounted ? String(time[key]).padStart(2, "0") : "--";
            return (
              <div key={key} className="relative flex flex-col items-center" style={{ minWidth: 74 }}>
                {/* Card */}
                <div className="relative w-full" style={{
                  background: "rgba(9, 9, 20, 0.9)",
                  border: `1px solid ${accent}40`,
                  borderRadius: "10px",
                  padding: "16px 12px 12px",
                  boxShadow: `0 0 30px ${accent}15, inset 0 1px 0 ${accent}20`,
                }}>
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3" style={{
                    borderTop: `2px solid ${accent}`,
                    borderLeft: `2px solid ${accent}`,
                    borderRadius: "2px 0 0 0"
                  }} />
                  <div className="absolute bottom-0 right-0 w-3 h-3" style={{
                    borderBottom: `2px solid ${accent}`,
                    borderRight: `2px solid ${accent}`,
                    borderRadius: "0 0 2px 0"
                  }} />

                  {/* Number */}
                  <div className="font-heading font-bold text-4xl sm:text-5xl" style={{
                    color: accent,
                    textShadow: `0 0 20px ${accent}80`,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}>
                    {val}
                  </div>
                </div>

                {/* Label badge */}
                <div className="mt-2 px-2 py-0.5 text-[10px] font-mono tracking-[0.2em]" style={{
                  color: accent,
                  background: `${accent}10`,
                  border: `1px solid ${accent}30`,
                  borderRadius: "4px",
                }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 font-mono text-xs tracking-widest" style={{ color: "rgba(232,224,255,0.35)" }}>
          DEADLINE // 08 APRIL 2026
        </p>
      </div>

      <div className="neon-line mt-16" />
    </section>
  );
}
