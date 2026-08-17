"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { HeroSlide } from "@/components/store/Hero";

type DraftSlide = {
  id?: string;
  image_url: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
  focal_x: number;
};

const emptyDraft: DraftSlide = {
  image_url: "",
  headline: "",
  subtext: "",
  cta_label: "SHOP NOW",
  cta_href: "/shop",
  sort_order: 0,
  is_active: true,
  focal_x: 50,
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<(HeroSlide & { sort_order: number; is_active: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftSlide>(emptyDraft);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hero_slides")
        .select("id, image_url, headline, subtext, cta_label, cta_href, sort_order, is_active, focal_x")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setSlides(data || []);
      setConfigured(true);
    } catch (err) {
      console.error("Failed to load hero slides:", err);
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
    setDraft({ ...emptyDraft, sort_order: slides.length + 1 });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (s: (typeof slides)[number]) => {
    setEditing(s.id);
    setDraft({
      id: s.id,
      image_url: s.image_url,
      headline: s.headline || "",
      subtext: s.subtext || "",
      cta_label: s.cta_label || "SHOP NOW",
      cta_href: s.cta_href || "/shop",
      sort_order: s.sort_order,
      is_active: s.is_active,
      focal_x: s.focal_x ?? 50,
    });
    setError(null);
    setShowForm(true);
  };

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `slide-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("hero-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) throw uploadErr;
      const { data: pub } = supabase.storage.from("hero-images").getPublicUrl(path);
      setDraft((d) => ({ ...d, image_url: pub.publicUrl }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!draft.image_url) {
      setError("Please upload an image for this slide.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const payload = {
        image_url: draft.image_url,
        headline: draft.headline || null,
        subtext: draft.subtext || null,
        cta_label: draft.cta_label || null,
        cta_href: draft.cta_href || null,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
        focal_x: draft.focal_x,
      };
      if (editing) {
        const { error: updErr } = await supabase.from("hero_slides").update(payload).eq("id", editing);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("hero_slides").insert(payload);
        if (insErr) throw insErr;
      }
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("Failed to save hero slide:", err);
      setError(err instanceof Error ? err.message : "Failed to save slide.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s: (typeof slides)[number]) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("hero_slides")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (err) {
      console.error(err);
      return;
    }
    setSlides((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function move(s: (typeof slides)[number], dir: -1 | 1) {
    const supabase = createClient();
    const idx = slides.findIndex((x) => x.id === s.id);
    const swapWith = slides[idx + dir];
    if (!swapWith) return;
    const [a, b] = [s.sort_order, swapWith.sort_order];
    const { error: err1 } = await supabase.from("hero_slides").update({ sort_order: b }).eq("id", s.id);
    const { error: err2 } = await supabase
      .from("hero_slides")
      .update({ sort_order: a })
      .eq("id", swapWith.id);
    if (err1 || err2) {
      console.error(err1 || err2);
      return;
    }
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this hero slide? This cannot be undone.")) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("hero_slides").delete().eq("id", id);
    if (err) {
      console.error(err);
      alert("Failed to delete slide.");
      return;
    }
    setSlides((list) => list.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="sec-label">Homepage</span>
          <h1 className="pf text-[1.65rem] font-bold">Hero Images</h1>
        </div>
        <button onClick={openNew} className="btn-blk px-4.5 py-2.5 text-[0.68rem]">
          + ADD SLIDE
        </button>
      </div>

      <p className="mb-4 max-w-2xl text-[0.78rem] text-muted">
        These images rotate at the top of the homepage. Only <strong>Active</strong> slides show to
        shoppers, in the order below. Use the arrows to reorder.
      </p>

      {!configured && (
        <div className="mb-4 border border-[#ffe1b3] bg-[#fff8ec] p-4 text-[0.8rem] text-[#8a5a00]">
          Supabase isn&rsquo;t connected yet, so slides can&rsquo;t be saved here. The homepage is still
          showing the built-in fallback images. Run <code>supabase/migrations/0002_hero_slides.sql</code>{" "}
          and set your Supabase environment variables to manage slides here.
        </div>
      )}

      {loading ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          Loading slides…
        </div>
      ) : slides.length === 0 && configured ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          No slides yet. Click &ldquo;+ ADD SLIDE&rdquo; to create the first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((s, i) => (
            <div key={s.id} className="border border-border bg-white p-3">
              <div className="relative mb-3 h-40 w-full overflow-hidden bg-[#f5f5f5]">
                <Image src={s.image_url} alt={s.headline || ""} fill sizes="360px" className="object-cover object-top" />
              </div>
              <div className="mb-1 text-[0.85rem] font-bold">{s.headline || "(no headline)"}</div>
              <div className="mb-2 text-[0.7rem] text-gray-400">{s.subtext || "(no subtext)"}</div>
              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={() => toggleActive(s)}
                  className="px-2 py-1 text-[0.58rem] font-bold uppercase tracking-wide"
                  style={{
                    background: s.is_active ? "#efffef" : "#fff0f0",
                    color: s.is_active ? "#27ae60" : "#e74c3c",
                  }}
                >
                  {s.is_active ? "Active" : "Inactive"}
                </button>
                <span className="text-[0.65rem] text-gray-300">Order #{s.sort_order}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => move(s, -1)}
                  disabled={i === 0}
                  className="btn-out px-2 py-1 text-[0.6rem] disabled:opacity-30"
                >
                  ↑ Up
                </button>
                <button
                  onClick={() => move(s, 1)}
                  disabled={i === slides.length - 1}
                  className="btn-out px-2 py-1 text-[0.6rem] disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <button onClick={() => openEdit(s)} className="btn-out px-2.5 py-1 text-[0.6rem]">
                  Edit
                </button>
                <button
                  onClick={() => remove(s.id)}
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
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="pf text-xl font-bold">{editing ? "Edit Slide" : "Add Slide"}</h2>
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
                  Slide Image
                </label>
                {draft.image_url && (
                  <div className="relative mb-2 h-32 w-full overflow-hidden bg-[#f5f5f5]">
                    <Image src={draft.image_url} alt="" fill sizes="500px" className="object-cover object-top" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="field"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
                {uploading && <p className="mt-1 text-[0.68rem] text-gray-400">Uploading…</p>}
              </div>

              {draft.image_url && (
                <div>
                  <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                    Photo Focus (keeps the garment in frame on phones)
                  </label>
                  <div className="mb-2 flex gap-1.5">
                    {[
                      { label: "Left", value: 20 },
                      { label: "Center", value: 50 },
                      { label: "Right", value: 80 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, focal_x: opt.value }))}
                        className="flex-1 border py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide"
                        style={{
                          borderColor: draft.focal_x === opt.value ? "#1a1a1a" : "#e8e8e8",
                          background: draft.focal_x === opt.value ? "#1a1a1a" : "#fff",
                          color: draft.focal_x === opt.value ? "#fff" : "#333",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={draft.focal_x}
                      onChange={(e) => setDraft((d) => ({ ...d, focal_x: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="relative h-20 w-11 flex-shrink-0 overflow-hidden border border-border bg-[#f5f5f5]">
                      <Image
                        src={draft.image_url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                        style={{ objectPosition: `${draft.focal_x}% center` }}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[0.65rem] text-gray-400">
                    The narrow box previews roughly what a phone screen will show.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Headline
                </label>
                <input
                  className="field"
                  value={draft.headline}
                  onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
                  placeholder="e.g. Pleated Chiffon Dress"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Subtext
                </label>
                <input
                  className="field"
                  value={draft.subtext}
                  onChange={(e) => setDraft((d) => ({ ...d, subtext: e.target.value }))}
                  placeholder="e.g. KES 1,500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                    Button Label
                  </label>
                  <input
                    className="field"
                    value={draft.cta_label}
                    onChange={(e) => setDraft((d) => ({ ...d, cta_label: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                    Button Link
                  </label>
                  <input
                    className="field"
                    value={draft.cta_href}
                    onChange={(e) => setDraft((d) => ({ ...d, cta_href: e.target.value }))}
                    placeholder="/shop"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[0.78rem]">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
                />
                Show on homepage
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
                  disabled={saving || uploading}
                  className="btn-blk flex-[2] justify-center py-3 text-[0.7rem] disabled:opacity-50"
                >
                  {saving ? "SAVING…" : "✓ SAVE SLIDE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
