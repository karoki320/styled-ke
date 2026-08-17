"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { fmtKES, waLink } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    pushToast("Added to Cart!", product.name);
  };

  return (
    <div
      className="group relative cursor-pointer bg-white"
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
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.badge === "NEW" && (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-black px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              New
            </span>
          )}
          {product.badge === "SALE" && discount && (
            <span className="absolute left-2.5 top-2.5 z-[2] bg-gold px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWish(!wish);
            }}
            className="absolute right-2.5 top-2.5 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
            style={{ color: wish ? "#e74c3c" : "#999" }}
            aria-label="Toggle wishlist"
          >
            {wish ? "♥" : "♡"}
          </button>
          {product.colors && product.colors.length > 1 && (
            <div className="absolute bottom-[54px] left-2 z-[1] flex gap-0.5">
              {product.colors.map((c) => (
                <div
                  key={c}
                  className="bg-white/[0.92] px-1.5 py-0.5 text-[0.5rem] font-semibold text-[#333]"
                >
                  {c.split(" / ")[0]}
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-0 flex-col gap-1.5 bg-gradient-to-t from-black/[0.15] to-transparent p-2 opacity-100 transition-all duration-300 lg:translate-y-2 lg:from-transparent lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            <button
              onClick={handleAdd}
              className="btn-blk w-full justify-center px-2.5 py-2.5 text-[0.62rem]"
            >
              ADD TO CART
            </button>
            <a
              href={waLink(
                `Hello Styled.ke! I'd like to order:\n🛍 *${product.name}*\n💰 ${fmtKES(product.price)} ✨`
              )}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-wa w-full justify-center px-2.5 py-[9px] text-[0.59rem]"
            >
              <WhatsAppIcon size={11} /> ORDER VIA WHATSAPP
            </a>
          </div>
        </div>
        <div className="px-0.5 py-2.5">
          <div className="mb-1 text-[0.57rem] font-semibold uppercase tracking-wide text-gray-400">
            {product.category}
          </div>
          <div className="mb-1.5 text-[0.86rem] font-medium leading-tight text-black">
            {product.name}
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
