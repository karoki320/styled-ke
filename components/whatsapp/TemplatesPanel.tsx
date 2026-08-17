const TEMPLATES = [
  { icon: "✅", name: "Order Confirmed", trigger: "Auto-sent on new order", content: "Hi {{customer_name}}! Your order {{order_number}} for {{total}} is confirmed. We'll be in touch shortly ✨" },
  { icon: "🚚", name: "Order Shipped", trigger: "Auto-sent on status → shipped", content: "Your Styled.ke order {{order_number}} is on its way! 🚚" },
  { icon: "📦", name: "Order Delivered", trigger: "Auto-sent on status → delivered", content: "Your order {{order_number}} has been delivered. Enjoy! 💛" },
  { icon: "🎉", name: "Welcome New Customer", trigger: "Auto-sent on first order", content: "Welcome to Styled.ke, {{customer_name}}! 🌟 All clothing is KES 1,500." },
  { icon: "💛", name: "Abandoned Cart Reminder", trigger: "3h after cart abandoned", content: "Hi {{customer_name}}, you left something in your cart! Complete your order: {{cart_link}}" },
  { icon: "⭐", name: "Review Request", trigger: "24h after delivery", content: "How was your Styled.ke order, {{customer_name}}? We'd love a quick review! ⭐" },
  { icon: "📢", name: "New Arrival Announcement", trigger: "Manual / broadcast", content: "New arrivals just dropped! Shop now: styled.ke/shop ✨" },
  { icon: "🏷️", name: "Sale Announcement", trigger: "Manual / broadcast", content: "Sale is live! {{discount}} off selected items 🏷️" },
];

export function TemplatesPanel() {
  return (
    <div>
      <p className="mb-4 max-w-lg text-sm text-muted">
        Pre-approved WhatsApp templates — required to message customers outside the 24-hour
        session window (e.g. proactive order updates).
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="border border-border bg-white p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-lg">{t.icon}</span>
              <span className="text-[0.85rem] font-semibold">{t.name}</span>
            </div>
            <div className="mb-2 text-[0.65rem] uppercase tracking-wide text-gray-400">
              {t.trigger}
            </div>
            <p className="mb-3 border-l-2 border-gold bg-bg-light p-2.5 text-[0.76rem] italic text-[#555]">
              {t.content}
            </p>
            <button className="btn-out px-3 py-1.5 text-[0.6rem]">Edit Template</button>
          </div>
        ))}
      </div>
    </div>
  );
}
