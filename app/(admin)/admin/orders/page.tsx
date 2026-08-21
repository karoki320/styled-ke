"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { fmtKES, formatDate, waLink } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/components/admin/StatusBadge";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { Order, OrderStatus } from "@/types";

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_MEANING: Record<OrderStatus, string> = {
  pending: "Order placed, awaiting confirmation/payment.",
  confirmed: "Payment or details confirmed — ready to prepare.",
  processing: "Being packed for dispatch.",
  shipped: "Handed to rider/courier, on its way.",
  delivered: "Customer has received the order.",
  cancelled: "Order was cancelled and will not ship.",
};

// Raw shape returned by GET /api/admin/orders — one row per order, with
// customer and line-item details embedded via Supabase's foreign-key joins.
interface OrderApiRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  source: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_method: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_zone: string | null;
  delivery_agent: string | null;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  customers: { full_name: string; phone: string } | null;
  order_items: { product_name: string; variant_name: string | null; quantity: number }[] | null;
}

interface OrdersApiResponse {
  configured: boolean;
  orders?: OrderApiRow[];
  error?: string;
}

/** Same fields the printed/emailed receipts use to build a delivery
 * description — kept consistent with app/api/orders/route.ts. */
function deliveryLocation(row: OrderApiRow): string {
  const parts = [row.delivery_address, row.delivery_zone, row.delivery_agent, row.delivery_city].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function itemsSummary(row: OrderApiRow): string {
  const items = row.order_items || [];
  if (!items.length) return "—";
  return items
    .map((i) => `${i.product_name}${i.variant_name ? ` (${i.variant_name})` : ""} x${i.quantity}`)
    .join(", ");
}

function toOrder(row: OrderApiRow): Order {
  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customers?.full_name || "Unknown customer",
    customer_phone: row.customers?.phone || "—",
    items_summary: itemsSummary(row),
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    total: row.total,
    status: row.status,
    source: (row.source as Order["source"]) || "website",
    payment_method: row.payment_method as Order["payment_method"],
    payment_status: row.payment_status as Order["payment_status"],
    delivery_method: row.delivery_method as Order["delivery_method"],
    delivery_location: deliveryLocation(row),
    created_at: row.created_at,
  };
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrdersApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((res: OrdersApiResponse) => {
        setData(res);
        setOrders((res.orders || []).map(toOrder));
      })
      .catch(() => setData({ configured: true, error: "Failed to load orders." }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  // Optimistic UI: flip the row locally right away, then persist via the
  // admin-gated PATCH route. On failure, revert and surface it — silently
  // leaving the UI showing a status that was never actually saved would be
  // worse than a visible error.
  const persistStatus = async (id: string, status: OrderStatus, previous: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: previous } : o)));
      alert("Couldn't save that status change — please try again.");
    }
  };

  const updateStatus = (id: string, status: OrderStatus) => {
    const previous = orders.find((o) => o.id === id)?.status;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    if (previous) persistStatus(id, status, previous);
  };

  const bulkUpdate = (status: OrderStatus) => {
    if (selected.length === 0) return;
    if (!confirm(`Mark ${selected.length} order(s) as ${STATUS_LABELS[status]}?`)) return;
    const previousById = new Map(orders.map((o) => [o.id, o.status]));
    setOrders((list) => list.map((o) => (selected.includes(o.id) ? { ...o, status } : o)));
    selected.forEach((id) => {
      const previous = previousById.get(id);
      if (previous) persistStatus(id, status, previous);
    });
    setSelected([]);
  };

  const exportCSV = () => {
    const header = ["Order", "Customer", "Phone", "Items", "Total", "Status", "Date"];
    const rows = filtered.map((o) => [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.items_summary,
      o.total,
      o.status,
      o.created_at,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "styled-ke-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {
    All: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div>
        <div className="mb-5">
          <span className="sec-label">Management</span>
          <h1 className="pf text-[1.65rem] font-bold">All Orders</h1>
        </div>
        <div className="border border-border bg-white p-8 text-center text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="sec-label">Management</span>
          <h1 className="pf text-[1.65rem] font-bold">All Orders</h1>
        </div>
        <button onClick={exportCSV} className="btn-out gap-1.5 px-4 py-2 text-[0.65rem]">
          <Download size={13} /> EXPORT CSV
        </button>
      </div>

      {data && !data.configured && (
        <div className="mb-4 border border-[#f0d9a8] bg-[#fffaf0] p-3.5 text-[0.74rem] text-[#8a6d1f]">
          Supabase isn&rsquo;t connected yet, so there are no real orders to show. Once it&rsquo;s configured, every
          order placed on the website or via WhatsApp will appear here automatically.
        </div>
      )}
      {data?.error && (
        <div className="mb-4 border border-[#f5c6cb] bg-[#fdecea] p-3.5 text-[0.74rem] text-[#a94442]">
          {data.error}
        </div>
      )}
      {data?.configured && orders.length === 0 && (
        <div className="mb-4 border border-border bg-white p-3.5 text-[0.74rem] text-gray-400">
          No orders yet — this fills in as customers check out on the website or through WhatsApp.
        </div>
      )}

      <div className="mb-4.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {(["All", "pending", "processing", "delivered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="kpi text-left"
            style={statusFilter === s ? { borderColor: "#1a1a1a" } : undefined}
          >
            <div
              className="pf text-[1.3rem] font-bold"
              style={{ color: s === "delivered" ? "#27ae60" : s === "pending" ? "#e74c3c" : "#1a1a1a" }}
            >
              {counts[s]}
            </div>
            <div className="mt-0.5 text-[0.63rem] uppercase tracking-wide text-gray-400">
              {s === "All" ? "All" : STATUS_LABELS[s]}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <input
          className="field max-w-xs"
          placeholder="Search order #, customer, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {selected.length > 0 && (
          <div className="flex items-center gap-2 text-[0.75rem]">
            <span className="text-gray-400">{selected.length} selected</span>
            <select
              className="field w-auto py-1.5 text-xs"
              onChange={(e) => e.target.value && bulkUpdate(e.target.value as OrderStatus)}
              defaultValue=""
            >
              <option value="" disabled>
                Bulk update status…
              </option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#fafafa]">
              <th className="px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((o) => o.id) : [])
                  }
                />
              </th>
              {["Order", "Customer", "Phone", "Items", "Total", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="tr border-b border-[#f5f5f5]">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.id)}
                    onChange={(e) =>
                      setSelected((s) => (e.target.checked ? [...s, o.id] : s.filter((id) => id !== o.id)))
                    }
                  />
                </td>
                <td
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-[0.78rem] font-bold text-gold"
                  onClick={() => setDrawerOrder(o)}
                >
                  {o.order_number}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[0.78rem]">{o.customer_name}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[0.72rem] text-gray-400">{o.customer_phone}</td>
                <td className="max-w-[110px] truncate px-3 py-2.5 text-[0.7rem] text-gray-400">{o.items_summary}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-[0.8rem] font-bold">{fmtKES(o.total)}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={o.status}
                    title={STATUS_MEANING[o.status]}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                    className="cursor-pointer border px-1.5 py-1 text-[0.63rem] font-bold"
                    style={{
                      background: `${STATUS_COLORS[o.status]}12`,
                      color: STATUS_COLORS[o.status],
                      borderColor: `${STATUS_COLORS[o.status]}44`,
                    }}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <a
                    href={waLink(
                      `Hello ${o.customer_name}! 👋 Your Styled.ke order ${o.order_number} is now *${STATUS_LABELS[o.status]}*. Thank you! ✨`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-wa px-2.5 py-1 text-[0.58rem]"
                  >
                    <WhatsAppIcon size={10} /> Notify
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && orders.length > 0 && (
          <p className="p-8 text-center text-sm text-muted">No orders match your filters.</p>
        )}
      </div>

      {drawerOrder && (
        <OrderDetailDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />
      )}
    </div>
  );
}

function OrderDetailDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[600] flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-[420px] overflow-y-auto bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="pf text-lg font-bold text-gold">{order.order_number}</div>
            <div className="text-[0.7rem] text-gray-400">{formatDate(order.created_at)}</div>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400">
            ×
          </button>
        </div>

        <div className="mb-5 space-y-2 border border-border p-4 text-sm">
          <Row label="Customer" value={order.customer_name} />
          <Row label="Phone" value={order.customer_phone} />
          <Row label="Items" value={order.items_summary} />
          <Row label="Subtotal" value={fmtKES(order.subtotal)} />
          <Row label="Delivery Fee" value={fmtKES(order.delivery_fee)} />
          <Row label="Total" value={fmtKES(order.total)} bold />
          <Row label="Payment" value={`${order.payment_method || "—"} · ${order.payment_status}`} />
          <Row label="Delivery" value={`${order.delivery_method || "—"} · ${order.delivery_location}`} />
          <Row label="Source" value={order.source} />
        </div>

        <div className="mb-5">
          <div className="mb-2 text-[0.62rem] font-bold uppercase tracking-wide text-gray-400">
            Timeline
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between border-b border-[#f5f5f5] py-1.5">
              <span className="text-gray-400">Order placed</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Current status</span>
              <span className="font-semibold">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={waLink(
              `Hello ${order.customer_name}! 👋 Update on your Styled.ke order ${order.order_number}: it's currently *${order.status}*.`
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-wa w-full justify-center py-3 text-[0.7rem]"
          >
            <WhatsAppIcon size={13} /> SEND WHATSAPP UPDATE
          </a>
          <button onClick={() => window.print()} className="btn-out w-full justify-center gap-1.5 py-3 text-[0.7rem]">
            <Printer size={14} /> PRINT INVOICE
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b border-[#f5f5f5] py-1.5 last:border-b-0">
      <span className="text-gray-400">{label}</span>
      <span className={bold ? "font-bold text-gold" : "font-medium"}>{value}</span>
    </div>
  );
}
