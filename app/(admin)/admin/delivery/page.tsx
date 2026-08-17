"use client";

import { useState } from "react";
import { DELIVERY_ZONES, DELIVERY_OPTIONS } from "@/lib/mock-data";
import { fmtKES } from "@/lib/utils";
import type { DeliveryZone } from "@/types";

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<DeliveryZone[]>(DELIVERY_ZONES);
  const [newZone, setNewZone] = useState({ name: "", fee: "" });

  const addZone = () => {
    if (!newZone.name.trim()) return;
    setZones((z) => [
      ...z,
      { id: `z-${Date.now()}`, name: newZone.name, fee: Number(newZone.fee) || 0, is_active: true },
    ]);
    setNewZone({ name: "", fee: "" });
  };

  const removeZone = (id: string) => setZones((z) => z.filter((zone) => zone.id !== id));
  const toggleZone = (id: string) =>
    setZones((z) => z.map((zone) => (zone.id === id ? { ...zone, is_active: !zone.is_active } : zone)));

  return (
    <div>
      <div className="mb-5">
        <span className="sec-label">Fulfillment</span>
        <h1 className="pf text-[1.65rem] font-bold">Delivery Areas &amp; Options</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="border border-border bg-white p-5">
          <div className="pf mb-4 text-base font-bold">Delivery Methods</div>
          <p className="mb-3 text-[0.78rem] text-muted">
            These appear as options at checkout. Method fees marked &ldquo;quoted&rdquo; are
            confirmed with the customer over WhatsApp.
          </p>
          <div className="space-y-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <div key={opt.id} className="flex items-center justify-between border border-[#f0f0f0] p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{opt.icon}</span>
                  <div>
                    <div className="text-[0.82rem] font-semibold">{opt.label}</div>
                    <div className="text-[0.68rem] text-gray-400">{opt.desc}</div>
                  </div>
                </div>
                <div className="text-[0.8rem] font-bold text-gold">{opt.feeLabel}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-white p-5">
          <div className="pf mb-4 text-base font-bold">Add Delivery Zone</div>
          <div className="mb-3 flex flex-col gap-2.5">
            <input
              className="field"
              placeholder="Zone name e.g. Kilimani"
              value={newZone.name}
              onChange={(e) => setNewZone((v) => ({ ...v, name: e.target.value }))}
            />
            <input
              type="number"
              className="field"
              placeholder="Delivery fee (KES) — 0 for free"
              value={newZone.fee}
              onChange={(e) => setNewZone((v) => ({ ...v, fee: e.target.value }))}
            />
            <button onClick={addZone} className="btn-blk justify-center py-2.5 text-[0.68rem]">
              + ADD ZONE
            </button>
          </div>
        </div>
      </div>

      <div className="border border-border bg-white p-5">
        <div className="pf mb-4 text-base font-bold">Nairobi Zones &amp; Fees</div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Zone", "Fee", "Status", ""].map((h) => (
                <th key={h} className="px-2 py-2 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="tr border-b border-[#f5f5f5]">
                <td className="px-2 py-2.5 text-[0.82rem] font-semibold">{z.name}</td>
                <td className="px-2 py-2.5 text-[0.82rem]">{z.fee === 0 ? "FREE" : fmtKES(z.fee)}</td>
                <td className="px-2 py-2.5">
                  <button
                    onClick={() => toggleZone(z.id)}
                    className="px-2 py-1 text-[0.58rem] font-bold uppercase tracking-wide"
                    style={{
                      background: z.is_active ? "#efffef" : "#fff0f0",
                      color: z.is_active ? "#27ae60" : "#e74c3c",
                    }}
                  >
                    {z.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-2 py-2.5">
                  <button
                    onClick={() => removeZone(z.id)}
                    className="text-[0.65rem] text-gray-300 hover:text-danger"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
