"use client";

import Link from "next/link";
import { DUMMY_EVENTS } from "@/lib/constants";
import { ArrowRight, Code, Globe, Bug, Cpu, Bot, Gamepad2, Smartphone, Palette, Brain, Users } from "lucide-react";
import { getFeePerPerson } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code, Globe, Bug, Cpu, Bot, Gamepad2, Smartphone, Palette, Brain,
};

// Each category gets a vivid distinct theme
const categoryTheme: Record<string, { border: string; glow: string; badge: string; textColor: string; icon: string }> = {
  tech: {
    border: "rgba(155,89,255,0.35)", glow: "rgba(155,89,255,0.15)",
    badge: "rgba(155,89,255,0.15)", textColor: "#9b59ff", icon: "#9b59ff",
  },
  gaming: {
    border: "rgba(255,45,120,0.35)", glow: "rgba(255,45,120,0.15)",
    badge: "rgba(255,45,120,0.15)", textColor: "#ff2d78", icon: "#ff2d78",
  },
  hardware: {
    border: "rgba(255,230,0,0.35)", glow: "rgba(255,230,0,0.15)",
    badge: "rgba(255,230,0,0.15)", textColor: "#ffe600", icon: "#ffe600",
  },
  creative: {
    border: "rgba(0,245,255,0.35)", glow: "rgba(0,245,255,0.15)",
    badge: "rgba(0,245,255,0.15)", textColor: "#00f5ff", icon: "#00f5ff",
  },
};

export default function EventsPreview() {
  const previewEvents = DUMMY_EVENTS.slice(0, 6);
  const fee = getFeePerPerson();

  return (
    <section className="py-20 px-4" style={{
      background: "linear-gradient(180deg, rgba(5,5,8,1) 0%, rgba(13,10,25,1) 50%, rgba(5,5,8,1) 100%)"
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#ff2d78",
            background: "rgba(255,45,120,0.1)",
            border: "1px solid rgba(255,45,120,0.3)"
          }}>
            {`// Featured Events`}
          </div>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight mb-4">
            PICK YOUR{" "}
            <span className="gradient-text">BATTLEGROUND</span>
          </h2>
          <p className="font-mono text-xs tracking-widest" style={{ color: "rgba(232,224,255,0.4)" }}>
            9 EVENTS // 4 CATEGORIES // 1 WINNER
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {previewEvents.map((event, i) => {
            const theme = categoryTheme[event.category] || categoryTheme.tech;
            const Icon = iconMap[event.icon || "Code"] || Code;

            return (
              <div
                key={i}
                className="relative p-5 rounded-xl flex flex-col group transition-all duration-300 cursor-default"
                style={{
                  background: "rgba(9, 9, 20, 0.85)",
                  border: `1px solid ${theme.border}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.01)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 50px ${theme.glow}, 0 0 0 1px ${theme.border}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4" style={{
                  borderTop: `2px solid ${theme.textColor}`,
                  borderLeft: `2px solid ${theme.textColor}`,
                  borderRadius: "2px 0 0 0"
                }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{
                  borderBottom: `2px solid ${theme.textColor}`,
                  borderRight: `2px solid ${theme.textColor}`,
                  borderRadius: "0 0 2px 0"
                }} />

                {/* Icon + Badge row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{
                    background: `${theme.textColor}15`,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 0 15px ${theme.glow}`,
                  }}>
                    <Icon className="w-5 h-5" style={{ color: theme.textColor }} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded" style={{
                    color: theme.textColor,
                    background: theme.badge,
                    border: `1px solid ${theme.border}`,
                  }}>
                    {event.category}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-heading font-bold text-lg text-white mb-2 tracking-wide">
                  {event.name}
                </h3>

                {/* Desc */}
                <p className="text-xs leading-relaxed mb-4 flex-1" style={{
                  color: "rgba(232,224,255,0.5)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {event.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3" style={{
                  borderTop: `1px solid ${theme.border}`
                }}>
                  <div className="flex items-center gap-1.5" style={{ color: "rgba(232,224,255,0.5)" }}>
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono">{event.minTeamSize === event.maxTeamSize ? `${event.maxTeamSize}P` : `${event.minTeamSize}-${event.maxTeamSize}P`}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: theme.textColor, textShadow: `0 0 10px ${theme.glow}` }}>
                    ₹{fee}/PLAYER
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all */}
        <div className="text-center mt-10">
          <Link href="/events" className="btn-ghost inline-flex items-center gap-3 px-8 py-3 text-sm tracking-widest uppercase">
            ALL 9 EVENTS
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
