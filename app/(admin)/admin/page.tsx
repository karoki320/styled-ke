import Link from "next/link";
import { ORDERS, PRODUCTS } from "@/lib/mock-data";
import { fmtKES, formatDate } from "@/lib/utils";
import { KPICard } from "@/components/admin/KPICard";
import { StatusBadge } from "@/components/admin/StatusBadge";

const MONTHLY = [
  { m: "Mar", v: 195000 },
  { m: "Apr", v: 310000 },
  { m: "May", v: 284750 },
  { m: "Jun", v: 268000 },
  { m: "Jul", v: 302500 },
  { m: "Aug", v: 189200 },
];
const maxV = Math.max(...MONTHLY.map((d) => d.v));

const CATEGORY_SPLIT = [{ cat: "Clothing", pct: 100 }];

export default function AdminDashboardPage() {
  const lowStock = PRODUCTS.filter((p) => p.stock_quantity <= p.low_stock_threshold);
  const totalRevenue = ORDERS.reduce((s, o) => s + o.total, 0);
  const avgOrder = Math.round(totalRevenue / ORDERS.length);

  return (
    <div>
      <div className="mb-6">
        <span className="sec-label">Overview</span>
        <h1 className="pf text-[1.65rem] font-bold">
          Dashboard — you made {fmtKES(totalRevenue)} this month 🎉
        </h1>
      </div>

      <div className="mb-5.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KPICard icon="💰" value={fmtKES(totalRevenue)} label="Total Revenue" sub="+22% this month" />
        <KPICard icon="📦" value={String(ORDERS.length)} label="Total Orders" sub={`${ORDERS.filter((o) => o.status === "pending").length} need attention`} subColor="#e74c3c" />
        <KPICard icon="👥" value="847" label="Customers" sub="+18 this week" />
        <KPICard icon="👗" value={fmtKES(avgOrder)} label="Avg Order" sub="All clothing KES 1,500" />
      </div>

      {lowStock.length > 0 && (
        <div className="mb-5.5 flex items-center gap-3 border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
          <span className="text-lg">⚠️</span>
          <span>
            <strong>{lowStock.length} product{lowStock.length > 1 ? "s" : ""}</strong> running low on
            stock —{" "}
            <Link href="/admin/products" className="font-semibold text-gold underline">
              review inventory
            </Link>
            .
          </span>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.6fr_1fr]">
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-4 text-[0.95rem] font-bold">Monthly Revenue (KES)</div>
          <div className="flex h-[110px] items-end gap-1.5">
            {MONTHLY.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-[86px] w-full items-end bg-[#f5f5f5]">
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${(d.v / maxV) * 100}%`,
                      background: d.m === "Aug" ? "#c9a96e" : "#1a1a1a",
                      opacity: d.m === "Aug" ? 1 : 0.22,
                    }}
                  />
                </div>
                <div
                  className="text-[0.6rem]"
                  style={{ color: d.m === "Aug" ? "#c9a96e" : "#bbb", fontWeight: d.m === "Aug" ? 700 : 400 }}
                >
                  {d.m}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border bg-white p-4.5">
          <div className="pf mb-3.5 text-[0.95rem] font-bold">By Category</div>
          {CATEGORY_SPLIT.map((c) => (
            <div key={c.cat} className="mb-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[0.76rem] font-semibold">{c.cat}</span>
                <span className="text-[0.7rem] font-bold text-gold">{c.pct}%</span>
              </div>
              <div className="h-1 bg-[#f5f5f5]">
                <div className="h-full bg-black" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border bg-white p-4.5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="pf text-[0.95rem] font-bold">Recent Orders</div>
          <Link href="/admin/orders" className="btn-out px-2.5 py-1 text-[0.6rem]">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2.5 py-1.5 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.slice(0, 5).map((o) => (
                <tr key={o.id} className="tr border-b border-[#f5f5f5]">
                  <td className="whitespace-nowrap px-2.5 py-2 text-[0.78rem] font-bold text-gold">{o.order_number}</td>
                  <td className="whitespace-nowrap px-2.5 py-2 text-[0.78rem]">{o.customer_name}</td>
                  <td className="max-w-[120px] truncate px-2.5 py-2 text-[0.72rem] text-gray-400">{o.items_summary}</td>
                  <td className="whitespace-nowrap px-2.5 py-2 text-[0.8rem] font-bold">{fmtKES(o.total)}</td>
                  <td className="px-2.5 py-2">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2 text-[0.72rem] text-gray-400">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
