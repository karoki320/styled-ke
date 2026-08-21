"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { fmtKES, colorToCss } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [wish, setWish] = useState(false);
  const [hover, setHover] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const pushToast = useToastStore((s) => s.push);

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;
  const img = product.alt_image && hover ? product.alt_image : product.image;
  const outOfStock = product.stock_quantity <= 0;
  const lowStock = !outOfStock && product.stock_quantity <= product.low_stock_threshold;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product);
    pushToast("Added to Cart!", product.name);
  };

  return (
    <div
      className="group relative cursor-pointer bg-cream-card"
      onMouseEnter={() => product.alt_image && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(`/product/${product.slug}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(`/product/${product.slug}`);
        }}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="photo-grade object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            style={outOfStock ? { filter: "grayscale(0.6)", opacity: 0.6 } : undefined}
          />
          <div className="photo-vignette pointer-events-none absolute inset-0 z-[1]" />
          {outOfStock ? (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-[#1a1a1a] px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              Out of Stock
            </span>
          ) : product.badge === "NEW" ? (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-black px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              New
            </span>
          ) : product.badge === "SALE" && discount ? (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-gold px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          ) : lowStock ? (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-[#c0392b] px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              Only {product.stock_quantity} left
            </span>
          ) : null}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWish(!wish);
            }}
            className="absolute right-2.5 top-2.5 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-cream-card shadow-md transition-transform hover:scale-110"
            style={{ color: wish ? "#e74c3c" : "#999" }}
            aria-label="Toggle wishlist"
          >
            <Heart size={15} fill={wish ? "currentColor" : "none"} />
          </button>
          {product.colors && product.colors.length > 1 && (
            <div className="absolute bottom-2.5 left-2 z-[1] flex gap-1">
              {product.colors.map((c) => (
                <span
                  key={c}
                  title={c}
                  aria-hidden
                  className="h-3.5 w-3.5 rounded-full border border-white/70 shadow-sm"
                  style={{ background: colorToCss(c) }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="px-0.5 py-2.5">
          <div className="mb-1 text-[0.57rem] font-semibold uppercase tracking-wide text-gray-400">
            {product.category}
          </div>
          <div className="mb-1.5 flex items-start justify-between gap-2.5">
            <div className="text-[0.86rem] font-medium leading-tight text-black">
              {product.name}
            </div>
            {!outOfStock && (
              <button
                onClick={handleAdd}
                aria-label="Add to cart"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-[1.1rem] leading-none text-white transition-all hover:scale-110 hover:bg-gold"
              >
                +
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {product.compare_price ? (
              <>
                <span className="text-[0.9rem] font-bold text-gold">
                  {fmtKES(product.price)}
                </span>
                <span className="text-[0.76rem] text-gray-300 line-through">
                  {fmtKES(product.compare_price)}
                </span>
              </>
            ) : (
              <span className="text-[0.9rem] font-bold text-black">
                {fmtKES(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
