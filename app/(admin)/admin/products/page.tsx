"use client";

import { useState } from "react";
import Image from "next/image";
import { PRODUCTS as INITIAL_PRODUCTS } from "@/lib/mock-data";
import { fmtKES, slugify } from "@/lib/utils";
import type { Product } from "@/types";

const CATEGORIES: Product["category"][] = ["Clothing"];

const emptyDraft: Omit<Product, "id"> = {
  name: "",
  slug: "",
  description: "",
  category: "Clothing",
  price: 1500,
  compare_price: null,
  stock_quantity: 10,
  low_stock_threshold: 5,
  badge: "NEW",
  is_active: true,
  is_featured: false,
  sku: "",
  image: "/images/IMG_MARBLE.jpg",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Product["category"]>("All");

  const filtered = products.filter((p) => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleSave = (draft: Omit<Product, "id">) => {
    if (editing) {
      setProducts((list) => list.map((p) => (p.id === editing.id ? { ...draft, id: editing.id } : p)));
    } else {
      setProducts((list) => [{ ...draft, id: `new-${Date.now()}` }, ...list]);
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) =>
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)));

  const remove = (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setProducts((list) => list.filter((p) => p.id !== id));
  };

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

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <input
          className="field max-w-xs"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
        >
          <option>All</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#fafafa]">
              {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3.5 py-2.5 text-left text-[0.58rem] font-bold uppercase tracking-wide text-gray-400">
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
                <td className="px-3.5 py-2.5 text-[0.72rem] text-gray-400">{p.category}</td>
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
                    onClick={() => toggleActive(p.id)}
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

      {showForm && (
        <ProductFormModal
          initial={editing || emptyDraft}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Product | Omit<Product, "id">;
  onClose: () => void;
  onSave: (draft: Omit<Product, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>(initial);
  const upd = <K extends keyof Product>(key: K, value: Product[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-[600] flex animate-fadeIn items-center justify-center bg-black/45 p-5" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="pf text-xl font-bold">
            {"id" in initial ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400">
            ×
          </button>
        </div>

        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) {
              alert("Product name is required.");
              return;
            }
            onSave({ ...form, slug: form.slug || slugify(form.name) });
          }}
        >
          <FormField label="Product Name">
            <input
              className="field"
              value={form.name}
              onChange={(e) => upd("name", e.target.value)}
              onBlur={() => !form.slug && upd("slug", slugify(form.name))}
              placeholder="e.g. Marble Print Midi Dress"
              required
            />
          </FormField>
          <FormField label="URL Slug (auto-generated, editable)">
            <input
              className="field"
              value={form.slug}
              onChange={(e) => upd("slug", slugify(e.target.value))}
            />
          </FormField>
          <FormField label="Description">
            <textarea
              className="field"
              rows={3}
              value={form.description}
              onChange={(e) => upd("description", e.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <select
                className="field"
                value={form.category}
                onChange={(e) => upd("category", e.target.value as Product["category"])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Badge">
              <select
                className="field"
                value={form.badge ?? ""}
                onChange={(e) => upd("badge", (e.target.value || null) as Product["badge"])}
              >
                <option value="">None</option>
                <option value="NEW">NEW</option>
                <option value="SALE">SALE</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (KES)">
              <input
                type="number"
                className="field"
                value={form.price}
                onChange={(e) => upd("price", Number(e.target.value))}
                min={0}
                required
              />
            </FormField>
            <FormField label="Compare Price (optional)">
              <input
                type="number"
                className="field"
                value={form.compare_price ?? ""}
                onChange={(e) => upd("compare_price", e.target.value ? Number(e.target.value) : null)}
                min={0}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Stock Quantity">
              <input
                type="number"
                className="field"
                value={form.stock_quantity}
                onChange={(e) => upd("stock_quantity", Number(e.target.value))}
                min={0}
              />
            </FormField>
            <FormField label="Low Stock Threshold">
              <input
                type="number"
                className="field"
                value={form.low_stock_threshold}
                onChange={(e) => upd("low_stock_threshold", Number(e.target.value))}
                min={0}
              />
            </FormField>
          </div>
          <FormField label="SKU">
            <input
              className="field"
              value={form.sku}
              onChange={(e) => upd("sku", e.target.value)}
              placeholder="e.g. SK-CL-012"
            />
          </FormField>
          <FormField label="Product Image">
            <input
              type="file"
              accept="image/*"
              className="field"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upd("image", URL.createObjectURL(file));
              }}
            />
            <p className="mt-1 text-[0.68rem] text-gray-400">
              Uploads go to Supabase Storage (product-images bucket) once connected — for now this
              previews locally.
            </p>
          </FormField>
          <label className="flex items-center gap-2 text-[0.78rem]">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => upd("is_featured", e.target.checked)}
            />
            Feature on homepage
          </label>

          <div className="mt-2 flex gap-2.5">
            <button type="button" onClick={onClose} className="btn-out flex-1 justify-center py-3 text-[0.7rem]">
              CANCEL
            </button>
            <button type="submit" className="btn-blk flex-[2] justify-center py-3 text-[0.7rem]">
              ✓ SAVE PRODUCT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
        {label}
      </label>
      {children}
    </div>
  );
}
