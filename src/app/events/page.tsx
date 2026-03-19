"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFeePerPerson } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getEvents } from "@/lib/firestore";
import type { Event } from "@/lib/types";
import { Code, Globe, Bug, Cpu, Bot, Gamepad2, Smartphone, Palette, Brain, Users, ArrowRight, Loader2, MapPin, Trophy, UserCircle } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code, Globe, Bug, Cpu, Bot, Gamepad2, Smartphone, Palette, Brain,
};

const categories = ["all", "tech", "gaming", "hardware", "creative"] as const;

const categoryTheme: Record<string, { accent: string; glow: string }> = {
  tech: { accent: "#9b59ff", glow: "rgba(155,89,255,0.15)" },
  gaming: { accent: "#ff2d78", glow: "rgba(255,45,120,0.15)" },
  hardware: { accent: "#ffe600", glow: "rgba(255,230,0,0.15)" },
  creative: { accent: "#00f5ff", glow: "rgba(0,245,255,0.15)" },
};

const filterLabels: Record<string, string> = {
  all: "ALL", tech: "TECH", gaming: "GAMING", hardware: "HW", creative: "CREATIVE",
};

export default function EventsPage() {
  const [filter, setFilter] = useState<string>("all");
  const { user, signInWithGoogle } = useAuth();
  const { settings } = useSettings();
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents();
        setDbEvents(data.filter(e => e.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fee = getFeePerPerson();
  const regOpen = settings?.registrationOpen ?? false;
  const events = filter === "all" ? dbEvents : dbEvents.filter((e) => e.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 px-4">
      {/* Top mesh */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(155,89,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(155,89,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#9b59ff", background: "rgba(155,89,255,0.1)", border: "1px solid rgba(155,89,255,0.3)"
          }}>
            {`// Select Your Event`}
          </div>
          <h1 className="font-heading font-bold text-5xl sm:text-6xl text-white tracking-tight mb-3">
            <span className="gradient-text">EVENTS</span>
          </h1>
          <p className="font-mono text-xs tracking-widest" style={{ color: "rgba(232,224,255,0.4)" }}>
            9 EVENTS // 4 CATEGORIES // ₹{fee}/PLAYER
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const theme = cat === "all" ? { accent: "#9b59ff" } : categoryTheme[cat];
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 text-xs font-mono tracking-widest uppercase rounded transition-all duration-200"
                style={{
                  border: `1px solid ${isActive ? theme.accent : `${theme.accent}30`}`,
                  color: isActive ? theme.accent : "rgba(232,224,255,0.4)",
                  background: isActive ? `${theme.accent}15` : "transparent",
                  boxShadow: isActive ? `0 0 20px ${theme.accent}25` : "none",
                  textShadow: isActive ? `0 0 10px ${theme.accent}60` : "none",
                }}
              >
                {filterLabels[cat]}
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => {
            const theme = categoryTheme[event.category] || categoryTheme.tech;
            const Icon = iconMap[event.icon || "Code"] || Code;
            const teamLabel = event.minTeamSize === event.maxTeamSize
              ? `${event.maxTeamSize}P` : `${event.minTeamSize}-${event.maxTeamSize}P`;

            return (
              <div
                key={i}
                className="relative flex flex-col p-5 rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(9,9,20,0.9)",
                  border: `1px solid ${theme.accent}25`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${theme.glow}`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${theme.accent}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.borderColor = `${theme.accent}25`;
                }}
              >
                {/* Corners */}
                <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `2px solid ${theme.accent}`, borderLeft: `2px solid ${theme.accent}`, borderRadius: "2px 0 0 0" }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `2px solid ${theme.accent}`, borderRight: `2px solid ${theme.accent}`, borderRadius: "0 0 2px 0" }} />

                {/* Icon + Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{
                    background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`,
                    boxShadow: `0 0 15px ${theme.glow}`,
                  }}>
                    <Icon className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded" style={{
                    color: theme.accent, background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`
                  }}>
                    {event.category}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-white mb-2 tracking-wide">{event.name}</h3>
                <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: "rgba(232,224,255,0.5)", fontFamily: "var(--font-mono)" }}>
                  {event.description}
                </p>

                {event.rules && event.rules.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {event.rules.map((r, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs" style={{ color: "rgba(232,224,255,0.45)", fontFamily: "var(--font-mono)" }}>
                        <span style={{ color: theme.accent }}>›</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Additional Details */}
                {(event.prize || event.venue || event.coordinatorName) && (
                  <div className="flex flex-col gap-1.5 mb-4 text-xs font-mono px-3 py-2 rounded bg-white/5 border border-white/10" style={{ color: "rgba(232,224,255,0.6)" }}>
                    {event.prize && <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5" style={{ color: theme.accent }}/> {event.prize}</div>}
                    {event.venue && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: theme.accent }}/> {event.venue}</div>}
                    {(event.coordinatorName || event.coordinatorPhone) && (
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-3.5 h-3.5" style={{ color: theme.accent }}/> 
                        {event.coordinatorName} {event.coordinatorPhone && `(${event.coordinatorPhone})`}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3 mb-4" style={{ borderTop: `1px solid ${theme.accent}20` }}>
                  <div className="flex items-center gap-1.5" style={{ color: "rgba(232,224,255,0.5)" }}>
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono">{teamLabel}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: theme.accent, textShadow: `0 0 10px ${theme.accent}60` }}>
                    ₹{fee}/PLAYER
                  </span>
                </div>

                {/* Register */}
                {regOpen ? (
                  user ? (
                    <Link href={`/register/${event.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-heading font-bold text-sm tracking-widest uppercase text-white transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}88)`,
                        boxShadow: `0 0 20px ${theme.glow}`,
                      }}>
                      REGISTER <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button onClick={signInWithGoogle}
                      className="w-full py-2.5 rounded-lg font-heading font-bold text-sm tracking-widest uppercase transition-all"
                      style={{
                        border: `1px solid ${theme.accent}50`,
                        color: theme.accent,
                        background: `${theme.accent}10`,
                      }}>
                      SIGN IN TO REGISTER
                    </button>
                  )
                ) : (
                  <div className="w-full py-2.5 rounded-lg text-center font-mono text-xs tracking-widest" style={{
                    background: "rgba(255,255,255,0.05)", color: "rgba(232,224,255,0.3)"
                  }}>
                    REGISTRATION CLOSED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
