"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getAllTeams, getEvents, updatePaymentStatus, markTeamCheckedIn, bulkUpdatePaymentStatus, bulkMarkCheckedIn } from "@/lib/firestore";
import type { Team, Event } from "@/lib/types";
import {
  Users, CheckCircle, XCircle, Download, Loader2,
  ChevronDown, ChevronUp, Search, ImageIcon
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "text-warning bg-warning/10 border-warning/30",
  approved: "text-success bg-success/10 border-success/30",
  rejected: "text-destructive bg-destructive/10 border-destructive/30",
};

export default function AdminRegistrationsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  
  // New features state
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [t, e] = await Promise.all([getAllTeams(), getEvents()]);
        setTeams(t);
        setEvents(e);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handlePaymentUpdate = async (teamId: string, status: "approved" | "rejected") => {
    setUpdatingPayment(teamId);
    try {
      await updatePaymentStatus(teamId, status);
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, paymentStatus: status } : t))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const handleCheckInToggle = async (teamId: string, currentStatus: boolean) => {
    try {
      await markTeamCheckedIn(teamId, !currentStatus);
      setTeams((prev) => prev.map(t => t.id === teamId ? { ...t, checkedIn: !currentStatus, checkedInAt: !currentStatus ? new Date() : undefined } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTeams.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedTeams);
      await bulkUpdatePaymentStatus(ids, "approved");
      setTeams((prev) => prev.map(t => ids.includes(t.id) ? { ...t, paymentStatus: "approved" } : t));
      setSelectedTeams(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkCheckIn = async () => {
    if (selectedTeams.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedTeams);
      await bulkMarkCheckedIn(ids, true);
      setTeams((prev) => prev.map(t => ids.includes(t.id) ? { ...t, checkedIn: true, checkedInAt: new Date() } : t));
      setSelectedTeams(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [["Name", "College", "Phone", "Event", "Team Code", "Payment Status"]];
    filteredTeams.forEach((t) => {
      t.members.forEach((m) => {
        rows.push([
          m.name,
          m.college,
          m.phone,
          t.eventName || "",
          t.teamCode,
          t.paymentStatus
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kratos-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTeams = teams.filter((t) => {
    // 1. Event filter
    if (filter !== "all" && t.eventId !== filter) return false;
    // 2. Payment filter
    if (paymentFilter !== "all" && t.paymentStatus !== paymentFilter) return false;
    // 3. Search query
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const matchTeamName = t.teamName.toLowerCase().includes(q);
      const matchTeamCode = t.teamCode.toLowerCase().includes(q);
      const matchMembers = t.members.some(m => 
        m.name.toLowerCase().includes(q) || 
        m.phone.includes(q) || 
        (m.email && m.email.toLowerCase().includes(q))
      );
      if (!matchTeamName && !matchTeamCode && !matchMembers) return false;
    }
    // 4. Attendance filter
    if (attendanceFilter !== "all") {
      if (attendanceFilter === "checkedIn" && !t.checkedIn) return false;
      if (attendanceFilter === "notArrived" && t.checkedIn) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Registrations</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, phone, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-neon-blue outline-none w-[220px]"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            <option value="all">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            <option value="all">All Attendance</option>
            <option value="checkedIn">Checked In</option>
            <option value="notArrived">Not Arrived</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="text-muted-foreground">{filteredTeams.length} teams</span>
        <span className="text-muted-foreground">
          {filteredTeams.reduce((s, t) => s + t.members.length, 0)} participants
        </span>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          No registrations found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeams.map((team) => {
            const isExpanded = expandedTeam === team.id;
            return (
              <div key={team.id} className="glass-card overflow-hidden">
                {/* Row */}
                <div
                  className="p-4 flex items-center justify-between hover:bg-white/5"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedTeams.has(team.id)}
                      onChange={(e) => {
                        const next = new Set(selectedTeams);
                        if (e.target.checked) next.add(team.id);
                        else next.delete(team.id);
                        setSelectedTeams(next);
                      }}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">{team.teamName}</h3>
                        <span className="text-xs text-muted-foreground font-mono">{team.teamCode}</span>
                        {team.checkedIn && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
                            Checked In
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{team.eventName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer" onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                      <Users className="w-3.5 h-3.5" />
                      {team.members.length}
                    </div>
                    <span 
                      className={`px-2 py-0.5 text-[10px] rounded-full border cursor-pointer ${statusColors[team.paymentStatus]}`}
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                    >
                      {team.paymentStatus}
                    </span>
                  </div>
                  <div className="pl-4 cursor-pointer" onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-4">
                    {/* Members */}
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Members</h4>
                    <div className="space-y-1 mb-4">
                      {team.members.map((m, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 text-xs p-2 rounded bg-background/30">
                          <span className="text-white font-medium">{m.name}</span>
                          <span className="text-muted-foreground">{m.college}</span>
                          <span className="text-muted-foreground">{m.branch}</span>
                          <span className="text-muted-foreground">{m.year}</span>
                          <span className="text-muted-foreground">{m.phone}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment */}
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Payment</h4>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      {team.transactionId && (
                        <span className="text-muted-foreground">
                          TXN: <span className="font-mono text-white">{team.transactionId}</span>
                        </span>
                      )}
                      {team.paymentProofURL && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewImage(team.paymentProofURL!); }}
                          className="flex items-center gap-1 text-neon-blue hover:bg-neon-blue/10 px-2 py-1 rounded text-xs transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          View Screenshot
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePaymentUpdate(team.id, "approved"); }}
                        disabled={updatingPayment === team.id || team.paymentStatus === "approved"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs hover:bg-success/20 disabled:opacity-50"
                      >
                        {updatingPayment === team.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve Payment
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePaymentUpdate(team.id, "rejected"); }}
                        disabled={updatingPayment === team.id || team.paymentStatus === "rejected"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs hover:bg-destructive/20 disabled:opacity-50"
                      >
                        {updatingPayment === team.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Reject Payment
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCheckInToggle(team.id, team.checkedIn || false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${team.checkedIn ? "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20" : "bg-neon-purple/10 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/20"}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {team.checkedIn ? "Undo Check-In" : "Mark as Checked-In"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-neon-pink p-2 bg-black/50 rounded-full"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <div className="relative w-full max-w-3xl h-[85vh]">
              <Image
                src={previewImage}
                alt="Payment Proof"
                fill
                className="object-contain rounded-lg border border-border shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Fixed Bar */}
      {selectedTeams.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-neon-blue/40 shadow-[0_0_30px_rgba(0,195,255,0.15)] rounded-full px-6 py-3 flex items-center gap-4 z-40">
          <span className="text-white text-sm font-medium mr-2">
            {selectedTeams.size} selected
          </span>
          <button 
            onClick={handleBulkApprove}
            disabled={bulkActionLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-success/10 text-success text-xs border border-success/30 hover:bg-success/20 transition-colors disabled:opacity-50"
          >
            {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Bulk Approve
          </button>
          <button 
            onClick={handleBulkCheckIn}
            disabled={bulkActionLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-neon-purple/10 text-neon-purple text-xs border border-neon-purple/30 hover:bg-neon-purple/20 transition-colors disabled:opacity-50"
          >
            {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Bulk Check-In
          </button>
          <button 
            onClick={() => setSelectedTeams(new Set())}
            className="p-1 text-muted-foreground hover:text-white rounded ml-2"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
