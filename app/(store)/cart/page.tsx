"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { fmtKES, colorToCss } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQty, removeItem } = useCartStore();
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <ShoppingBag size={44} className="mx-auto mb-4 text-[#bbb]" strokeWidth={1.5} />
        <h1 className="pf mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-6 text-sm text-muted">
          Discover our premium collection — all clothing KES 1,500.
        </p>
        <Link href="/shop" className="btn-blk px-6 py-3.5 text-[0.72rem]">
          SHOP NOW →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[980px] px-6 py-12 sm:px-10">
      <h1 className="pf mb-8 text-[1.9rem] font-bold">Your Cart</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="border border-border">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variant || ""}`}
              className="flex gap-4 border-b border-[#f5f5f5] p-4 last:border-b-0"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={100}
                className="h-[100px] w-20 flex-shrink-0 object-cover object-top"
              />
              <div className="flex-1">
                <div className="mb-1 text-[0.6rem] uppercase tracking-wide text-gray-400">
                  {item.category}
                </div>
                <div className="mb-2 font-semibold">{item.name}</div>
                {item.variant && (
                  <div className="mb-2 flex items-center gap-1.5 text-[0.75rem] text-gray-400">
                    <span
                      aria-hidden
                      className="h-3 w-3 flex-shrink-0 rounded-full border border-black/15"
                      style={{ background: colorToCss(item.variant) }}
                    />
                    {item.variant}
                  </div>
                )}
                <div className="mb-3 font-bold text-gold">{fmtKES(item.price)}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="qty-btn h-7 w-7 border border-border bg-[#f5f5f5] hover:border-black hover:bg-black hover:text-white"
                    onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold">{item.qty}</span>
                  <button
                    className="qty-btn h-7 w-7 border border-border bg-[#f5f5f5] hover:border-black hover:bg-black hover:text-white"
                    onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="ml-auto text-[0.7rem] uppercase tracking-wide text-gray-300 hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-bold">{fmtKES(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-3 border border-border p-5">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{fmtKES(sub)}</span>
            </div>
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className="font-semibold text-gray-400">Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="pf font-bold">Subtotal</span>
              <span className="pf font-bold">{fmtKES(sub)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-blk mb-2 w-full justify-center py-3.5 text-[0.73rem]">
            CHECKOUT →
          </Link>
        </div>
      </div>
    </section>
  );
}
