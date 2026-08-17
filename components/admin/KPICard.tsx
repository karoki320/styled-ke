export function KPICard({
  icon,
  value,
  label,
  sub,
  subColor = "#27ae60",
  valueColor,
}: {
  icon: string;
  value: string;
  label: string;
  sub?: string;
  subColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="kpi">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="bg-[#efffef] px-1.5 py-0.5 text-[0.58rem] font-bold text-success">↑</span>
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
