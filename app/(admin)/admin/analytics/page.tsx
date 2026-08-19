"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtKES } from "@/lib/utils";
import { POS_BRANCHES } from "@/lib/pos-branches";

interface OrderRow {
  id: string;
  order_number: string;
  source: string | null;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  total: number;
  created_at: string;
}
interface OrderItemRow {
  order_id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
}
interface POSSaleRow {
  sale_number: number;
  items: { name: string; qty: number; price: number; lineTotal: number }[] | null;
  total: number;
  payment_method: string;
  branch: string;
  created_at: string;
}
interface AnalyticsResponse {
  configured: boolean;
  orders?: OrderRow[];
  orderItems?: OrderItemRow[];
  posSales?: POSSaleRow[];
  error?: string;
}

// Website + WhatsApp use "#1a1a1a"/"#25D366" elsewhere in the admin (source
// filters, WhatsApp icon) — reused here so the same channel always reads as
// the same color across the dashboard. Each POS branch gets its own gold
// tone so "POS" as a whole is recognizably gold-family without the two
// branches being indistinguishable from each other.
const CHANNEL_COLORS: Record<string, string> = {
  Website: "#1a1a1a",
  WhatsApp: "#25D366",
  [`POS — ${POS_BRANCHES[0]}`]: "#c9a96e",
  [`POS — ${POS_BRANCHES[1]}`]: "#8a6d3b",
};

const MONTH_FMT = new Intl.DateTimeFormat("en-KE", { month: "short" });

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function lastNMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_FMT.format(d) });
  }
  return out;
}

