"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, BarChart3, Calendar, Users, Loader2, LogOut, Settings as SettingsIcon } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don&apos;t have admin access.</p>
          <Link href="/" className="text-neon-blue hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-5 h-5 text-neon-purple" />
            <span className="font-heading font-bold text-white">Admin Panel</span>
          </div>

          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground mb-2">{user.email}</div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                  isActive ? "text-neon-blue" : "text-muted-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 pb-20 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
