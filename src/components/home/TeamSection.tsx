"use client";

import { DUMMY_ORGANIZERS } from "@/lib/constants";
import { User } from "lucide-react";

// Cycle colors for variety
const ACCENT_COLORS = ["#9b59ff", "#ff2d78", "#00f5ff", "#ffe600", "#39ff14", "#ff6b00"];

export default function TeamSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#00f5ff",
            background: "rgba(0,245,255,0.1)",
            border: "1px solid rgba(0,245,255,0.3)"
          }}>
            {`// Core Team`}
          </div>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight">
            THE <span className="gradient-text">SQUAD</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DUMMY_ORGANIZERS.map((org, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div
                key={i}
                className="relative p-4 rounded-xl text-center group transition-all duration-300"
                style={{ background: "rgba(9,9,20,0.85)", border: `1px solid ${accent}25` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${accent}20`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.borderColor = `${accent}25`;
                }}
              >
                {/* top-left corner */}
                <div className="absolute top-0 left-0 w-3 h-3" style={{
                  borderTop: `2px solid ${accent}`,
                  borderLeft: `2px solid ${accent}`,
                  borderRadius: "2px 0 0 0"
                }} />

                {/* Avatar */}
                <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{
                  background: `${accent}15`,
                  border: `2px solid ${accent}40`,
                  boxShadow: `0 0 15px ${accent}20`,
                }}>
                  <User className="w-6 h-6" style={{ color: accent }} />
                </div>

                <h3 className="font-heading font-semibold text-white text-sm tracking-wide">{org.name}</h3>
                <p className="font-mono text-[10px] tracking-widest mt-1 uppercase" style={{ color: accent }}>
                  {org.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
