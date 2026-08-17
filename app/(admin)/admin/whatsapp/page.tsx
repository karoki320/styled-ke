"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WhatsAppInbox } from "@/components/whatsapp/WhatsAppInbox";
import { AutomationBuilder } from "@/components/whatsapp/AutomationBuilder";
import { BroadcastPanel } from "@/components/whatsapp/BroadcastPanel";
import { TemplatesPanel } from "@/components/whatsapp/TemplatesPanel";
import { WhatsAppAnalytics } from "@/components/whatsapp/WhatsAppAnalytics";

const TABS = [
  { id: "inbox", label: "Inbox" },
  { id: "automation", label: "Automation" },
  { id: "broadcast", label: "Broadcast" },
  { id: "templates", label: "Templates" },
  { id: "analytics", label: "Analytics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminWhatsAppPage() {
  const [tab, setTab] = useState<TabId>("inbox");

  return (
    <div className="flex h-full flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="mb-4">
        <span className="sec-label">Communication</span>
        <h1 className="pf text-[1.65rem] font-bold">WhatsApp</h1>
      </div>

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 border-transparent px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400",
              tab === t.id && "border-black text-black"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === "inbox" && <WhatsAppInbox />}
        {tab === "automation" && <AutomationBuilder />}
        {tab === "broadcast" && <BroadcastPanel />}
        {tab === "templates" && <TemplatesPanel />}
        {tab === "analytics" && <WhatsAppAnalytics />}
      </div>
    </div>
  );
}
