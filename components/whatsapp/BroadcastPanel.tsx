"use client";

import { useState } from "react";
import { CUSTOMERS } from "@/lib/mock-data";

export function BroadcastPanel() {
  const [audience, setAudience] = useState<"all" | "recent" | "vip">("all");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const recipientCount = { all: CUSTOMERS.length * 169, recent: 132, vip: 41 }[audience];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="border border-border bg-white p-5">
        <div className="pf mb-4 text-base font-bold">New Broadcast</div>
        <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
          Audience
        </label>
        <select
          className="field mb-3.5"
          value={audience}
          onChange={(e) => setAudience(e.target.value as typeof audience)}
        >
          <option value="all">All Customers ({CUSTOMERS.length * 169})</option>
          <option value="recent">Ordered in last 30 days (132)</option>
          <option value="vip">VIP — 5+ orders (41)</option>
        </select>
        <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
          Message
        </label>
        <textarea
          className="field mb-4"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi {{customer_name}}! We just dropped new arrivals — all clothing still KES 1,500 ✨"
        />
        <div className="mb-4 text-[0.72rem] text-gray-400">
          Sending to <strong>{recipientCount}</strong> recipients.
        </div>
        <div className="flex gap-2.5">
          <button className="btn-out flex-1 justify-center py-3 text-[0.7rem]">SCHEDULE</button>
          <button
            onClick={() => setSent(true)}
            disabled={!message.trim()}
            className="btn-blk flex-[2] justify-center py-3 text-[0.7rem] disabled:opacity-50"
          >
            SEND NOW
          </button>
        </div>
        {sent && (
          <div className="mt-3 border border-success/30 bg-success/5 p-3 text-[0.78rem] text-success">
            ✓ Broadcast queued for {recipientCount} recipients.
          </div>
        )}
      </div>

      <div className="border border-border bg-white p-5">
        <div className="pf mb-4 text-base font-bold">Recent Broadcasts</div>
        <div className="space-y-3">
          {[
            { title: "New Arrivals Drop", sent: 412, delivered: 398, read: 301, date: "2 days ago" },
            { title: "Weekend Sale — 20% Off Perfumes", sent: 356, delivered: 340, read: 289, date: "1 week ago" },
          ].map((b) => (
            <div key={b.title} className="border border-[#f0f0f0] p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.82rem] font-semibold">{b.title}</span>
                <span className="text-[0.65rem] text-gray-400">{b.date}</span>
              </div>
              <div className="flex gap-4 text-[0.7rem] text-gray-500">
                <span>Sent: {b.sent}</span>
                <span>Delivered: {b.delivered}</span>
                <span>Read: {b.read}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
