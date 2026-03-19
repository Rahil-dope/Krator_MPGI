"use client";

import { Mail, Phone, MapPin } from "lucide-react";

const contacts = [
  { icon: Mail, label: "EMAIL", value: "kratos@mpgi.edu", accent: "#9b59ff" },
  { icon: Phone, label: "PHONE", value: "+91 98765 43210", accent: "#ff2d78" },
  { icon: MapPin, label: "VENUE", value: "MPGI School of Engineering", accent: "#00f5ff" },
];

export default function ContactSection() {
  return (
    <section className="py-20 px-4" style={{
      background: "linear-gradient(180deg, rgba(5,5,8,1) 0%, rgba(13,10,25,0.8) 100%)"
    }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block font-mono text-xs tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded" style={{
            color: "#ffe600",
            background: "rgba(255,230,0,0.1)",
            border: "1px solid rgba(255,230,0,0.3)"
          }}>
            // Contact Us
          </div>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight mb-2">
            GET IN <span className="gradient-text-yellow">TOUCH</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {contacts.map((c) => (
            <div
              key={c.label}
              className="relative p-6 rounded-xl text-center transition-all duration-300 group"
              style={{
                background: "rgba(9,9,20,0.85)",
                border: `1px solid ${c.accent}25`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${c.accent}50`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${c.accent}20`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${c.accent}25`;
                (e.currentTarget as HTMLElement).style.boxShadow = "";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              {/* TL corner */}
              <div className="absolute top-0 left-0 w-4 h-4" style={{
                borderTop: `2px solid ${c.accent}`,
                borderLeft: `2px solid ${c.accent}`,
                borderRadius: "2px 0 0 0"
              }} />
              {/* BR corner */}
              <div className="absolute bottom-0 right-0 w-4 h-4" style={{
                borderBottom: `2px solid ${c.accent}`,
                borderRight: `2px solid ${c.accent}`,
                borderRadius: "0 0 2px 0"
              }} />

              <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                background: `${c.accent}15`,
                border: `1px solid ${c.accent}30`,
                boxShadow: `0 0 20px ${c.accent}15`
              }}>
                <c.icon className="w-5 h-5" style={{ color: c.accent }} />
              </div>

              <div className="font-mono text-[10px] tracking-[0.2em] mb-2" style={{ color: c.accent }}>
                {c.label}
              </div>
              <p className="font-heading text-sm font-semibold text-white leading-relaxed">
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
