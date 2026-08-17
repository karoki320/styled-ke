const ITEMS: [string, string][] = [
  ["🚚", "Nationwide delivery"],
  ["✓", "Authentic products"],
  ["👗", "From KES 1,500"],
  ["💬", "WhatsApp support"],
];

export function TrustBar() {
  return (
    <div className="flex flex-wrap border-b border-t border-border">
      {ITEMS.map(([icon, text]) => (
        <div
          key={text}
          className="flex flex-1 items-center justify-center gap-2 border-r border-border px-3 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#333] last:border-r-0"
        >
          <span>{icon}</span>
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
