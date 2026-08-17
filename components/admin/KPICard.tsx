import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

export function KPICard({
  icon: Icon,
  value,
  label,
  sub,
  subColor = "#27ae60",
  valueColor,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  sub?: string;
  subColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="kpi">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#555]">
          <Icon size={17} strokeWidth={2} />
        </span>
        <span className="flex items-center gap-0.5 bg-[#efffef] px-1.5 py-0.5 text-[0.58rem] font-bold text-success">
          <TrendingUp size={11} strokeWidth={2.5} />
        </span>
      </div>
      <div className="pf mb-1 text-[1.35rem] font-bold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="text-[0.63rem] uppercase tracking-wide text-gray-400">{label}</div>
      {sub && (
        <div className="mt-1 text-[0.63rem] font-semibold" style={{ color: subColor }}>
          {sub}
        </div>
      )}
    </div>
  );
}
