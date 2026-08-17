import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, CircleCheck, Package, Truck, PartyPopper, type LucideIcon } from "lucide-react";
import { ORDERS } from "@/lib/mock-data";
import { fmtKES, formatDate, waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { OrderStatus } from "@/types";

const TIMELINE: { key: OrderStatus; label: string; icon: LucideIcon }[] = [
  { key: "pending", label: "Placed", icon: FileText },
  { key: "confirmed", label: "Confirmed", icon: CircleCheck },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PartyPopper },
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const orderNumber = `#${decodeURIComponent(params.id)}`;
  const order = ORDERS.find((o) => o.order_number === orderNumber);

  if (!order) notFound();

  const currentIndex = order.status === "cancelled" ? -1 : TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <section className="mx-auto max-w-[700px] px-6 py-16 sm:px-10">
      <div className="mb-8 text-center">
        <span className="sec-label">Order Tracking</span>
        <h1 className="pf text-2xl font-bold">{order.order_number}</h1>
      </div>

      {order.status === "cancelled" ? (
        <div className="mb-8 border border-danger/30 bg-danger/5 p-5 text-center text-sm text-danger">
          This order was cancelled. Message us on WhatsApp if you have questions.
        </div>
      ) : (
        <div className="mb-10 flex items-center justify-between">
          {TIMELINE.map((step, i) => (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={`h-px flex-1 ${i === 0 ? "bg-transparent" : i <= currentIndex ? "bg-black" : "bg-border"}`} />
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm"
                  style={{
                    background: i <= currentIndex ? "#1a1a1a" : "#f0f0f0",
                    color: i <= currentIndex ? "#fff" : "#bbb",
                  }}
                >
                  <step.icon size={16} />
                </div>
                <div className={`h-px flex-1 ${i === TIMELINE.length - 1 ? "bg-transparent" : i < currentIndex ? "bg-black" : "bg-border"}`} />
              </div>
              <div
                className="mt-2 text-[0.6rem] font-semibold uppercase tracking-wide"
                style={{ color: i <= currentIndex ? "#1a1a1a" : "#bbb" }}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 border border-border p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="text-[0.7rem] uppercase tracking-wide text-gray-400">Placed on</div>
            <div className="font-semibold">{formatDate(order.created_at)}</div>
          </div>
          <div className="text-right">
            <div className="text-[0.7rem] uppercase tracking-wide text-gray-400">Total</div>
            <div className="pf text-lg font-bold text-gold">{fmtKES(order.total)}</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Items" value={order.items_summary} />
          <Row label="Delivery" value={order.delivery_location} />
          <Row label="Payment" value={order.payment_method?.toUpperCase() || "—"} />
          <Row label="Status" value={order.status.replace(/^\w/, (c) => c.toUpperCase())} />
        </div>
      </div>

      <a
        href={waLink(`Hi Styled.ke! I'd like an update on order ${order.order_number} ✨`)}
        target="_blank"
        rel="noreferrer"
        className="btn-wa w-full justify-center py-3.5 text-[0.73rem]"
      >
        <WhatsAppIcon size={14} /> WHATSAPP SUPPORT
      </a>
      <Link href="/shop" className="mt-3 block text-center text-[0.72rem] uppercase tracking-wide text-gray-400 hover:text-black">
        ← Continue Shopping
      </Link>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#f5f5f5] py-1.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
