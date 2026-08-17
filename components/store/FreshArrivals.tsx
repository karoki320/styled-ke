import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function FreshArrivals({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-14 pt-16 sm:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="sec-label">New In</span>
          <h2 className="sec-title">Fresh Arrivals</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-gold">
            All Clothing KES 1,500
          </div>
          <Link href="/shop" className="btn-out px-4.5 py-2.5 text-[0.65rem]">
            VIEW ALL →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
