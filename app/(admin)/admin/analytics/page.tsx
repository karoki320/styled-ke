"use client";

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
import { PRODUCTS } from "@/lib/mock-data";
import { fmtKES } from "@/lib/utils";

const REVENUE_TREND = [
  { m: "Mar", revenue: 195000 },
  { m: "Apr", revenue: 310000 },
  { m: "May", revenue: 284750 },
  { m: "Jun", revenue: 268000 },
  { m: "Jul", revenue: 302500 },
  { m: "Aug", revenue: 189200 },
];

const SOURCE_SPLIT = [
  { name: "Website", value: 58 },
  { name: "WhatsApp", value: 27 },
  { name: "POS", value: 15 },
];
const SOURCE_COLORS = ["#1a1a1a", "#25D366", "#c9a96e"];

const PAYMENT_SPLIT = [
  { name: "M-Pesa (Paystack)", value: 62 },
  { name: "M-Pesa Manual", value: 24 },
  { name: "Cash on Delivery", value: 14 },
];

export default function AdminAnalyticsPage() {
  const topProducts = PRODUCTS.slice(0, 5).map((p, i) => ({
    name: p.name,
    revenue: p.price * (10 - i * 2),
  }));

  return (
    <div>
      <div className="mb-5">
        <span className="sec-label">Insights</span>
        <h1 className="pf text-[1.65rem] font-bold">Analytics</h1>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Revenue Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmtKES(Number(v))} />
              <Bar dataKey="revenue" fill="#c9a96e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Top Products</div>
          {topProducts.map((p) => {
            const max = topProducts[0].revenue;
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
          })}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Orders by Source</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={SOURCE_SPLIT} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {SOURCE_SPLIT.map((entry, i) => (
                  <Cell key={entry.name} fill={SOURCE_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Payment Method Breakdown</div>
          {PAYMENT_SPLIT.map((p) => (
            <div key={p.name} className="mb-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[0.76rem] font-semibold">{p.name}</span>
                <span className="text-[0.7rem] font-bold text-gold">{p.value}%</span>
              </div>
              <div className="h-1 bg-[#f5f5f5]">
                <div className="h-full bg-black" style={{ width: `${p.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          { t: "Fulfillment Rate", v: "94.2%", d: "Orders delivered on time", c: "#27ae60" },
          { t: "Satisfaction", v: "4.9/5", d: "From 247 reviews", c: "#c9a96e" },
          { t: "WhatsApp Conversion", v: "38%", d: "Chats → orders", c: "#25D366" },
        ].map((m) => (
          <div key={m.t} className="kpi text-center">
            <div className="pf mb-1.5 text-[1.8rem] font-black" style={{ color: m.c }}>
              {m.v}
            </div>
            <div className="mb-1 text-[0.78rem] font-bold">{m.t}</div>
            <div className="text-[0.7rem] text-gray-400">{m.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
