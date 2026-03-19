"use client";

import { useState, useEffect } from "react";
import type { GlobalSettings } from "@/lib/types";
import { Settings, Save, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({
    registrationOpen: false,
    registrationDeadline: null,
    upiId: "",
    upiQR: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            registrationOpen: data.registrationOpen,
            registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
            upiId: data.upiId || "",
            upiQR: data.upiQR || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...settings };

      // Upload QR first if selected
      if (qrFile) {
        const formData = new FormData();
        formData.append("file", qrFile);
        formData.append("type", "upiQR");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          updates.upiQR = url;
        }
      }

      // Save settings
      const settingsPayload: Record<string, string | boolean> = {
        registrationOpen: updates.registrationOpen ?? false,
        upiId: updates.upiId || "",
        upiQR: updates.upiQR || "",
      };
      if (updates.registrationDeadline) {
        settingsPayload.registrationDeadline = updates.registrationDeadline instanceof Date
          ? updates.registrationDeadline.toISOString()
          : String(updates.registrationDeadline);
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsPayload),
      });

      if (res.ok) {
        setSettings(updates);
        setQrFile(null);
        toast.success("Settings saved successfully!");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-neon-blue" />
        <h1 className="font-heading text-2xl font-bold text-foreground">Global Settings</h1>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* Registration Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
          <div>
            <h3 className="font-semibold text-foreground">Registration Open</h3>
            <p className="text-sm text-muted-foreground">Toggle platform-wide registrations on/off</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.registrationOpen || false}
              onChange={(e) => setSettings({ ...settings, registrationOpen: e.target.checked })}
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-blue"></div>
          </label>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Registration Deadline</label>
          <input
            type="datetime-local"
            value={settings.registrationDeadline ? new Date(settings.registrationDeadline.getTime() - (settings.registrationDeadline.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
            onChange={(e) => setSettings({ ...settings, registrationDeadline: e.target.value ? new Date(e.target.value) : null })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:border-neon-blue outline-none"
          />
        </div>

        {/* UPI Details */}
        <div className="pt-6 border-t border-border/50">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Payment Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">UPI ID</label>
              <input
                type="text"
                value={settings.upiId || ""}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                placeholder="e.g., yourupi@bank"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:border-neon-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">UPI QR Code</label>
              <div className="flex items-start gap-4">
                {(qrFile || settings.upiQR) && (
                  <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs from createObjectURL are not supported by next/image */}
                    <img
                      src={qrFile ? URL.createObjectURL(qrFile) : settings.upiQR ?? ""}
                      alt="QR Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center px-4 py-6 rounded-lg border-2 border-dashed border-border hover:border-neon-blue/50 cursor-pointer transition-colors bg-background">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-foreground font-medium">Click to upload new QR</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, static image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-6 border-t border-border/50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neon-blue text-white font-medium hover:opacity-90 disabled:opacity-50 min-w-[120px]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Changes <Save className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
