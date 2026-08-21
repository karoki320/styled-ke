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

// Fashion/retail colour names that aren't valid CSS colour keywords (or that
// mean something different in CSS) get mapped to a real hex value here.
// Anything not listed falls through to being used as a literal CSS colour
// name — that covers "Black", "Red", "Navy", "Maroon", "Beige" etc. for
// free, since those already are standard CSS colour keywords.
const COLOR_NAME_OVERRIDES: Record<string, string> = {
  cream: "#f5ecd9",
  charcoal: "#36454f",
  camel: "#c19a6b",
  nude: "#e3bc9a",
  wine: "#722f37",
  "wine red": "#722f37",
  mustard: "#ffdb58",
  rust: "#b7410e",
  emerald: "#50c878",
  "royal blue": "#4169e1",
  "sky blue": "#87ceeb",
  "baby blue": "#89cff0",
  "baby pink": "#f4c2c2",
  "hot pink": "#ff69b4",
  fuchsia: "#ff00ff",
  lilac: "#c8a2c8",
  mint: "#98ff98",
  "mint green": "#98ff98",
  peach: "#ffe5b4",
  khaki: "#c3b091",
  taupe: "#483c32",
  denim: "#1560bd",
  ankara: "#d97b29",
  multicolor: "conic-gradient(from 0deg, #e63946, #f4a340, #ffd60a, #52b788, #4361ee, #7209b7, #e63946)",
  multicoloured: "conic-gradient(from 0deg, #e63946, #f4a340, #ffd60a, #52b788, #4361ee, #7209b7, #e63946)",
  multicolour: "conic-gradient(from 0deg, #e63946, #f4a340, #ffd60a, #52b788, #4361ee, #7209b7, #e63946)",
};

/** Best-effort CSS colour (or gradient) for a free-text colour name a shop
 * owner typed in, e.g. "Ankara Print" or "Baby Blue" — used to render an
 * actual colour swatch next to the name rather than showing customers a
 * plain text label and making them guess what it looks like. Falls back to
 * the raw name, which works for any standard CSS colour keyword (most
 * single-word colours already are one); an unrecognised name just renders
 * an empty swatch, which is a safe, non-broken fallback. */
export function colorToCss(name: string): string {
  const key = name.trim().toLowerCase();
  return COLOR_NAME_OVERRIDES[key] || key;
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
