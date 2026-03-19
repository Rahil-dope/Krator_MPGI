"use client";

import { Users, Trophy, Calendar, Zap } from "lucide-react";

const stats = [
  { icon: Calendar, value: "2", unit: "DAYS", label: "of Innovation", accent: "#9b59ff" },
  { icon: Trophy, value: "9+", unit: "EVENTS", label: "Across 4 Categories", accent: "#ff2d78" },
  { icon: Users, value: "500+", unit: "PLAYERS", label: "Expected Participants", accent: "#00f5ff" },
  { icon: Zap, value: "₹500", unit: "PRIZE", label: "Worth of Rewards", accent: "#ffe600" },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#9b59ff",
            background: "rgba(155,89,255,0.1)",
            border: "1px solid rgba(155,89,255,0.3)"
          }}>
            // About KRATOS
          </div>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight mb-4">
            WHERE TALENT{" "}
            <span className="gradient-text">MEETS TECH</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(232,224,255,0.55)", fontFamily: "var(--font-mono)" }}>
            KRATOS 2026 is the flagship inter-collegiate technical festival at MPGI SoE.
            Competitive coding, hardware battles, gaming tournaments & creative design — all in 2 epic days.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}
              className="relative p-5 rounded-xl text-center group transition-all duration-300 hover:scale-[1.04]"
              style={{
                background: "rgba(9, 9, 20, 0.8)",
                border: `1px solid ${stat.accent}25`,
                boxShadow: `0 0 0 rgba(${stat.accent},0)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${stat.accent}20, 0 0 0 1px ${stat.accent}30`;
                (e.currentTarget as HTMLElement).style.borderColor = `${stat.accent}50`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "";
                (e.currentTarget as HTMLElement).style.borderColor = `${stat.accent}25`;
              }}
            >
              {/* Corner accent TL */}
              <div className="absolute top-0 left-0 w-4 h-4" style={{
                borderTop: `2px solid ${stat.accent}`,
                borderLeft: `2px solid ${stat.accent}`,
                borderRadius: "2px 0 0 0"
              }} />
              {/* Corner accent BR */}
              <div className="absolute bottom-0 right-0 w-4 h-4" style={{
                borderBottom: `2px solid ${stat.accent}`,
                borderRight: `2px solid ${stat.accent}`,
                borderRadius: "0 0 2px 0"
              }} />

              <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{
                background: `${stat.accent}15`,
                border: `1px solid ${stat.accent}30`,
              }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
              </div>

              <div className="font-heading font-bold text-3xl mb-0.5" style={{
                color: stat.accent,
                textShadow: `0 0 20px ${stat.accent}60`
              }}>
                {stat.value}
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] mb-1" style={{ color: `${stat.accent}90` }}>
                {stat.unit}
              </div>
              <div className="text-xs" style={{ color: "rgba(232,224,255,0.45)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
