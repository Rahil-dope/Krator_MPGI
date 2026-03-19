"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

// Particle / floating hexagon decorations
const SHAPES = [
  { size: 120, x: "10%", y: "15%", color: "rgba(155,89,255,0.08)", rot: 20, dur: 7 },
  { size: 80, x: "85%", y: "10%", color: "rgba(255,45,120,0.08)", rot: -15, dur: 9 },
  { size: 200, x: "70%", y: "60%", color: "rgba(0,245,255,0.05)", rot: 45, dur: 11 },
  { size: 60, x: "20%", y: "70%", color: "rgba(255,230,0,0.07)", rot: -30, dur: 8 },
  { size: 140, x: "50%", y: "5%", color: "rgba(57,255,20,0.05)", rot: 10, dur: 13 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        {/* Deep gradient layers */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(155,89,255,0.12) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 80% 50%, rgba(255,45,120,0.1) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 10%, rgba(0,245,255,0.08) 0%, transparent 50%)",
        }} />

        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(155,89,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,89,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        {/* Floating geometric shapes */}
        {SHAPES.map((s, i) => (
          <div
            key={i}
            className="absolute border"
            style={{
              width: s.size,
              height: s.size,
              left: s.x,
              top: s.y,
              borderColor: s.color,
              background: s.color,
              transform: `rotate(${s.rot}deg)`,
              borderRadius: "8px",
              animation: `float ${s.dur}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Event badge */}
        <div className="inline-flex items-center gap-2 mb-6" style={{
          background: "rgba(155,89,255,0.1)",
          border: "1px solid rgba(155,89,255,0.4)",
          borderRadius: "6px",
          padding: "6px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          letterSpacing: "0.15em",
          color: "#00f5ff",
        }}>
          <Calendar className="w-3.5 h-3.5" />
          APR 08–09 / 2026 / MPGI-SOE
          <span className="inline-block w-2 h-2 rounded-full ml-1" style={{
            background: "#39ff14",
            boxShadow: "0 0 8px #39ff14",
            animation: "pulseNeon 1.5s ease-in-out infinite"
          }} />
        </div>

        {/* Main title */}
        <h1 className="font-heading text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter mb-2"
          style={{ lineHeight: 0.9 }}>
          <span className="gradient-text" style={{ animation: "glitch 5s infinite" }}>
            KRATOS
          </span>
          <br />
          <span style={{
            color: "rgba(232,224,255,0.15)",
            WebkitTextStroke: "1px rgba(155,89,255,0.4)",
            fontSize: "0.7em",
            letterSpacing: "0.3em",
          }}>
            2026
          </span>
        </h1>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.5))" }} />
          <p className="font-mono text-sm tracking-[0.25em] uppercase" style={{ color: "rgba(232,224,255,0.6)" }}>
            Inter-Collegiate Technical Festival
          </p>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(155,89,255,0.5), transparent)" }} />
        </div>

        {/* Venue */}
        <div className="flex items-center justify-center gap-1.5 mb-10 font-mono text-xs tracking-wider" style={{ color: "rgba(0,245,255,0.7)" }}>
          <MapPin className="w-3.5 h-3.5" />
          MPGI School of Engineering, Nanded
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { label: "CODING", color: "#9b59ff" },
            { label: "GAMING", color: "#ff2d78" },
            { label: "HARDWARE", color: "#ffe600" },
            { label: "CREATIVE", color: "#00f5ff" },
          ].map((tag) => (
            <span key={tag.label} className="px-3 py-1 text-xs font-mono tracking-widest rounded" style={{
              border: `1px solid ${tag.color}40`,
              color: tag.color,
              background: `${tag.color}10`,
              textShadow: `0 0 10px ${tag.color}50`,
            }}>
              {tag.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/events" className="btn-primary flex items-center gap-3 px-8 py-4 text-base tracking-widest uppercase">
            EXPLORE EVENTS
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/schedule" className="btn-ghost flex items-center gap-3 px-8 py-4 text-base tracking-widest uppercase">
            VIEW SCHEDULE
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: "linear-gradient(to bottom, transparent, rgba(5,5,8,0.8))"
      }} />
    </section>
  );
}
