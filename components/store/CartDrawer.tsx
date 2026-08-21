"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { fmtKES, colorToCss } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, updateQty, removeItem } = useCartStore();
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[499] pointer-events-none bg-black/30 opacity-0 transition-opacity duration-300",
          isOpen && "pointer-events-auto opacity-100"
        )}
        onClick={close}
      />
      <div
        className={cn(
          "fixed right-0 top-0 z-[500] flex h-screen w-full max-w-[400px] translate-x-full flex-col border-l border-border bg-cream-card shadow-[-6px_0_36px_rgba(0,0,0,0.06)] transition-transform duration-[360ms] ease-out",
          isOpen && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5.5 py-4.5">
          <div>
            <div className="pf text-[1.15rem] font-bold">Your Cart</div>
            <div className="mt-0.5 text-[0.66rem] uppercase tracking-wide text-gray-400">
              {totalQty} items
            </div>
          </div>
          <button onClick={close} className="text-2xl leading-none text-gray-400" aria-label="Close cart">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2.5">
          {items.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ShoppingBag size={36} className="mx-auto mb-3 text-[#bbb]" strokeWidth={1.5} />
              <div className="pf mb-2 text-base">Your cart is empty</div>
              <p className="mb-5 text-[0.8rem] text-gray-400">
                Discover our premium collection
              </p>
              <Link href="/shop" onClick={close} className="btn-blk px-5.5 py-2.5 text-[0.7rem]">
                SHOP NOW →
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variant || ""}`}
                className="flex gap-3 border-b border-[#f5f5f5] py-3.5"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={68}
                  height={86}
                  className="h-[86px] w-[68px] flex-shrink-0 object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[0.58rem] uppercase tracking-wide text-gray-400">
                    {item.category}
                  </div>
                  <div className="mb-1.5 text-[0.83rem] font-semibold leading-tight">
                    {item.name}
                  </div>
                  {item.variant && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] text-gray-400">
                      <span
                        aria-hidden
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-black/15"
                        style={{ background: colorToCss(item.variant) }}
                      />
                      {item.variant}
                    </div>
                  )}
                  <div className="mb-2 text-[0.8rem] font-bold text-gold">
                    {fmtKES(item.price)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="qty-btn h-6 w-6 border border-border bg-[#f5f5f5] text-sm hover:border-black hover:bg-black hover:text-white"
                      onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[0.82rem] font-bold">
                      {item.qty}
                    </span>
                    <button
                      className="qty-btn h-6 w-6 border border-border bg-[#f5f5f5] text-sm hover:border-black hover:bg-black hover:text-white"
                      onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variant)}
                      className="ml-auto text-[0.68rem] uppercase tracking-wide text-gray-300 transition-colors hover:text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-1 flex justify-between">
              <span className="text-[0.82rem] text-gray-400">Subtotal</span>
              <span className="font-semibold">{fmtKES(sub)}</span>
            </div>
            <div className="mb-4 flex justify-between">
              <span className="text-[0.82rem] text-gray-400">Delivery</span>
              <span className="text-[0.82rem] font-semibold text-gray-400">Calculated at checkout</span>
            </div>
            <div className="mb-3.5 flex justify-between border-t border-border pt-2.5">
              <span className="pf text-base font-bold">Subtotal</span>
              <span className="pf text-base font-bold">{fmtKES(sub)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="btn-blk mb-2 w-full justify-center px-5 py-3.5 text-[0.73rem]"
            >
              CHECKOUT →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
