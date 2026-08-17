import { create } from "zustand";
import type { Product } from "@/types";

export interface POSLineItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export type POSPaymentMethod = "cash" | "mpesa" | "card" | "invoice";

interface POSCustomer {
  name: string;
  phone: string;
}

interface POSSessionState {
  isOpen: boolean;
  openedAt: string | null;
  openingFloat: number;
  cashSales: number;
  mpesaSales: number;
  cardSales: number;
  transactionCount: number;
}

interface POSState {
  sale: POSLineItem[];
  discount: number; // flat KES amount
  customer: POSCustomer | null;
  session: POSSessionState;

  addToSale: (product: Product) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromSale: (productId: string) => void;
  setDiscount: (amount: number) => void;
  setCustomer: (customer: POSCustomer | null) => void;
  subtotal: () => number;
  total: () => number;
  clearSale: () => void;

  openSession: (openingFloat: number) => void;
  closeSession: () => void;
  recordPayment: (method: POSPaymentMethod, amount: number) => void;
}

export const usePOSStore = create<POSState>()((set, get) => ({
  sale: [],
  discount: 0,
  customer: null,
  session: {
    isOpen: false,
    openedAt: null,
    openingFloat: 0,
    cashSales: 0,
    mpesaSales: 0,
    cardSales: 0,
    transactionCount: 0,
  },

  addToSale: (product) =>
    set((state) => {
      const existing = state.sale.find((i) => i.productId === product.id);
      if (existing) {
        return {
          sale: state.sale.map((i) =>
            i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        sale: [
          ...state.sale,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1,
          },
        ],
      };
    }),

  updateQty: (productId, qty) =>
    set((state) => {
      if (qty < 1) return { sale: state.sale.filter((i) => i.productId !== productId) };
      return {
        sale: state.sale.map((i) =>
          i.productId === productId ? { ...i, qty } : i
        ),
      };
    }),

  removeFromSale: (productId) =>
    set((state) => ({ sale: state.sale.filter((i) => i.productId !== productId) })),

  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),
  setCustomer: (customer) => set({ customer }),

  subtotal: () => get().sale.reduce((sum, i) => sum + i.price * i.qty, 0),
  total: () => Math.max(0, get().subtotal() - get().discount),

  clearSale: () => set({ sale: [], discount: 0, customer: null }),

  openSession: (openingFloat) =>
    set({
      session: {
        isOpen: true,
        openedAt: new Date().toISOString(),
        openingFloat,
        cashSales: 0,
        mpesaSales: 0,
        cardSales: 0,
        transactionCount: 0,
      },
    }),

  closeSession: () =>
    set((state) => ({ session: { ...state.session, isOpen: false } })),

  recordPayment: (method, amount) =>
    set((state) => ({
      session: {
        ...state.session,
        cashSales: state.session.cashSales + (method === "cash" ? amount : 0),
        mpesaSales:
          state.session.mpesaSales + (method === "mpesa" ? amount : 0),
        cardSales: state.session.cardSales + (method === "card" ? amount : 0),
        transactionCount: state.session.transactionCount + 1,
      },
    })),
}));
