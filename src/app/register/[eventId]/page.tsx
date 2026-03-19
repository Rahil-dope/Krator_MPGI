"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  createTeam,
  getUserEventRegistration,
  uploadPaymentProof,
  getEvent,
} from "@/lib/firestore";
import {
  formatCurrency,
  getFeePerPerson,
} from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
  Trophy,
  MapPin,
  UserCircle
} from "lucide-react";
import type { TeamMember, Event } from "@/lib/types";
import toast from "react-hot-toast";

export default function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [eventId, setEventId] = useState<string>("");
  const [step, setStep] = useState(1); // 1: Details, 2: Team Info, 3: Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [memberDetails, setMemberDetails] = useState<TeamMember>({
    name: "",
    college: "",
    branch: "",
    year: "",
    phone: "",
    email: user?.email || "",
  });

  // Payment state
  const [transactionId, setTransactionId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // Team result
  const [createdTeamCode, setCreatedTeamCode] = useState("");
  const [createdTeamId, setCreatedTeamId] = useState("");

  const [event, setEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      getEvent(p.eventId).then(e => {
         // Fallback to fetch from DUMMY if id starts with "dummy-" ?
         // For now, assume it's correctly populated in firestore
         setEvent(e);
         setEventLoading(false);
      }).catch(err => {
         console.error(err);
         setEventLoading(false);
      });
    });
  }, [params]);

  const fee = getFeePerPerson();
  const regOpen = settings?.registrationOpen ?? false;

  // Check if already registered
  useEffect(() => {
    if (user && eventId) {
      getUserEventRegistration(user.uid, eventId).then((reg) => {
        if (reg) setAlreadyRegistered(true);
      }).catch(() => {});
    }
  }, [user, eventId]);

  useEffect(() => {
    if (user) {
      setMemberDetails((prev) => ({
        ...prev,
        email: user.email || "",
        name: user.displayName || "",
      }));
    }
  }, [user]);

  if (authLoading || settingsLoading || eventLoading) {
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
          <p className="text-muted-foreground mb-6">You need to sign in to register for events.</p>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 transition-opacity"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <button onClick={() => router.push("/events")} className="text-neon-blue hover:underline mt-4">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!regOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Registration Closed</h2>
          <p className="text-muted-foreground">The registration deadline has passed.</p>
        </div>
      </div>
    );
  }

  if (alreadyRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Already Registered</h2>
          <p className="text-muted-foreground mb-4">You&apos;re already registered for this event.</p>
          <button onClick={() => router.push("/dashboard")} className="text-neon-blue hover:underline">
            Go to Dashboard
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
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-muted-foreground mb-4">You&apos;ve registered for {event.name}.</p>
          {createdTeamCode && (
            <div className="glass p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground mb-2">Share this code with your teammates:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-neon-blue tracking-widest">
                  {createdTeamCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(createdTeamCode)}
                  className="p-1.5 rounded hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          <button onClick={() => router.push("/dashboard")} className="text-neon-blue hover:underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCreateTeam = async () => {
    if (!memberDetails.name || !memberDetails.college || !memberDetails.branch || !memberDetails.year || !memberDetails.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    if (memberDetails.phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (memberDetails.college.length < 2) {
      toast.error("Enter a valid college name");
      return;
    }
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    setIsSubmitting(true);
    try {
      const team = await createTeam(
        eventId,
        event.name,
        teamName,
        user.uid,
        user.email || "",
        { ...memberDetails, uid: user.uid }
      );
      setCreatedTeamCode(team.teamCode);
      setCreatedTeamId(team.id);
      toast.success("Team created successfully!");
      setStep(3);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentFile) {
      toast.error("Please upload payment screenshot");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }
    setIsSubmitting(true);
    try {
      await uploadPaymentProof(createdTeamId, paymentFile, transactionId);
      setSuccess(true);
      toast.success("Registration complete!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFee = fee * event.maxTeamSize;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push("/events")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div className="glass-card p-4 mb-6">
          <h1 className="font-heading text-2xl font-bold text-white">{event.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span>Team: {event.minTeamSize}-{event.maxTeamSize}</span>
            <span>Fee: {formatCurrency(fee)}/person</span>
          </div>
          
          {(event.prize || event.venue || event.coordinatorName) && (
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1.5 text-xs font-mono text-neon-blue/80">
              {event.prize && <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5"/> Prize: {event.prize}</div>}
              {event.venue && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> Venue: {event.venue}</div>}
              {(event.coordinatorName || event.coordinatorPhone) && (
                <div className="flex items-center gap-2">
                  <UserCircle className="w-3.5 h-3.5"/> 
                  Coordinator: {event.coordinatorName} {event.coordinatorPhone && `(${event.coordinatorPhone})`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-neon-blue text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              <span className={`text-xs hidden sm:inline ${step >= s ? "text-white" : "text-muted-foreground"}`}>
                {s === 1 ? "Team Info" : s === 2 ? "Details" : "Payment"}
              </span>
              {s < 3 && <div className={`flex-1 h-px ${step > s ? "bg-neon-blue" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Team Name */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-white">Create Your Team</h2>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Team Name *</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Code Crushers"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>
            <button
              onClick={() => { if (teamName.trim()) { setStep(2); } else { toast.error("Enter team name"); } }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Member Details */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-white">Your Details (Team Leader)</h2>
            {(["name", "college", "branch", "year", "phone"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm text-muted-foreground mb-1.5 capitalize">{field} *</label>
                <input
                  type={field === "phone" ? "tel" : "text"}
                  value={memberDetails[field]}
                  onChange={(e) => setMemberDetails({ ...memberDetails, [field]: e.target.value })}
                  placeholder={
                    field === "name" ? "Full Name" :
                    field === "college" ? "College Name" :
                    field === "branch" ? "e.g., Computer Science" :
                    field === "year" ? "e.g., 2nd Year" :
                    "Phone Number"
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Team <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-white">Payment</h2>

            {/* Team Code display */}
            {createdTeamCode && (
              <div className="glass p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Team Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold text-neon-blue tracking-widest">
                    {createdTeamCode}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdTeamCode)}
                    className="p-1.5 rounded hover:bg-white/10"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Share this with teammates to join</p>
              </div>
            )}

            <div className="glass p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Pay via UPI:</p>
                <p className="text-lg font-mono text-neon-blue font-bold tracking-wider">{settings?.upiId || "UPI ID Not Set"}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Amount: <span className="text-white font-semibold">{formatCurrency(fee)}</span> per person
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total for Team: <span className="text-white font-semibold">{formatCurrency(totalFee)}</span> (max capacity)</p>
              </div>
              {settings?.upiQR && (
                <div className="shrink-0 w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center border-2 border-neon-blue/30 shadow-[0_0_15px_rgba(0,195,255,0.2)]">
                  <img src={settings.upiQR} alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Transaction ID *</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter UPI transaction ID"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Payment Screenshot *</label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-lg border-2 border-dashed border-border hover:border-neon-blue/50 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {paymentFile ? paymentFile.name : "Click to upload screenshot"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSuccess(true)}
                className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-white transition-colors"
              >
                Skip (Pay Later)
              </button>
              <button
                onClick={handlePayment}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Payment <CheckCircle className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
