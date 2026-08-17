import { create } from "zustand";

interface ToastItem {
  id: number;
  title: string;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (title: string, message: string) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (title, message) => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, title, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
