"use client";

import { DUMMY_SCHEDULE } from "@/lib/constants";
import { MapPin } from "lucide-react";

const DAY_THEME = [
  { day: 1, label: "DAY 01", date: "APRIL 8, 2026", accent: "#9b59ff", glow: "rgba(155,89,255,0.2)" },
  { day: 2, label: "DAY 02", date: "APRIL 9, 2026", accent: "#ff2d78", glow: "rgba(255,45,120,0.2)" },
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen py-14 px-4">
      {/* Mesh bg */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(155,89,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(155,89,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#00f5ff", background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)"
          }}>
            // Event Timeline
          </div>
          <h1 className="font-heading font-bold text-5xl sm:text-6xl text-white tracking-tight">
            <span className="gradient-text">SCHEDULE</span>
          </h1>
          <p className="font-mono text-xs tracking-widest mt-2" style={{ color: "rgba(232,224,255,0.4)" }}>
            TWO DAYS // NON-STOP TECH ACTION
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {DAY_THEME.map(({ day, label, date, accent, glow }) => {
            const slots = DUMMY_SCHEDULE.filter((s) => s.day === day);
            return (
              <div key={day}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="px-4 py-2 rounded-lg font-heading font-bold text-xl tracking-widest" style={{
                    background: `${accent}15`,
                    border: `1px solid ${accent}50`,
                    color: accent,
                    textShadow: `0 0 15px ${accent}`,
                    boxShadow: `0 0 20px ${accent}20`,
                  }}>
                    {label}
                  </div>
                  <div>
                    <div className="font-mono text-xs tracking-widest uppercase" style={{ color: accent }}>
                      {date}
                    </div>
                  </div>
                </div>

                {/* Slots */}
                <div className="relative space-y-3 pl-4" style={{
                  borderLeft: `2px solid ${accent}30`
                }}>
                  {slots.map((slot, i) => (
                    <div key={i} className="relative transition-all duration-200 group" style={{ paddingLeft: "20px" }}>
                      {/* Timeline dot */}
                      <div className="absolute left-[-27px] top-4 w-3 h-3 rounded-full" style={{
                        background: accent,
                        boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}60`,
                        border: `2px solid rgba(5,5,8,1)`,
                      }} />

                      <div
                        className="p-4 rounded-xl transition-all duration-200"
                        style={{
                          background: "rgba(9,9,20,0.85)",
                          border: `1px solid ${accent}15`,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${accent}40`;
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${glow}`;
                          (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${accent}15`;
                          (e.currentTarget as HTMLElement).style.boxShadow = "";
                          (e.currentTarget as HTMLElement).style.transform = "";
                        }}
                      >
                        {/* Time badge */}
                        <div className="inline-block font-mono text-[11px] tracking-widest px-2 py-0.5 rounded mb-2" style={{
                          color: accent,
                          background: `${accent}15`,
                          border: `1px solid ${accent}30`,
                        }}>
                          {slot.time}
                        </div>
                        <h3 className="font-heading font-semibold text-white text-sm tracking-wide">{slot.eventName}</h3>
                        {slot.description && (
                          <p className="text-xs mt-1" style={{ color: "rgba(232,224,255,0.45)", fontFamily: "var(--font-mono)" }}>
                            {slot.description}
                          </p>
                        )}
                        {slot.venue && (
                          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "rgba(232,224,255,0.35)" }}>
                            <MapPin className="w-3 h-3" style={{ color: accent }} />
                            {slot.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
