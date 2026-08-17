"use client";

import { useToastStore } from "@/store/toast";

export function ToastStack() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-[78px] right-[18px] z-[700] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toastIn flex max-w-[280px] items-center gap-2.5 bg-black px-4 py-3 text-white"
        >
          <span className="text-sm text-gold">✓</span>
          <div>
            <div className="text-[0.74rem] font-bold">{t.title}</div>
            <div className="mt-0.5 max-w-[190px] truncate text-[0.65rem] text-white/60">
              {t.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