function paymentLabel(method: string | null, channel: "online" | "pos"): string {
  if (channel === "online") {
    if (method === "paystack") return "Card / M-Pesa (Online)";
    if (method === "mpesa") return "M-Pesa Manual (Online)";
    return method ? `${method} (Online)` : "Unknown (Online)";
  }
  if (method === "cash") return "Cash (POS)";
  if (method === "mpesa") return "M-Pesa (POS)";
  if (method === "card") return "Card (POS)";
  if (method === "invoice") return "Invoice (POS)";
  return method ? `${method} (POS)` : "Unknown (POS)";
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ configured: true, error: "Failed to load." }))
      .finally(() => setLoading(false));
  }, []);

  const orders = useMemo(() => (data?.orders || []).filter((o) => o.payment_status === "paid"), [data]);
  const orderItems = data?.orderItems || [];
  const posSales = data?.posSales || [];

  const paidOrderIds = useMemo(() => new Set(orders.map((o) => o.id)), [orders]);

  // ── Revenue trend: last 6 months, stacked by channel ──────────────────
  const months = useMemo(() => lastNMonths(6), []);
  const revenueTrend = useMemo(() => {
    const buckets: Record<string, { m: string; Website: number; WhatsApp: number; [k: string]: number | string }> =
      {};
    for (const { key, label } of months) {
      buckets[key] = {
        m: label,
        Website: 0,
        WhatsApp: 0,
        [`POS — ${POS_BRANCHES[0]}`]: 0,
        [`POS — ${POS_BRANCHES[1]}`]: 0,
      };
    }
    for (const o of orders) {
      const key = monthKey(o.created_at);
      if (!buckets[key]) continue;
      const channel = o.source === "whatsapp" ? "WhatsApp" : "Website";
      buckets[key][channel] = (buckets[key][channel] as number) + o.total;
    }
    for (const s of posSales) {
      const key = monthKey(s.created_at);
      if (!buckets[key]) continue;
      const label = `POS — ${POS_BRANCHES.includes(s.branch as (typeof POS_BRANCHES)[number]) ? s.branch : POS_BRANCHES[0]}`;
      buckets[key][label] = (buckets[key][label] as number) + s.total;
    }
    return months.map(({ key }) => buckets[key]);
  }, [orders, posSales, months]);

  // ── Sales by channel (pie) ─────────────────────────────────────────────
  const channelSplit = useMemo(() => {
    const totals: Record<string, number> = {
      Website: 0,
      WhatsApp: 0,
      [`POS — ${POS_BRANCHES[0]}`]: 0,
      [`POS — ${POS_BRANCHES[1]}`]: 0,
    };
    for (const o of orders) totals[o.source === "whatsapp" ? "WhatsApp" : "Website"] += o.total;
    for (const s of posSales) {
      const label = `POS — ${POS_BRANCHES.includes(s.branch as (typeof POS_BRANCHES)[number]) ? s.branch : POS_BRANCHES[0]}`;
      totals[label] += s.total;
    }
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [orders, posSales]);

  // ── Payment method breakdown ────────────────────────────────────────────
  const paymentSplit = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const o of orders) {
      const label = paymentLabel(o.payment_method, "online");
      totals[label] = (totals[label] || 0) + o.total;
    }
    for (const s of posSales) {
      const label = paymentLabel(s.payment_method, "pos");
      totals[label] = (totals[label] || 0) + s.total;
    }
    const grand = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals)
      .map(([name, total]) => ({ name, total, pct: Math.round((total / grand) * 100) }))
      .sort((a, b) => b.total - a.total);
  }, [orders, posSales]);

  // ── Top products — combines website/WhatsApp order_items with POS's
  //    per-sale JSON item snapshots (POS items aren't linked to a
  //    product_id, so this groups by name string on both sides). ─────────
  const topProducts = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of orderItems) {
      if (!paidOrderIds.has(item.order_id)) continue;
      totals[item.product_name] = (totals[item.product_name] || 0) + item.subtotal;
    }
    for (const s of posSales) {
      for (const item of s.items || []) {
        totals[item.name] = (totals[item.name] || 0) + item.lineTotal;
      }
    }
    return Object.entries(totals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orderItems, posSales, paidOrderIds]);

  // ── Grounded KPIs — no invented satisfaction/fulfillment numbers; every
  //    figure here traces back to a real row in orders or pos_sales. ─────
  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const thisMonthOrders = orders.filter((o) => monthKey(o.created_at) === thisMonthKey);
    const thisMonthPos = posSales.filter((s) => monthKey(s.created_at) === thisMonthKey);
    const websiteRevenue = thisMonthOrders
      .filter((o) => o.source !== "whatsapp")
      .reduce((s, o) => s + o.total, 0);
    const whatsappRevenue = thisMonthOrders
      .filter((o) => o.source === "whatsapp")
      .reduce((s, o) => s + o.total, 0);
    const posByBranch = Object.fromEntries(POS_BRANCHES.map((b) => [b, 0])) as Record<string, number>;
    for (const s of thisMonthPos) {
      posByBranch[s.branch] = (posByBranch[s.branch] || 0) + s.total;
    }
    const posRevenue = Object.values(posByBranch).reduce((a, b) => a + b, 0);
    const totalRevenue = websiteRevenue + whatsappRevenue + posRevenue;
    const totalCount = thisMonthOrders.length + thisMonthPos.length;
    const avgSale = totalCount > 0 ? totalRevenue / totalCount : 0;
    return { websiteRevenue, whatsappRevenue, posRevenue, posByBranch, totalRevenue, totalCount, avgSale };
  }, [orders, posSales]);

  if (loading) {
    return (
      <div>
        <div className="mb-5">
          <span className="sec-label">Insights</span>
          <h1 className="pf text-[1.65rem] font-bold">Analytics</h1>
        </div>
        <div className="border border-border bg-white p-8 text-center text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const hasAnyData = orders.length > 0 || posSales.length > 0;

  return (
    <div>
      <div className="mb-5">
        <span className="sec-label">Insights</span>
        <h1 className="pf text-[1.65rem] font-bold">Analytics</h1>
      </div>

      {data && !data.configured && (
        <div className="mb-4 border border-[#f0d9a8] bg-[#fffaf0] p-3.5 text-[0.74rem] text-[#8a6d1f]">
          Supabase isn&rsquo;t connected yet, so this dashboard has nothing real to show. Set your Supabase
          environment variables and this fills in from actual orders and POS sales automatically.
        </div>
      )}
      {data?.error && (
        <div className="mb-4 border border-[#f5c6cb] bg-[#fdecea] p-3.5 text-[0.74rem] text-[#a94442]">
          {data.error}
        </div>
      )}
      {data?.configured && !hasAnyData && (
        <div className="mb-4 border border-border bg-white p-3.5 text-[0.74rem] text-gray-400">
          No paid orders or POS sales yet — this dashboard fills in as sales come through the website, WhatsApp,
          and both tills.
        </div>
      )}

      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="kpi text-center">
          <div className="pf mb-1.5 text-[1.5rem] font-black" style={{ color: "#1a1a1a" }}>
            {fmtKES(kpis.totalRevenue)}
          </div>
          <div className="mb-1 text-[0.78rem] font-bold">Revenue This Month</div>
          <div className="text-[0.7rem] text-gray-400">
            {fmtKES(kpis.websiteRevenue + kpis.whatsappRevenue)} online + {fmtKES(kpis.posRevenue)} POS
          </div>
        </div>
        <div className="kpi text-center">
          <div className="pf mb-1.5 text-[1.5rem] font-black" style={{ color: "#c9a96e" }}>
            {kpis.totalCount}
          </div>
          <div className="mb-1 text-[0.78rem] font-bold">Orders + Sales This Month</div>
          <div className="text-[0.7rem] text-gray-400">Across website, WhatsApp, and both tills</div>
        </div>
        <div className="kpi text-center">
          <div className="pf mb-1.5 text-[1.5rem] font-black" style={{ color: "#27ae60" }}>
            {fmtKES(kpis.avgSale)}
          </div>
          <div className="mb-1 text-[0.78rem] font-bold">Average Sale Value</div>
          <div className="text-[0.7rem] text-gray-400">
            {POS_BRANCHES.map((b) => `${b} ${fmtKES(kpis.posByBranch[b] || 0)}`).join(" · ")}
          </div>
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Revenue Trend (6 months)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmtKES(Number(v))} />
              <Legend wrapperStyle={{ fontSize: "0.68rem" }} />
              <Bar dataKey="Website" stackId="a" fill={CHANNEL_COLORS.Website} />
              <Bar dataKey="WhatsApp" stackId="a" fill={CHANNEL_COLORS.WhatsApp} />
              <Bar
                dataKey={`POS — ${POS_BRANCHES[0]}`}
                stackId="a"
                fill={CHANNEL_COLORS[`POS — ${POS_BRANCHES[0]}`]}
              />
              <Bar
                dataKey={`POS — ${POS_BRANCHES[1]}`}
                stackId="a"
                fill={CHANNEL_COLORS[`POS — ${POS_BRANCHES[1]}`]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Top Products</div>
          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-[0.74rem] text-gray-400">No sales yet.</div>
          ) : (
            topProducts.map((p) => {
              const max = topProducts[0].revenue || 1;
              return (
                <div key={p.name} className="mb-3">
                  <div className="mb-1 flex justify-between">
                    <span className="max-w-[60%] truncate text-[0.74rem] font-semibold">{p.name}</span>
                    <span className="text-[0.7rem] font-bold text-gold">{fmtKES(p.revenue)}</span>
                  </div>
                  <div className="h-[3px] bg-[#f5f5f5]">
                    <div className="h-full bg-black" style={{ width: `${(p.revenue / max) * 100}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Sales by Channel</div>
          {channelSplit.length === 0 ? (
            <div className="py-8 text-center text-[0.74rem] text-gray-400">No sales yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {channelSplit.map((entry) => (
                    <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || "#999"} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "0.68rem" }} />
                <Tooltip formatter={(v) => fmtKES(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Payment Method Breakdown</div>
          {paymentSplit.length === 0 ? (
            <div className="py-8 text-center text-[0.74rem] text-gray-400">No sales yet.</div>
          ) : (
            paymentSplit.map((p) => (
              <div key={p.name} className="mb-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-[0.76rem] font-semibold">{p.name}</span>
                  <span className="text-[0.7rem] font-bold text-gold">
                    {fmtKES(p.total)} ({p.pct}%)
                  </span>
                </div>
                <div className="h-1 bg-[#f5f5f5]">
                  <div className="h-full bg-black" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
