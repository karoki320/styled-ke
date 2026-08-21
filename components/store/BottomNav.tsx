"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Grid3x3, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

// The Instagram-style bottom tab bar mobile shoppers already know how to
// use — thumb-reach icons for the handful of things someone actually needs
// while browsing on a phone, always in the same place regardless of scroll
// position. Desktop keeps the existing top NavBar; this only ever renders
// below the `lg` breakpoint (see the `lg:hidden` on the nav element), and
// the store layout adds matching bottom padding on mobile so page content
// and the footer never sit underneath it.
const CATEGORIES = [
  { label: "Shop All", href: "/shop" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "Sale", href: "/shop/sale" },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count());
  const openCart = useCartStore((s) => s.open);
  const [showCategories, setShowCategories] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {showCategories && (
        <div
          className="fixed inset-0 z-[290] bg-black/30 lg:hidden"
          onClick={() => setShowCategories(false)}
        >
          <div
            className="absolute bottom-[60px] left-3 right-3 border border-border bg-cream-card shadow-[0_-8px_28px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setShowCategories(false)}
                className="block border-b border-[#f0f0f0] px-5 py-3.5 text-[0.8rem] font-bold uppercase tracking-wide text-black last:border-b-0"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[280] border-t border-border bg-cream-card pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Quick navigation"
      >
        <div className="grid h-[60px] grid-cols-5">
          <TabLink href="/" icon={Home} label="Home" active={pathname === "/"} />
          <TabLink href="/shop" icon={Store} label="Shop" active={isActive("/shop")} />
          <TabButton
            icon={Grid3x3}
            label="Categories"
            active={showCategories}
            onClick={() => setShowCategories((v) => !v)}
          />
          <TabButton icon={ShoppingBag} label="Cart" active={false} onClick={openCart} badge={cartCount} />
          <TabLink href="/account" icon={User} label="Account" active={isActive("/account")} />
        </div>
      </nav>
    </>
  );
}

function TabLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 text-[0.58rem] font-semibold uppercase tracking-wide transition-colors",
        active ? "text-gold" : "text-[#888]"
      )}
    >
      <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
      {label}
    </Link>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 text-[0.58rem] font-semibold uppercase tracking-wide transition-colors",
        active ? "text-gold" : "text-[#888]"
      )}
    >
      <span className="relative">
        <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
        {!!badge && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-black text-[0.52rem] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}
