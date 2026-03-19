"use client";

import { useState, useEffect } from "react";
import { DUMMY_EVENTS } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Event> & { rulesStr?: string }>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    category: "tech" as Event["category"],
    minTeamSize: 1,
    maxTeamSize: 2,
    isActive: true,
    prize: "",
    venue: "",
    coordinatorName: "",
    coordinatorPhone: "",
    rulesStr: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.length > 0 ? data : DUMMY_EVENTS.map((e, i) => ({ ...e, id: `dummy-${i}` })));
        } else {
          setEvents(DUMMY_EVENTS.map((e, i) => ({ ...e, id: `dummy-${i}` })));
        }
      } catch {
        setEvents(DUMMY_EVENTS.map((e, i) => ({ ...e, id: `dummy-${i}` })));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAdd = async () => {
    try {
      const { rulesStr, ...rest } = newEvent;
      const finalEvent = {
        ...rest,
        rules: rulesStr.split("\n").map(r => r.trim()).filter(Boolean),
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalEvent),
      });
      if (res.ok) {
        const created = await res.json();
        setEvents([...events, created]);
        setShowAdd(false);
        setNewEvent({ name: "", description: "", category: "tech", minTeamSize: 1, maxTeamSize: 2, isActive: true, prize: "", venue: "", coordinatorName: "", coordinatorPhone: "", rulesStr: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { rulesStr, ...rest } = editData;
      const finalUpdates: Partial<Event> = { ...rest };
      if (rulesStr !== undefined) {
        finalUpdates.rules = rulesStr.split("\n").map(r => r.trim()).filter(Boolean);
      }
      
      if (!id.startsWith("dummy-")) {
        const res = await fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalUpdates),
        });
        if (!res.ok) throw new Error("Update failed");
      }
      setEvents(events.map((e) => (e.id === id ? { ...e, ...finalUpdates } : e)));
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      if (!id.startsWith("dummy-")) {
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
      }
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Events</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-white text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="glass-card p-6 mb-6 space-y-3">
          <h3 className="font-semibold text-white">New Event</h3>
          <input
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            placeholder="Event Name"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
          />
          <textarea
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue resize-none"
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as Event["category"] })}
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
            >
              <option value="tech">Tech</option>
              <option value="gaming">Gaming</option>
              <option value="hardware">Hardware</option>
              <option value="creative">Creative</option>
            </select>
            <input
              type="number"
              value={newEvent.minTeamSize}
              onChange={(e) => setNewEvent({ ...newEvent, minTeamSize: parseInt(e.target.value) })}
              placeholder="Min Team"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
            />
            <input
              type="number"
              value={newEvent.maxTeamSize}
              onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: parseInt(e.target.value) })}
              placeholder="Max Team"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newEvent.prize}
              onChange={(e) => setNewEvent({ ...newEvent, prize: e.target.value })}
              placeholder="Prize Pool"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
            />
            <input
              value={newEvent.venue}
              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              placeholder="Venue"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
            />
            <input
              value={newEvent.coordinatorName}
              onChange={(e) => setNewEvent({ ...newEvent, coordinatorName: e.target.value })}
              placeholder="Coordinator Name"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
            />
            <input
              value={newEvent.coordinatorPhone}
              onChange={(e) => setNewEvent({ ...newEvent, coordinatorPhone: e.target.value })}
              placeholder="Coordinator Phone"
              className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
            />
          </div>
          <textarea
            value={newEvent.rulesStr}
            onChange={(e) => setNewEvent({ ...newEvent, rulesStr: e.target.value })}
            placeholder="Rules (one per line)"
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-neon-blue text-white text-sm">
              <Save className="w-4 h-4 inline mr-1" /> Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="glass-card p-4">
            {editing === event.id ? (
              <div className="space-y-2">
                <input
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
                />
                <textarea
                  value={editData.description ?? ""}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editData.prize ?? ""}
                    onChange={(e) => setEditData({ ...editData, prize: e.target.value })}
                    placeholder="Prize Pool"
                    className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
                  />
                  <input
                    value={editData.venue ?? ""}
                    onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
                    placeholder="Venue"
                    className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
                  />
                  <input
                    value={editData.coordinatorName ?? ""}
                    onChange={(e) => setEditData({ ...editData, coordinatorName: e.target.value })}
                    placeholder="Coordinator Name"
                    className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
                  />
                  <input
                    value={editData.coordinatorPhone ?? ""}
                    onChange={(e) => setEditData({ ...editData, coordinatorPhone: e.target.value })}
                    placeholder="Coordinator Phone"
                    className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm"
                  />
                </div>
                <textarea
                  value={editData.rulesStr ?? ""}
                  onChange={(e) => setEditData({ ...editData, rulesStr: e.target.value })}
                  placeholder="Rules (one per line)"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleSaveEdit(event.id)} className="px-3 py-1.5 rounded bg-neon-blue text-white text-xs">
                    <Save className="w-3.5 h-3.5 inline mr-1" /> Save
                  </button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded border border-border text-muted-foreground text-xs">
                    <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{event.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${event.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.category} • {event.minTeamSize}-{event.maxTeamSize} members</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { 
                      setEditing(event.id); 
                      setEditData({ 
                        name: event.name, 
                        description: event.description,
                        prize: event.prize,
                        venue: event.venue,
                        coordinatorName: event.coordinatorName,
                        coordinatorPhone: event.coordinatorPhone,
                        rulesStr: event.rules?.join("\n") || ""
                      }); 
                    }}
                    className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
