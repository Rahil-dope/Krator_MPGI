"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTeamByCode, joinTeam, getEvent, getUserEventRegistration } from "@/lib/firestore";
import type { Team, TeamMember } from "@/lib/types";
import { Search, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";

export default function JoinTeamPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [teamCode, setTeamCode] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const [eventName, setEventName] = useState("");
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  const [details, setDetails] = useState<TeamMember>({
    name: "",
    college: "",
    branch: "",
    year: "",
    phone: "",
    email: user?.email || "",
  });

  const handleSearch = async () => {
    if (!teamCode.trim()) { toast.error("Enter a team code"); return; }
    setSearching(true);
      try {
      const found = await getTeamByCode(teamCode.toUpperCase());
      if (!found) { toast.error("Team not found"); setTeam(null); return; }
      if (found.isLocked) { toast.error("This team is locked"); setTeam(null); return; }

      const event = await getEvent(found.eventId);
      if (event && found.members.length >= event.maxTeamSize) {
        toast.error("Team is full");
        setTeam(null);
        return;
      }

      if (user) {
        const existing = await getUserEventRegistration(user.uid, found.eventId);
        if (existing) { toast.error("You're already registered for this event"); setTeam(null); return; }
      }

      setTeam(found);
      setEventName(found.eventName || "Unknown Event");
      setDetails((d) => ({
        ...d,
        name: user?.displayName || "",
        email: user?.email || "",
      }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!team || !user) return;
    if (!details.name || !details.college || !details.branch || !details.year || !details.phone) {
      toast.error("Fill in all fields");
      return;
    }
    if (details.phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (details.college.length < 2) {
      toast.error("Enter a valid college name");
      return;
    }
    
    setJoining(true);
    try {
      await joinTeam(team.id, user.uid, { ...details, uid: user.uid });
      setSuccess(true);
      toast.success("Joined team successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join team");
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  if (!settings?.registrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Registration Closed</h2>
          <p className="text-muted-foreground">The registration deadline has passed.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Sign in to join a team.</p>
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Joined Successfully!</h2>
          <p className="text-muted-foreground mb-4">You&apos;ve joined team {team?.teamName} for {eventName}.</p>
          <button onClick={() => router.push("/dashboard")} className="text-neon-blue hover:underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6 text-center">
          Join a <span className="gradient-text">Team</span>
        </h1>

        {/* Search */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-sm text-muted-foreground mb-1.5">Enter Team Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={6}
              className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-white font-mono tracking-widest text-center uppercase placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2.5 rounded-lg bg-neon-blue text-white hover:opacity-90 disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Team Found */}
        {team && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-white">{team.teamName}</h2>
                <p className="text-sm text-muted-foreground">{eventName}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {team.members.length} members
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <h3 className="text-sm font-medium text-white mb-3">Your Details</h3>
              {(["name", "college", "branch", "year", "phone"] as const).map((field) => (
                <div key={field} className="mb-3">
                  <label className="block text-xs text-muted-foreground mb-1 capitalize">{field} *</label>
                  <input
                    type={field === "phone" ? "tel" : "text"}
                    value={details[field]}
                    onChange={(e) => setDetails({ ...details, [field]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-neon-blue"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join Team <CheckCircle className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
