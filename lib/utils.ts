import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Business WhatsApp number (E.164, no +) — used to build wa.me links. */
export const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254734807511";
export const WA_DISPLAY = "0734 807 511";

/** Build a wa.me deep link with an optional pre-filled message. */
export function waLink(msg = ""): string {
  return `https://wa.me/${WA_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
}

/** Format an amount in Kenyan Shillings, e.g. fmtKES(1500) -> "KES 1,500". */
export function fmtKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateOrderNumber(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `#SK-${n}`;
}
