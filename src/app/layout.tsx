import type { Metadata } from "next";
import { Rajdhani, Inter, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "react-hot-toast";

const rajdhani = Rajdhani({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-rajdhani", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech-mono", display: "swap" });

export const metadata: Metadata = {
  title: "KRATOS 2026 | Inter-Collegiate Technical Festival",
  description:
    "KRATOS 2026 — The ultimate inter-collegiate technical festival by MPGI School of Engineering. Compete in coding, gaming, hardware, and creative events.",
  keywords: ["KRATOS", "tech fest", "college", "MPGI", "coding", "hackathon", "gaming", "2026"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${inter.variable} ${shareTechMono.variable}`}>
      <head />
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <SettingsProvider>
              <Navbar />
              <main className="pt-16">{children}</main>
              <Footer />
            </SettingsProvider>
          </AuthProvider>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
