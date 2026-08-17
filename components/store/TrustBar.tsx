import { Truck, CircleCheck, Shirt, MessageCircle, type LucideIcon } from "lucide-react";

const ITEMS: [LucideIcon, string][] = [
  [Truck, "Nationwide delivery"],
  [CircleCheck, "Authentic products"],
  [Shirt, "From KES 1,500"],
  [MessageCircle, "WhatsApp support"],
];

export function TrustBar() {
  return (
    <div className="flex flex-wrap border-b border-t border-border">
      {ITEMS.map(([Icon, text]) => (
        <div
          key={text}
          className="flex flex-1 items-center justify-center gap-2 border-r border-border px-3 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#333] last:border-r-0"
        >
          <Icon size={15} strokeWidth={2} />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
