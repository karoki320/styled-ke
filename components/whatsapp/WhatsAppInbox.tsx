"use client";

import { useState } from "react";
import { WHATSAPP_CONVERSATIONS, WHATSAPP_MESSAGES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { WhatsAppConversation } from "@/types";

const QUICK_REPLIES = [
  "Hello! All clothing is KES 1,500 😊",
  "Your order is confirmed, thank you!",
  "We deliver nationwide — free within Nairobi.",
  "Please share your delivery address.",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function WhatsAppInbox() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(WHATSAPP_CONVERSATIONS);
  const [activeId, setActiveId] = useState(conversations[0]?.id);
  const [statusFilter, setStatusFilter] = useState<"All" | "open" | "bot" | "resolved">("All");
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId);
  const messages = active ? WHATSAPP_MESSAGES[active.id] || [] : [];

  const filtered = conversations.filter((c) => statusFilter === "All" || c.status === statusFilter);

  const markResolved = () => {
    if (!active) return;
    setConversations((list) => list.map((c) => (c.id === active.id ? { ...c, status: "resolved" } : c)));
  };

  return (
    <div className="grid grid-cols-1 gap-0 border border-border bg-white lg:grid-cols-[35%_65%]" style={{ height: "70vh" }}>
      {/* Conversations list */}
      <div className="flex flex-col border-r border-border">
        <div className="border-b border-border p-3">
          <input className="field mb-2 py-1.5 text-sm" placeholder="Search name or phone…" />
          <div className="flex gap-1">
            {(["All", "open", "bot", "resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex-1 whitespace-nowrap px-1.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide",
                  statusFilter === s ? "bg-black text-white" : "bg-[#f5f5f5] text-gray-500"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-start gap-2.5 border-b border-[#f5f5f5] p-3 text-left transition-colors hover:bg-[#fafafa]",
                activeId === c.id && "bg-[#fafafa]"
              )}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-bold">
                {c.customer_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[0.8rem] font-semibold">{c.customer_name}</span>
                  <span className="flex-shrink-0 text-[0.6rem] text-gray-400">{timeAgo(c.last_message_at)}</span>
                </div>
                <div className="truncate text-[0.72rem] text-gray-400">{c.last_message}</div>
              </div>
              {c.unread_count > 0 && (
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-whatsapp text-[0.55rem] font-bold text-white">
                  {c.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div className="flex flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-2.5 border-b border-border p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-bold">
                {active.customer_name[0]}
              </div>
              <div className="flex-1">
                <div className="text-[0.85rem] font-semibold">{active.customer_name}</div>
                <div className="text-[0.68rem] text-gray-400">{active.wa_phone}</div>
              </div>
              <button onClick={markResolved} className="btn-out px-2.5 py-1.5 text-[0.6rem]">
                Mark Resolved
              </button>
              <button className="btn-blk px-2.5 py-1.5 text-[0.6rem]">+ Create Order</button>
            </div>
            <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#f8f8f6] p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] px-3 py-2 text-[0.8rem] leading-relaxed shadow-sm",
                      m.direction === "outbound" ? "bg-[#dcf8c6]" : "border border-border bg-white"
                    )}
                  >
                    {m.content}
                    {m.is_bot && <div className="mt-1 text-[0.58rem] uppercase text-gray-400">🤖 Bot reply</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setDraft(q)}
                    className="whitespace-nowrap border border-border bg-[#fafafa] px-2 py-1 text-[0.62rem] text-gray-600 hover:border-black"
                  >
                    {q.length > 28 ? q.slice(0, 28) + "…" : q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="field flex-1"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setDraft("")}
                />
                <button className="btn-wa px-4 text-[0.7rem]" onClick={() => setDraft("")}>
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
