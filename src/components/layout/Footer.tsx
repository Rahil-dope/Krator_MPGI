"use client";

import Link from "next/link";
import { Zap, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(5, 5, 8, 0.98)",
      borderTop: "1px solid rgba(155, 89, 255, 0.2)"
    }}>
      {/* Top gradient line */}
      <div className="neon-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                background: "linear-gradient(135deg, #9b59ff, #ff2d78)",
                boxShadow: "0 0 20px rgba(155,89,255,0.5)"
              }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-xl tracking-widest text-white" style={{ textShadow: "0 0 15px rgba(155,89,255,0.6)" }}>
                  KRATOS
                </div>
                <div className="text-[10px] font-mono tracking-[0.2em]" style={{ color: "#00f5ff" }}>
                  2026 // MPGI-SOE
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(232,224,255,0.5)" }}>
              Inter-Collegiate Technical Festival
              <br />
              MPGI School of Engineering
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase mb-4" style={{ color: "#9b59ff" }}>
              Navigate
            </h3>
            <div className="space-y-2">
              {[["Events", "/events"], ["Schedule", "/schedule"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm transition-all"
                  style={{ color: "rgba(232,224,255,0.5)", fontFamily: "var(--font-heading)", letterSpacing: "0.08em" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#00f5ff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,224,255,0.5)"; }}
                >
                  &gt; {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase mb-4" style={{ color: "#ff2d78" }}>
              Contact
            </h3>
            <div className="space-y-3">
              <a href="mailto:kratos@mpgi.edu" className="flex items-center gap-2 text-sm transition-all" style={{ color: "rgba(232,224,255,0.5)" }}>
                <Mail className="w-4 h-4" style={{ color: "#9b59ff" }} />
                kratos@mpgi.edu
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm" style={{ color: "rgba(232,224,255,0.5)" }}>
                <Phone className="w-4 h-4" style={{ color: "#9b59ff" }} />
                +91 98765 43210
              </a>
              <div className="flex gap-3 pt-1">
                <a href="#" className="transition-all" style={{ color: "rgba(232,224,255,0.4)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff2d78"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,224,255,0.4)"; }}>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="transition-all" style={{ color: "rgba(232,224,255,0.4)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00f5ff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,224,255,0.4)"; }}>
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="neon-line mt-10 mb-4" />
        <p className="text-center text-xs font-mono tracking-widest" style={{ color: "rgba(232,224,255,0.3)" }}>
          © 2026 KRATOS — MPGI SOE // ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
}
