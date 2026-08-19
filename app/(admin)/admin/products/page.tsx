"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { fmtKES, slugify } from "@/lib/utils";
import { processImageForUpload } from "@/lib/image-upload";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  badge: "NEW" | "SALE" | null;
  is_active: boolean;
  is_featured: boolean;
  sku: string;
  image: string;
  colors: string;
};

type Draft = Omit<AdminProduct, "id" | "image"> & { id?: string; image: string };

const emptyDraft: Draft = {
  name: "",
  slug: "",
  description: "",
  price: 1500,
  compare_price: null,
  stock_quantity: 10,
  low_stock_threshold: 5,
  badge: "NEW",
  is_active: true,
  is_featured: true,
  sku: "",
  image: "",
  colors: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clothingCategoryId, setClothingCategoryId] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: cat } = await supabase.from("categories").select("id").eq("slug", "clothing").maybeSingle();
      setClothingCategoryId(cat?.id ?? null);

      const { data: rows, error: err } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, compare_price, stock_quantity, low_stock_threshold, badge, is_active, is_featured, sku"
        )
        .order("created_at", { ascending: false });
      if (err) throw err;

      const ids = (rows || []).map((r) => r.id);
      const [{ data: images }, { data: variants }] = await Promise.all([
        supabase.from("product_images").select("product_id, image_url, is_primary, display_order").in("product_id", ids.length ? ids : ["-"]),
        supabase.from("product_variants").select("product_id, name").in("product_id", ids.length ? ids : ["-"]),
      ]);

      const merged: AdminProduct[] = (rows || []).map((r) => {
        const own = (images || [])
          .filter((i) => i.product_id === r.id)
          .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
        const cols = (variants || []).filter((v) => v.product_id === r.id).map((v) => v.name);
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description || "",
          price: Number(r.price),
          compare_price: r.compare_price != null ? Number(r.compare_price) : null,
          stock_quantity: r.stock_quantity,
          low_stock_threshold: r.low_stock_threshold,
          badge: (r.badge as AdminProduct["badge"]) ?? null,
          is_active: r.is_active,
          is_featured: r.is_featured,
          sku: r.sku || "",
          image: own[0]?.image_url || "/images/IMG_MARBLE.jpg",
          colors: cols.join(", "),
        };
      });

      setProducts(merged);
      setConfigured(true);
    } catch (err) {
      console.error("Failed to load products:", err);
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  function discardPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  const openNew = () => {
    discardPreview();
    setEditing(null);
    setDraft(emptyDraft);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    discardPreview();
    setEditing(p.id);
    setDraft({ ...p });
    setError(null);
    setShowForm(true);
  };

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
      setError("That doesn't look like a photo — please choose an image file.");
      return;
    }
    setError(null);

    // 1. Process right here in the browser — decodes the photo (including
    // iPhone HEIC shots, which most non-Apple devices can't open later),
    // resizes it, and re-encodes as JPEG — then show it immediately so the
    // admin isn't staring at a blank box while the network upload happens.
    setProcessing(true);
    let processed;
    try {
      processed = await processImageForUpload(file);
    } catch (err) {
      console.error("Failed to process image:", err);
      setError(err instanceof Error ? err.message : "Couldn't read this photo — try a different one.");
      setProcessing(false);
      return;
    }
    setProcessing(false);

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = processed.previewUrl;
    setDraft((d) => ({ ...d, image: processed.previewUrl }));

    // 2. Upload the already-resized JPEG in the background.
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `product-${processed.filename}`;
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, processed.blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });
      if (uploadErr) throw uploadErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setDraft((d) => (d.image === processed.previewUrl ? { ...d, image: pub.publicUrl } : d));
      URL.revokeObjectURL(processed.previewUrl);
      if (previewUrlRef.current === processed.previewUrl) previewUrlRef.current = null;
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!draft.image) {
      setError("Please upload a product photo.");
      return;
    }
    if (draft.image.startsWith("blob:")) {
      setError("Still saving your photo — give it a second and try again.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const slug = draft.slug || slugify(draft.name);
      const payload = {
        name: draft.name,
        slug,
        description: draft.description,
        category_id: clothingCategoryId,
        price: draft.price,
        compare_price: draft.compare_price,
        stock_quantity: draft.stock_quantity,
        low_stock_threshold: draft.low_stock_threshold,
        badge: draft.badge,
        is_active: draft.is_active,
        is_featured: draft.is_featured,
        sku: draft.sku || null,
      };

      let productId: string;
      if (editing) {
        const { error: updErr } = await supabase.from("products").update(payload).eq("id", editing);
        if (updErr) throw updErr;
        productId = editing;
      } else {
        const { data: inserted, error: insErr } = await supabase.from("products").insert(payload).select("id").single();
        if (insErr) throw insErr;
        productId = inserted.id;
      }

      // Replace the primary image + colour variants with the current draft —
      // simplest correct sync for a single-photo, small catalogue.
      await supabase.from("product_images").delete().eq("product_id", productId);
      await supabase.from("product_images").insert({
        product_id: productId,
        image_url: draft.image,
        is_primary: true,
        display_order: 1,
      });

      await supabase.from("product_variants").delete().eq("product_id", productId);
      const colorList = draft.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (colorList.length > 0) {
        await supabase
          .from("product_variants")
          .insert(colorList.map((name) => ({ product_id: productId, name })));
      }

      setShowForm(false);
      await load();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: AdminProduct) {
    const supabase = createClient();
    const { error: err } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (err) {
      console.error(err);
      return;
    }
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("products").delete().eq("id", id);
    if (err) {
      console.error(err);
      alert("Failed to delete product.");
      return;
    }
    setProducts((list) => list.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="sec-label">Inventory</span>
          <h1 className="pf text-[1.65rem] font-bold">Products</h1>
        </div>
        <button onClick={openNew} className="btn-blk px-4.5 py-2.5 text-[0.68rem]">
          + ADD PRODUCT
        </button>
      </div>

      <p className="mb-4 max-w-2xl text-[0.78rem] text-muted">
        This is your live catalogue — changes here update the storefront immediately (shop grid,
        homepage, product pages).
      </p>

      {!configured && (
        <div className="mb-4 border border-[#ffe1b3] bg-[#fff8ec] p-4 text-[0.8rem] text-[#8a5a00]">
          Supabase isn&rsquo;t connected yet, so products can&rsquo;t be managed here. Run{" "}
          <code>supabase/migrations/0003_products_admin.sql</code> and set your Supabase environment
          variables to manage the catalogue from this page.
        </div>
      )}

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <input
          className="field max-w-xs"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          Loading products…
        </div>
      ) : filtered.length === 0 && configured ? (
        <div className="border border-border bg-white p-8 text-center text-[0.8rem] text-gray-400">
          No products yet. Click &ldquo;+ ADD PRODUCT&rdquo; to create the first one.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                {["Product", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3.5 py-2.5 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="tr border-b border-[#f5f5f5]">
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-12 w-9.5 flex-shrink-0 overflow-hidden bg-[#f5f5f5]">
                        <Image src={p.image} alt="" fill sizes="38px" className="object-cover object-top" />
                      </div>
                      <div className="text-[0.8rem] font-semibold">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="text-[0.82rem] font-bold text-gold">{fmtKES(p.price)}</div>
                    {p.compare_price && (
                      <div className="text-[0.68rem] text-gray-300 line-through">{fmtKES(p.compare_price)}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className="font-bold"
                      style={{
                        color: p.stock_quantity > 8 ? "#27ae60" : p.stock_quantity > 3 ? "#f39c12" : "#e74c3c",
                      }}
                    >
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <button
                      onClick={() => toggleActive(p)}
                      className="px-2 py-1 text-[0.58rem] font-bold uppercase tracking-wide"
                      style={{
                        background: p.is_active ? "#efffef" : "#fff0f0",
                        color: p.is_active ? "#27ae60" : "#e74c3c",
                      }}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="btn-out px-2.5 py-1 text-[0.6rem]">
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="border border-[#fcc] bg-[#fff0f0] px-2.5 py-1 text-[0.6rem] font-semibold text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h2 className="pf text-xl font-bold">{editing ? "Edit Product" : "Add Product"}</h2>
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
              <FormField label="Product Name">
                <input
                  className="field"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  onBlur={() => !draft.slug && setDraft((d) => ({ ...d, slug: slugify(d.name) }))}
                  placeholder="e.g. Marble Print Midi Dress"
                  required
                />
              </FormField>
              <FormField label="URL Slug (auto-generated, editable)">
                <input
                  className="field"
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  className="field"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Price (KES)">
                  <input
                    type="number"
                    className="field"
                    value={draft.price}
                    onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                    min={0}
                    required
                  />
                </FormField>
                <FormField label="Compare Price (optional)">
                  <input
                    type="number"
                    className="field"
                    value={draft.compare_price ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, compare_price: e.target.value ? Number(e.target.value) : null }))
                    }
                    min={0}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Stock Quantity">
                  <input
                    type="number"
                    className="field"
                    value={draft.stock_quantity}
                    onChange={(e) => setDraft((d) => ({ ...d, stock_quantity: Number(e.target.value) }))}
                    min={0}
                  />
                </FormField>
                <FormField label="Badge">
                  <select
                    className="field"
                    value={draft.badge ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, badge: (e.target.value || null) as Draft["badge"] }))}
                  >
                    <option value="">None</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                  </select>
                </FormField>
              </div>
              <FormField label="SKU">
                <input
                  className="field"
                  value={draft.sku}
                  onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
                  placeholder="e.g. SK-CL-012"
                />
              </FormField>
              <FormField label="Colours (comma-separated, optional)">
                <input
                  className="field"
                  value={draft.colors}
                  onChange={(e) => setDraft((d) => ({ ...d, colors: e.target.value }))}
                  placeholder="e.g. Black, Purple"
                />
              </FormField>

              <div>
                <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
                  Product Photo
                </label>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  className="flex cursor-pointer flex-col items-center gap-2.5 border-2 border-dashed p-4 text-center transition-colors sm:flex-row sm:text-left"
                  style={{ borderColor: dragOver ? "#1a1a1a" : "#ddd", background: dragOver ? "#fafafa" : "transparent" }}
                >
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-[#f5f5f5]">
                    {draft.image ? (
                      draft.image.startsWith("blob:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.image} alt="" className="h-full w-full object-cover object-top" />
                      ) : (
                        <Image src={draft.image} alt="" fill sizes="96px" className="object-cover object-top" />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] text-gray-300">
                        No photo
                      </div>
                    )}
                    {(processing || uploading) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[0.55rem] font-bold uppercase tracking-wide text-white">
                        {processing ? "Reading…" : "Saving…"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-[0.72rem] text-gray-400">
                    <span className="font-semibold text-black">
                      {draft.image ? "Tap to replace photo" : "Tap to take or choose a photo"}
                    </span>
                    <br />
                    or drag one in here — works from your camera, gallery, or files, on any phone or
                    computer.
                    {processing && <div className="mt-1 font-semibold text-black">Reading photo…</div>}
                    {uploading && <div className="mt-1 font-semibold text-black">Saving to your catalogue…</div>}
                    {!processing && !uploading && draft.image && !draft.image.startsWith("blob:") && (
                      <div className="mt-1 font-semibold text-success">✓ Saved</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={processing || uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-[0.78rem]">
                <input
                  type="checkbox"
                  checked={draft.is_featured}
                  onChange={(e) => setDraft((d) => ({ ...d, is_featured: e.target.checked }))}
                />
                Feature on homepage
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
                  disabled={saving || uploading || processing}
                  className="btn-blk flex-[2] justify-center py-3 text-[0.7rem] disabled:opacity-50"
                >
                  {saving ? "SAVING…" : "✓ SAVE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">{label}</label>
      {children}
    </div>
  );
}
