"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Zap, LogIn, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/schedule", label: "Schedule" },
];

export default function Navbar() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: "rgba(5, 5, 8, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(155, 89, 255, 0.3)",
      boxShadow: "0 4px 30px rgba(155, 89, 255, 0.1)"
    }}>
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{
        background: "linear-gradient(90deg, #9b59ff, #ff2d78, #00f5ff, #ffe600, #9b59ff)",
        backgroundSize: "200% 100%",
        animation: "gradientFlow 3s linear infinite"
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{
              background: "linear-gradient(135deg, #9b59ff, #ff2d78)",
              boxShadow: "0 0 15px rgba(155, 89, 255, 0.6)"
            }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-bold text-xl tracking-widest text-white"
                style={{ textShadow: "0 0 20px rgba(155, 89, 255, 0.8)" }}>
                KRATOS
              </span>
              <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: "#00f5ff" }}>
                2026 // TECH FEST
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-heading font-semibold tracking-widest uppercase transition-all"
                style={{ color: "rgba(232, 224, 255, 0.7)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#9b59ff";
                  e.currentTarget.style.textShadow = "0 0 10px rgba(155, 89, 255, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(232, 224, 255, 0.7)";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "rgba(155,89,255,0.3)" }} />
            ) : user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider rounded" style={{
                    background: "rgba(255, 45, 120, 0.1)",
                    border: "1px solid rgba(255, 45, 120, 0.4)",
                    color: "#ff2d78",
                    textShadow: "0 0 8px rgba(255, 45, 120, 0.5)"
                  }}>
                    <Shield className="w-3.5 h-3.5" />
                    ADMIN
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold tracking-wider uppercase rounded transition-all" style={{
                  background: "rgba(155, 89, 255, 0.1)",
                  border: "1px solid rgba(155, 89, 255, 0.3)",
                  color: "#9b59ff"
                }}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" style={{ border: "2px solid rgba(155,89,255,0.5)" }} />
                )}
                <button onClick={signOut} title="Sign Out" className="p-1.5 rounded transition-all" style={{ color: "rgba(232,224,255,0.5)" }}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm tracking-widest uppercase">
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
          
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2" style={{ color: "#9b59ff" }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          background: "rgba(5, 5, 8, 0.98)",
          borderTop: "1px solid rgba(155, 89, 255, 0.2)"
        }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-heading font-semibold tracking-widest uppercase transition-all rounded"
                style={{ color: "rgba(232,224,255,0.7)" }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2" style={{ borderTop: "1px solid rgba(155,89,255,0.2)" }}>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-heading uppercase tracking-wider" style={{ color: "#9b59ff" }}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider" style={{ color: "#ff2d78" }}>
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3 text-sm" style={{ color: "rgba(232,224,255,0.5)" }}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <button onClick={() => { signInWithGoogle(); setMobileOpen(false); }} className="btn-primary flex items-center gap-2 w-full px-4 py-3 text-sm tracking-widest uppercase justify-center mt-2">
                  <LogIn className="w-4 h-4" /> Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
