"use client";

import { useState, useEffect } from "react";
import { getAllTeams, getEvents } from "@/lib/firestore";
import type { Team, Event } from "@/lib/types";
import { BarChart3, Users, Clock, CheckCircle, IndianRupee, Loader2, Download } from "lucide-react";
import { formatCurrency, getFeePerPerson } from "@/lib/utils";

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState("all");

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

  const displayTeams = selectedEventId === "all" ? teams : teams.filter(t => t.eventId === selectedEventId);

  const totalMembers = displayTeams.reduce((sum, t) => sum + t.members.length, 0);
  const pendingCount = displayTeams.filter((t) => t.paymentStatus === "pending").length;
  const approvedTeams = displayTeams.filter((t) => t.paymentStatus === "approved");
  const approvedMembers = approvedTeams.reduce((sum, t) => sum + t.members.length, 0);
  
  const fee = getFeePerPerson();
  const estimatedRevenue = totalMembers * fee;
  const verifiedRevenue = approvedMembers * fee;

  const stats = [
    { label: "Total Teams", value: displayTeams.length.toString(), icon: Users, color: "text-neon-blue" },
    { label: "Total Participants", value: totalMembers.toString(), icon: BarChart3, color: "text-neon-purple" },
    { label: "Pending Payments", value: pendingCount.toString(), icon: Clock, color: "text-warning" },
    { label: "Verified Teams", value: approvedTeams.length.toString(), icon: CheckCircle, color: "text-success" },
    { label: "Expected Revenue", value: formatCurrency(estimatedRevenue), icon: IndianRupee, color: "text-muted-foreground" },
    { label: "Verified Revenue", value: formatCurrency(verifiedRevenue), icon: IndianRupee, color: "text-success" },
  ];

  const exportCSV = () => {
    const rows = [["Name", "College", "Phone", "Event", "Team Code", "Payment Status", "Checked In"]];
    displayTeams.forEach((t) => {
      t.members.forEach((m) => {
        rows.push([
          m.name,
          m.college,
          m.phone,
          t.eventName || "",
          t.teamCode,
          t.paymentStatus,
          t.checkedIn ? "Yes" : "No"
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const prefix = selectedEventId === "all" ? "all-events" : events.find(e => e.id === selectedEventId)?.name.replace(/\s+/g, '-').toLowerCase() || "event";
    a.download = `kratos-${prefix}-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Admin Dashboard</h1>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-neon-blue outline-none"
          >
            <option value="all">All Events Overview</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 text-sm transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-event breakdown (Only on 'All Events' view) */}
      {selectedEventId === "all" && (
        <>
          <h2 className="font-heading text-lg font-semibold text-white mb-4">By Event</h2>
          <div className="space-y-2">
            {events.length > 0 ? events.map((event) => {
              const eventTeams = teams.filter((t) => t.eventId === event.id);
              const eventMembers = eventTeams.reduce((s, t) => s + t.members.length, 0);
              const eventVerified = eventTeams.filter(t => t.paymentStatus === 'approved').reduce((s, t) => s + t.members.length, 0) * fee;
              return (
                <div key={event.id} className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">{event.name}</h3>
                    <p className="text-xs text-muted-foreground">{event.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-white">{eventTeams.length}</div>
                      <div className="text-[10px] text-muted-foreground">Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-white">{eventMembers}</div>
                      <div className="text-[10px] text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-success">{formatCurrency(eventVerified)}</div>
                      <div className="text-[10px] text-muted-foreground">Verified</div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground">No events in Firestore yet. Events use dummy data until seeded.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
