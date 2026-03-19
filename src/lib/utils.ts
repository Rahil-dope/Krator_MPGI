import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTeamCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatCurrency(amount: number): string {
  return `₹${amount}`;
}

export function getFeePerPerson(): number {
  return parseInt(process.env.NEXT_PUBLIC_FEE_PER_PERSON || "69", 10);
}

export function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isRegistrationOpen(): boolean {
  const deadline = new Date("2026-04-08T23:59:59+05:30");
  return new Date() < deadline;
}

export function getUpiId(): string {
  return process.env.NEXT_PUBLIC_UPI_ID || "kratos2026@upi";
}
