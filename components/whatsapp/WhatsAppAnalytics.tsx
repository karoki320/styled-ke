import { Send, CircleCheck, Timer, CheckCheck, type LucideIcon } from "lucide-react";
import { AUTOMATION_FLOWS } from "@/lib/mock-data";

export function WhatsAppAnalytics() {
  const topFlows = [...AUTOMATION_FLOWS].sort((a, b) => b.trigger_count - a.trigger_count).slice(0, 5);
  const maxTriggers = topFlows[0]?.trigger_count || 1;

  const STATS: { l: string; v: string; ic: LucideIcon }[] = [
    { l: "Messages Sent Today", v: "218", ic: Send },
    { l: "Delivery Rate", v: "98.4%", ic: CircleCheck },
    { l: "Avg Response Time", v: "4m", ic: Timer },
    { l: "Conversations Resolved", v: "36", ic: CheckCheck },
  ];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {STATS.map((k) => (
          <div key={k.l} className="kpi">
            <k.ic size={18} className="text-[#555]" />
            <div className="pf mt-1.5 text-xl font-bold text-gold">{k.v}</div>
            <div className="mt-1 text-[0.6rem] uppercase tracking-wide text-gray-400">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="border border-border bg-white p-4.5">
        <div className="pf mb-4 text-[0.95rem] font-bold">Most Triggered Automations</div>
        {topFlows.map((f) => (
          <div key={f.id} className="mb-3">
            <div className="mb-1 flex justify-between">
              <span className="text-[0.78rem] font-semibold">{f.name}</span>
              <span className="text-[0.7rem] font-bold text-gold">{f.trigger_count}</span>
            </div>
            <div className="h-1.5 bg-[#f5f5f5]">
              <div
                className="h-full bg-whatsapp"
                style={{ width: `${(f.trigger_count / maxTriggers) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
