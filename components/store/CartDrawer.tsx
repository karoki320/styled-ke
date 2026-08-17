"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { fmtKES, waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
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
          "fixed right-0 top-0 z-[500] flex h-screen w-full max-w-[400px] translate-x-full flex-col border-l border-border bg-white shadow-[-6px_0_36px_rgba(0,0,0,0.06)] transition-transform duration-[360ms] ease-out",
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
              <div className="mb-3 text-4xl">🛍</div>
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
                key={item.productId}
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
                  <div className="mb-2 text-[0.8rem] font-bold text-gold">
                    {fmtKES(item.price)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="qty-btn h-6 w-6 border border-border bg-[#f5f5f5] text-sm hover:border-black hover:bg-black hover:text-white"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[0.82rem] font-bold">
                      {item.qty}
                    </span>
                    <button
                      className="qty-btn h-6 w-6 border border-border bg-[#f5f5f5] text-sm hover:border-black hover:bg-black hover:text-white"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
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
              <span className="text-[0.82rem] font-semibold text-success">FREE ✓</span>
            </div>
            <div className="mb-3.5 flex justify-between border-t border-border pt-2.5">
              <span className="pf text-base font-bold">Total</span>
              <span className="pf text-base font-bold">{fmtKES(sub)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="btn-blk mb-2 w-full justify-center px-5 py-3.5 text-[0.73rem]"
            >
              CHECKOUT →
            </Link>
            <a
              href={waLink(
                `Hello Styled.ke! 👋 I'd like to order:\n\n${items
                  .map((i) => `🛍 ${i.name} x${i.qty} — ${fmtKES(i.price * i.qty)}`)
                  .join("\n")}\n\n💰 *Total: ${fmtKES(sub)}*\n\nPlease confirm! ✨`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-wa block w-full justify-center px-4 py-2.5 text-[0.69rem]"
            >
              <WhatsAppIcon size={12} /> ORDER VIA WHATSAPP
            </a>
          </div>
        )}
      </div>
    </>
  );
}
