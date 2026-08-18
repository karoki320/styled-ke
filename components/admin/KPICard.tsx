import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "hero" | "gold" | "ink" | "line";

const TONE_STYLES: Record<Tone, { card: string; badge: string; value: string; label: string }> = {
  hero: {
    card: "bg-black text-white",
    badge: "bg-gold/15 text-gold",
    value: "text-white",
    label: "text-white/45",
  },
  gold: {
    card: "bg-gradient-to-br from-gold/[0.08] to-transparent text-black border-t-2 border-t-gold",
    badge: "bg-gold/15 text-gold-hover",
    value: "text-black",
    label: "text-gray-400",
  },
  ink: {
    card: "bg-white text-black border-t-2 border-t-black",
    badge: "bg-black/[0.06] text-black",
    value: "text-black",
    label: "text-gray-400",
  },
  line: {
    card: "bg-white text-black",
    badge: "bg-[#f5f5f5] text-[#555]",
    value: "text-black",
    label: "text-gray-400",
  },
};

export function KPICard({
  icon: Icon,
  value,
  label,
  sub,
  subColor = "#27ae60",
  valueColor,
  tone = "line",
  trend,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  sub?: string;
  subColor?: string;
  valueColor?: string;
  tone?: Tone;
  /** Short delta shown as a pill top-right, e.g. "+12.4%" or "-3%" */
  trend?: string;
}) {
  const t = TONE_STYLES[tone];
  const trendDown = trend?.trim().startsWith("-");

  return (
    <div className={cn("kpi", t.card)}>
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", t.badge)}>
          <Icon size={17} strokeWidth={2} />
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 text-[0.58rem] font-bold",
              tone === "hero"
                ? "bg-white/10 text-white"
                : trendDown
                ? "bg-danger/10 text-danger"
                : "bg-success/10 text-success"
            )}
          >
            {trendDown ? <TrendingDown size={11} strokeWidth={2.5} /> : <TrendingUp size={11} strokeWidth={2.5} />}
            {trend}
          </span>
        )}
      </div>
      <div className={cn("pf mb-1 text-[1.35rem] font-bold", t.value)} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className={cn("text-[0.63rem] uppercase tracking-wide", t.label)}>{label}</div>
      {sub && (
        <div className="mt-1 text-[0.63rem] font-semibold" style={{ color: tone === "hero" ? undefined : subColor }}>
          {sub}
        </div>
      )}
    </div>
  );
}
