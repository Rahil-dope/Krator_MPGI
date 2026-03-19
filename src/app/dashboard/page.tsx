"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Team } from "@/lib/types";
import {
  LayoutDashboard, Users, Copy, Lock, Upload, CheckCircle,
  Clock, XCircle, Loader2, ArrowRight, Share2, ExternalLink
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatCurrency, getFeePerPerson } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

const statusColors: Record<string, string> = {
  pending: "text-warning bg-warning/10 border-warning/30",
  approved: "text-success bg-success/10 border-success/30",
  rejected: "text-destructive bg-destructive/10 border-destructive/30",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function DashboardPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockingTeam, setLockingTeam] = useState<string | null>(null);
  
  // Inline payment state
  const [uploadingPayment, setUploadingPayment] = useState<string | null>(null);
  const [paymentFiles, setPaymentFiles] = useState<Record<string, File>>({});
  const [transactionIds, setTransactionIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLockTeam = async (teamId: string) => {
    setLockingTeam(teamId);
    try {
      const res = await fetch("/api/teams/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lock error");
      }
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, isLocked: true } : t))
      );
      toast.success("Team locked successfully! You can now proceed to payment.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lock error");
    } finally {
      setLockingTeam(null);
    }
  };

  const handleUploadPayment = async (teamId: string) => {
    const file = paymentFiles[teamId];
    const txnId = transactionIds[teamId];
    if (!file) { toast.error("Please select a screenshot first."); return; }
    if (!txnId) { toast.error("Please enter the transaction ID."); return; }

    setUploadingPayment(teamId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", teamId);
      formData.append("transactionId", txnId);
      formData.append("type", "payment");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload error");
      }
      const { url } = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, paymentProofURL: url, transactionId: txnId, paymentStatus: "pending" } : t))
      );
      toast.success("Payment proof uploaded successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingPayment(null);
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Sign in to view your dashboard.</p>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-6 h-6 text-neon-blue" />
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Welcome */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-4">
            {user.image && (
              <Image src={user.image} alt="" width={48} height={48} className="w-12 h-12 rounded-full border border-border object-cover" />
            )}
            <div>
              <h2 className="font-semibold text-white">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/events"
            className="glass-card p-4 flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <span className="text-sm text-white">Register for Event</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
          </Link>
          <Link
            href="/join-team"
            className="glass-card p-4 flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <span className="text-sm text-white">Join a Team</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
          </Link>
        </div>

        {/* Teams */}
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-blue" />
          My Registrations
        </h2>

        {loading ? (
          <div className="glass-card p-8 text-center">
            <Loader2 className="w-6 h-6 text-neon-blue animate-spin mx-auto" />
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No registrations yet.</p>
            <Link href="/events" className="text-neon-blue hover:underline text-sm mt-2 inline-block">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => {
              const StatusIcon = statusIcons[team.paymentStatus] || Clock;
              const isLeader = team.leaderId === user.id;

              return (
                <div key={team.id} className="glass-card p-6">
                  {/* Team Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground text-xl">{team.teamName}</h3>
                      <p className="text-sm text-muted-foreground">{team.eventName}</p>
                    </div>
                    <div className="flex shrink-0">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-lg border ${statusColors[team.paymentStatus]}`}>
                        <StatusIcon className="w-4 h-4" />
                        {team.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Team Code & Share */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-border bg-background/50">
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <span className="font-mono font-bold text-neon-blue tracking-widest text-lg">{team.teamCode}</span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(team.teamCode);
                          toast.success("Team code copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:text-foreground hover:bg-surface transition-colors"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Join my team for KRATOS 2026. Code: ${team.teamCode}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs hover:bg-[#25D366]/20 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mb-6">
                    <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">Members ({team.members.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team.members.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30">
                          <div>
                            <span className="text-sm font-medium text-foreground block">{m.name} {m.userId === team.leaderId && <span className="text-[10px] text-neon-purple ml-2 border border-neon-purple/30 bg-neon-purple/10 px-1.5 py-0.5 rounded">LEADER</span>}</span>
                            <span className="text-xs text-muted-foreground">{m.college}</span>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{m.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Upload or Preview */}
                  {team.isLocked && team.paymentStatus === "pending" && !team.paymentProofURL && isLeader && (
                    <div className="mb-6 p-4 rounded-xl border border-neon-blue/30 bg-neon-blue/5">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-neon-blue" /> Pending Payment
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Pay via UPI:</p>
                          <p className="font-mono text-neon-blue font-bold tracking-wider">{settings?.upiId || "UPI ID Not Set"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Amount: <span className="text-foreground font-medium">{formatCurrency(getFeePerPerson() * team.members.length)}</span></p>
                        </div>
                        {settings?.upiQR && (
                          <div className="relative shrink-0 w-24 h-24 bg-white p-1.5 rounded-xl flex items-center justify-center border-2 border-neon-blue/30 shadow-[0_0_10px_rgba(0,195,255,0.15)]">
                            <Image src={settings.upiQR} alt="UPI QR" fill className="object-contain p-1" />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Transaction ID"
                          value={transactionIds[team.id] || ""}
                          onChange={(e) => setTransactionIds({ ...transactionIds, [team.id]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:border-neon-blue outline-none"
                        />
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-neon-blue/50 cursor-pointer transition-colors bg-background">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {paymentFiles[team.id] ? paymentFiles[team.id].name : "Upload Screenshot"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setPaymentFiles({ ...paymentFiles, [team.id]: f });
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        onClick={() => handleUploadPayment(team.id)}
                        disabled={uploadingPayment === team.id}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploadingPayment === team.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Payment"}
                      </button>
                    </div>
                  )}

                  {team.paymentProofURL && (
                    <div className="mb-6">
                      <a href={team.paymentProofURL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-neon-blue hover:underline">
                        <ExternalLink className="w-4 h-4" /> View Payment Screenshot
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  {isLeader && !team.isLocked && (
                    <div className="flex gap-2 pt-4 border-t border-border/50">
                      <button
                        onClick={() => handleLockTeam(team.id)}
                        disabled={lockingTeam === team.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 transition-colors"
                      >
                        {lockingTeam === team.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Lock Team to Pay
                      </button>
                      <p className="text-xs text-muted-foreground flex items-center ml-2">
                        Lock team once all members have joined.
                      </p>
                    </div>
                  )}
                  {team.isLocked && (
                    <div className="pt-4 border-t border-border/50">
                       <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                         <Lock className="w-3.5 h-3.5" />
                         Team Locked
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
