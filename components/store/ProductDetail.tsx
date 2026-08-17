"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, CircleCheck, Package, MessageCircle, type LucideIcon } from "lucide-react";
import type { Product } from "@/types";
import { fmtKES } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ProductCard } from "./ProductCard";

const PERKS: [LucideIcon, string][] = [
  [Truck, "Nationwide delivery — fee calculated at checkout"],
  [CircleCheck, "Authentic Styled.ke product"],
  [Package, "Premium packaging"],
  [MessageCircle, "WhatsApp: 0734 807 511"],
];

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(product.image);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => setActiveImg(product.image), [product.id]);

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 sm:px-10">
      <Link
        href="/shop"
        className="mb-8 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400"
      >
        ← Back to Shop
      </Link>

      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-[68px]">
        <div>
          <div className="relative mb-2.5 aspect-[3/4] bg-[#f8f8f8]">
            <Image
              src={activeImg}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
            {product.badge === "NEW" && (
              <span className="absolute left-4 top-4 bg-black px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
                New
              </span>
            )}
            {product.badge === "SALE" && discount && (
              <span className="absolute left-4 top-4 bg-gold px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
                -{discount}%
              </span>
            )}
          </div>
          {product.alt_image && (
            <div className="flex gap-2">
              {[product.image, product.alt_image].map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(img)}
                  className="relative h-[90px] w-[68px] flex-shrink-0 overflow-hidden bg-[#f8f8f8]"
                  style={{
                    border: `2px solid ${activeImg === img ? "#1a1a1a" : "transparent"}`,
                  }}
                >
                  <Image src={img} alt="" fill sizes="68px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2.5">
          <div className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gray-400">
            {product.category}
          </div>
          <h1 className="pf mb-3 text-[1.95rem] font-bold leading-tight">
            {product.name}
          </h1>
          <div className="mb-4.5 flex items-center gap-3">
            {product.compare_price ? (
              <>
                <span className="text-2xl font-bold text-gold">{fmtKES(product.price)}</span>
                <span className="text-base text-gray-300 line-through">
                  {fmtKES(product.compare_price)}
                </span>
                <span className="bg-gold px-2.5 py-1 text-[0.6rem] font-bold text-white">
                  Save {discount}%
                </span>
              </>
            ) : (
              <span className="text-[1.4rem] font-bold">{fmtKES(product.price)}</span>
            )}
          </div>
          <div className="mb-4.5 h-px bg-border" />
          <p className="mb-5 text-[0.87rem] leading-loose text-[#666]">
            {product.description}
          </p>

          {product.colors && product.colors.length > 1 && (
            <div className="mb-4.5">
              <div className="mb-2 text-[0.62rem] font-bold uppercase tracking-wide text-[#888]">
                Available Colours
              </div>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <div
                    key={c}
                    className="cursor-pointer border border-border px-3.5 py-1.5 text-[0.7rem] font-semibold transition-colors hover:border-black"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5 flex items-center gap-2.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#888]">
              Qty:
            </span>
            <button
              className="qty-btn h-[30px] w-[30px] border border-border bg-[#f5f5f5] hover:border-black hover:bg-black hover:text-white"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <span className="w-[34px] text-center font-bold">{qty}</span>
            <button
              className="qty-btn h-[30px] w-[30px] border border-border bg-[#f5f5f5] hover:border-black hover:bg-black hover:text-white"
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
            <span className="ml-2 text-[0.68rem] font-semibold text-success">
              ✓ {product.stock_quantity} in stock
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleAdd}
              className="btn-blk justify-center px-4 py-4 text-[0.73rem]"
              style={added ? { background: "#27ae60" } : undefined}
            >
              {added ? "✓ ADDED TO CART" : "ADD TO CART"}
            </button>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            {PERKS.map(([Icon, text]) => (
              <div
                key={text}
                className="flex items-center gap-2 border-b border-[#f0f0f0] py-1.5 text-[0.75rem] text-[#666]"
              >
                <Icon size={14} className="flex-shrink-0 text-[#999]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <div className="mb-5.5">
            <span className="sec-label">You May Also Like</span>
          </div>
          <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
