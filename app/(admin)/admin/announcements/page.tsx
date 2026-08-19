"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  message: string;
  link_href: string | null;
  sort_order: number;
  is_active: boolean;
};

type Draft = {
  id?: string;
  message: string;
  link_href: string;
  sort_order: number;
  is_active: boolean;
};

const emptyDraft: Draft = {
  message: "",
  link_href: "",
  sort_order: 0,
  is_active: true,
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("announcements")
        .select("id, message, link_href, sort_order, is_active")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setItems(data || []);
      setConfigured(true);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, sort_order: items.length + 1 });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a.id);
    setDraft({
      id: a.id,
      message: a.message,
      link_href: a.link_href || "",
      sort_order: a.sort_order,
      is_active: a.is_active,
    });
    setError(null);
    setShowForm(true);
  };

  async function handleSave() {
    if (!draft.message.trim()) {
      setError("Please write a message for this announcement.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const payload = {
        message: draft.message.trim(),
        link_href: draft.link_href.trim() || null,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
      };
      if (editing) {
        const { error: updErr } = await supabase.from("announcements").update(payload).eq("id", editing);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("announcements").insert(payload);
        if (insErr) throw insErr;
      }
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("Failed to save announcement:", err);
      setError(err instanceof Error ? err.message : "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(a: Announcement) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("announcements")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (err) {
      console.error(err);
      return;
    }
    setItems((list) => list.map((x) => (x.id === a.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function move(a: Announcement, dir: -1 | 1) {
    const supabase = createClient();
    const idx = items.findIndex((x) => x.id === a.id);
    const swapWith = items[idx + dir];
    if (!swapWith) return;
    const [x, y] = [a.sort_order, swapWith.sort_order];
    const { error: err1 } = await supabase.from("announcements").update({ sort_order: y }).eq("id", a.id);
    const { error: err2 } = await supabase
      .from("announcements")
      .update({ sort_order: x })
      .eq("id", swapWith.id);
    if (err1 || err2) {
      console.error(err1 || err2);
      return;
    }
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("announcements").delete().eq("id", id);
    if (err) {
      console.error(err);
      alert("Failed to delete announcement.");
      return;
    }
    setItems((list) => list.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="sec-label">Homepage</span>
          <h1 className="pf text-[1.65rem] font-bold">Announcement Bar</h1>
        </div>
        <button onClick={openNew} className="btn-blk px-4.5 py-2.5 text-[0.68rem]">
          + ADD ANNOUNCEMENT
        </button>
      </div>

      <p className="mb-4 max-w-2xl text-[0.78rem] text-muted">
        These messages rotate in the black strip at the very top of the site — use them for offers,
        delivery news, or anything you want every visitor to see first. Only <strong>Active</strong>{" "}
        messages show, in the order below. Give a message a link to make it clickable (e.g. a WhatsApp
        link or <code>/shop</code>) — leave it blank for plain text.
      </p>

      {!configured && (
        <div className="mb-4 border border-[#ffe1b3] bg-[#fff8ec] p-4 text-[0.8rem] text-[#8a5a00]">
          Supabase isn&rsquo;t connected yet, so announcements can&rsquo;t be saved here. The site is
          still showing the built-in fallback messages. Run{" "}
          <code>supabase/migrations/0005_announcements.sql</code> and set your Supabase environment
          variables to manage announcements here.
        </div>
      )}

      {loading ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          Loading announcements…
        </div>
      ) : items.length === 0 && configured ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          No announcements yet. Click &ldquo;+ ADD ANNOUNCEMENT&rdquo; to create the first one.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((a, i) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 border border-border bg-white p-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="text-[0.85rem] font-semibold">{a.message}</div>
                {a.link_href && (
                  <div className="mt-0.5 truncate text-[0.68rem] text-gray-400">→ {a.link_href}</div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => toggleActive(a)}
                  className="px-2 py-1 text-[0.58rem] font-bold uppercase tracking-wide"
                  style={{
                    background: a.is_active ? "#efffef" : "#fff0f0",
                    color: a.is_active ? "#27ae60" : "#e74c3c",
                  }}
                >
                  {a.is_active ? "Active" : "Inactive"}
                </button>
                <span className="text-[0.65rem] text-gray-300">#{a.sort_order}</span>
                <button
                  onClick={() => move(a, -1)}
                  disabled={i === 0}
                  className="btn-out px-2 py-1 text-[0.6rem] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(a, 1)}
                  disabled={i === items.length - 1}
                  className="btn-out px-2 py-1 text-[0.6rem] disabled:opacity-30"
                >
                  ↓
                </button>
                <button onClick={() => openEdit(a)} className="btn-out px-2.5 py-1 text-[0.6rem]">
                  Edit
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="border border-[#fcc] bg-[#fff0f0] px-2.5 py-1 text-[0.6rem] font-semibold text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-[600] flex animate-fadeIn items-center justify-center bg-black/45 p-5"
          onClick={() => setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="pf text-xl font-bold">{editing ? "Edit Announcement" : "Add Announcement"}</h2>
              <button onClick={() => setShowForm(false)} className="text-2xl leading-none text-gray-400">
                ×
              </button>
            </div>

            <form
              className="flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Message
                </label>
                <input
                  className="field"
                  value={draft.message}
                  onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                  placeholder="e.g. Free delivery this weekend only"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Link (optional)
                </label>
                <input
                  className="field"
                  value={draft.link_href}
                  onChange={(e) => setDraft((d) => ({ ...d, link_href: e.target.value }))}
                  placeholder="/shop or https://wa.me/254..."
                />
              </div>
              <label className="flex items-center gap-2 text-[0.78rem]">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
                />
                Show in the rotation
              </label>

              {error && <p className="text-[0.75rem] text-danger">{error}</p>}

              <div className="mt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-out flex-1 justify-center py-3 text-[0.7rem]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-blk flex-[2] justify-center py-3 text-[0.7rem] disabled:opacity-50"
                >
                  {saving ? "SAVING…" : "✓ SAVE ANNOUNCEMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
