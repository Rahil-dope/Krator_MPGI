"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8 rounded-full" style={{ background: "rgba(155,89,255,0.1)" }} />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full transition-all duration-300 flex items-center justify-center relative group overflow-hidden"
      style={{
        background: theme === "dark" ? "rgba(155, 89, 255, 0.1)" : "rgba(255, 45, 120, 0.1)",
        border: `1px solid ${theme === "dark" ? "rgba(155, 89, 255, 0.3)" : "rgba(255, 45, 120, 0.3)"}`,
      }}
      aria-label="Toggle theme"
    >
      <Sun className={`w-4 h-4 absolute transition-all duration-300 ${theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-secondary"}`} />
      <Moon className={`w-4 h-4 transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0 scale-100 text-neon-purple" : "opacity-0 -rotate-90 scale-50"}`} />
    </button>
  );
}
