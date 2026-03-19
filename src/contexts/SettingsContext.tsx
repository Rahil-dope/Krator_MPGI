"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getGlobalSettings } from "@/lib/firestore";
import type { GlobalSettings } from "@/lib/types";

interface SettingsContextType {
  settings: GlobalSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getGlobalSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load global settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
