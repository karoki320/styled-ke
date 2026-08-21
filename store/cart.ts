import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem, Product } from "@/types";

// Two lines match (for adding/updating/removing) only when both the
// product AND the chosen colour agree — otherwise "Blue" and "Black" of the
// same dress would collapse into one line and the colour a customer picked
// would be lost by the time it reaches checkout and the order.
const sameLine = (i: CartLineItem, productId: string, variant?: string) =>
  i.productId === productId && (i.variant || undefined) === (variant || undefined);

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  addItem: (product: Product, qty?: number, variant?: string) => void;
  updateQty: (productId: string, qty: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, qty = 1, variant) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, product.id, variant));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product.id, variant) ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                variant,
                qty,
              },
            ],
          };
        }),

      updateQty: (productId, qty, variant) =>
        set((state) => {
          if (qty < 1) {
            return { items: state.items.filter((i) => !sameLine(i, productId, variant)) };
          }
          return {
            items: state.items.map((i) =>
              sameLine(i, productId, variant) ? { ...i, qty } : i
            ),
          };
        }),

      removeItem: (productId, variant) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variant)),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: "styled-ke-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
