"use client";

import { useState } from "react";
import { AUTOMATION_FLOWS } from "@/lib/mock-data";
import type { AutomationFlow } from "@/types";

export function AutomationBuilder() {
  const [flows, setFlows] = useState<AutomationFlow[]>(AUTOMATION_FLOWS);
  const [editing, setEditing] = useState<AutomationFlow | null>(null);

  const toggle = (id: string) =>
    setFlows((list) => list.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f)));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="max-w-lg text-sm text-muted">
          When a customer messages a keyword, Style (the bot) replies automatically — no staff
          needed for routine questions.
        </p>
        <button
          onClick={() =>
            setEditing({
              id: `new-${Date.now()}`,
              name: "",
              trigger_keyword: "",
              response_type: "text",
              response_content: "",
              is_active: true,
              trigger_count: 0,
            })
          }
          className="btn-blk px-4 py-2.5 text-[0.68rem]"
        >
          + ADD FLOW
        </button>
      </div>

      <div className="space-y-2.5">
        {flows.map((f) => (
          <div key={f.id} className="flex items-center gap-3 border border-border bg-white p-4">
            <button
              onClick={() => toggle(f.id)}
              className="h-6 w-11 flex-shrink-0 rounded-full transition-colors"
              style={{ background: f.is_active ? "#25D366" : "#e0e0e0" }}
              aria-label="Toggle automation flow"
            >
              <div
                className="h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: f.is_active ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
            <div className="flex-1">
              <div className="text-[0.85rem] font-semibold">{f.name}</div>
              <div className="text-[0.72rem] text-gray-400">
                Triggers on: <span className="italic">{f.trigger_keyword}</span>
              </div>
            </div>
            <div className="text-right text-[0.68rem] text-gray-400">
              {f.trigger_count} triggers
            </div>
            <button onClick={() => setEditing(f)} className="btn-out px-3 py-1.5 text-[0.62rem]">
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/45 p-5" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="pf mb-4 text-lg font-bold">Edit Automation Flow</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Flow Name
                </label>
                <input
                  className="field"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Trigger Keyword(s), comma separated
                </label>
                <input
                  className="field"
                  value={editing.trigger_keyword}
                  onChange={(e) => setEditing({ ...editing, trigger_keyword: e.target.value })}
                  placeholder="hi, hello, hey"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Response Message (use {"{{customer_name}}"} for personalization)
                </label>
                <textarea
                  className="field"
                  rows={4}
                  value={editing.response_content}
                  onChange={(e) => setEditing({ ...editing, response_content: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2.5">
              <button onClick={() => setEditing(null)} className="btn-out flex-1 justify-center py-3 text-[0.7rem]">
                CANCEL
              </button>
              <button
                onClick={() => {
                  setFlows((list) => {
                    const exists = list.some((f) => f.id === editing.id);
                    return exists
                      ? list.map((f) => (f.id === editing.id ? editing : f))
                      : [editing, ...list];
                  });
                  setEditing(null);
                }}
                className="btn-blk flex-[2] justify-center py-3 text-[0.7rem]"
              >
                ✓ SAVE FLOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
