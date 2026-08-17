import Link from "next/link";
import { PRODUCTS } from "@/lib/mock-data";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

export type ShopFilter = "Shop All" | "Clothing" | "Perfumes" | "Bath & Body" | "Sale";

const TABS: { label: ShopFilter; href: string }[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "Perfumes", href: "/shop/perfumes" },
  { label: "Bath & Body", href: "/shop/bath-body" },
];

const TITLES: Record<ShopFilter, string> = {
  "Shop All": "All Products",
  Clothing: "Shop Clothing",
  Perfumes: "Shop Perfumes",
  "Bath & Body": "Shop Bath & Body",
  Sale: "Sale",
};

export function ShopGrid({ filter }: { filter: ShopFilter }) {
  const shown = PRODUCTS.filter((p) => {
    if (filter === "Sale") return !!p.compare_price;
    if (filter === "Shop All") return true;
    return p.category === filter;
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-12 sm:px-10">
      <div className="mb-8">
        <span className="sec-label">
          {filter === "Sale" ? "Promotions" : filter === "Shop All" ? "Everything" : "Collection"}
        </span>
        <h1 className="sec-title">{TITLES[filter]}</h1>
      </div>

      {filter !== "Sale" && (
        <div className="mb-8 flex gap-0 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className={cn(
                "whitespace-nowrap border-b-2 border-transparent px-4.5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 transition-all hover:text-black",
                filter === t.label && "border-black text-black"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          No products found in this collection yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
