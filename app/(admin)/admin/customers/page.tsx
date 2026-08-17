"use client";

import { useState } from "react";
import { Users, Repeat, Gem } from "lucide-react";
import { CUSTOMERS } from "@/lib/mock-data";
import { fmtKES, formatDate, waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { Customer } from "@/types";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = CUSTOMERS.filter(
    (c) =>
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <div className="mb-5">
        <span className="sec-label">CRM</span>
        <h1 className="pf text-[1.65rem] font-bold">Customers</h1>
      </div>

      <div className="mb-4.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="kpi">
          <Users size={20} className="text-[#555]" />
          <div className="pf mt-1.5 text-[1.25rem] font-bold text-gold">847</div>
          <div className="mt-1 text-[0.62rem] uppercase tracking-wide text-gray-400">Total Customers</div>
        </div>
        <div className="kpi">
          <Repeat size={20} className="text-[#555]" />
          <div className="pf mt-1.5 text-[1.25rem] font-bold text-gold">68%</div>
          <div className="mt-1 text-[0.62rem] uppercase tracking-wide text-gray-400">Returning Rate</div>
        </div>
        <div className="kpi">
          <Gem size={20} className="text-[#555]" />
          <div className="pf mt-1.5 text-[1.25rem] font-bold text-gold">KES 12,400</div>
          <div className="mt-1 text-[0.62rem] uppercase tracking-wide text-gray-400">Avg Lifetime Value</div>
        </div>
      </div>

      <input
        className="field mb-3.5 max-w-xs"
        placeholder="Search name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#fafafa]">
              {["Customer", "Orders", "Spent", "Last Order", "Location", "Action"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3.5 py-2.5 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="tr border-b border-[#f5f5f5]">
                <td className="cursor-pointer px-3.5 py-2.5" onClick={() => setSelected(c)}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-bold">
                      {c.full_name[0]}
                    </div>
                    <div className="text-[0.82rem] font-semibold">{c.full_name}</div>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 font-bold">{c.total_orders}</td>
                <td className="px-3.5 py-2.5 font-bold text-gold">{fmtKES(c.total_spent)}</td>
                <td className="px-3.5 py-2.5 text-[0.72rem] text-gray-400">{formatDate(c.last_order_at)}</td>
                <td className="px-3.5 py-2.5 text-[0.72rem] text-gray-400">{c.city}</td>
                <td className="px-3.5 py-2.5">
                  <a
                    href={waLink(`Hello ${c.full_name.split(" ")[0]}! 🌟 Thank you for shopping at Styled.ke! Check our new arrivals ✨`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-wa px-2.5 py-1 text-[0.6rem]"
                  >
                    <WhatsAppIcon size={10} /> Message
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[600] flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-[420px] overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="pf text-lg font-bold">{selected.full_name}</div>
              <button onClick={() => setSelected(null)} className="text-2xl leading-none text-gray-400">
                ×
              </button>
            </div>
            <div className="mb-4 space-y-2 border border-border p-4 text-sm">
              <div className="flex justify-between border-b border-[#f5f5f5] py-1.5">
                <span className="text-gray-400">Phone</span>
                <span>{selected.phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#f5f5f5] py-1.5">
                <span className="text-gray-400">City</span>
                <span>{selected.city}</span>
              </div>
              <div className="flex justify-between border-b border-[#f5f5f5] py-1.5">
                <span className="text-gray-400">Total Orders</span>
                <span className="font-bold">{selected.total_orders}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Total Spent</span>
                <span className="font-bold text-gold">{fmtKES(selected.total_spent)}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                Internal Notes
              </label>
              <textarea className="field" rows={3} placeholder="e.g. Prefers rider delivery, VIP customer…" />
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={waLink(`Hello ${selected.full_name.split(" ")[0]}! 🌟`)}
                target="_blank"
                rel="noreferrer"
                className="btn-wa w-full justify-center py-3 text-[0.7rem]"
              >
                <WhatsAppIcon size={13} /> SEND WHATSAPP MESSAGE
              </a>
              <button className="btn-out w-full justify-center py-3 text-[0.7rem]">
                + CREATE ORDER FOR CUSTOMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
