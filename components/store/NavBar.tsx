"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const MENUS: Record<string, { label: string; href: string }[]> = {
  Clothing: [
    { label: "All Clothing", href: "/shop/clothing" },
    { label: "Kaftan Tops", href: "/shop/clothing" },
    { label: "Chiffon Dresses", href: "/shop/clothing" },
    { label: "Midi Dresses", href: "/shop/clothing" },
    { label: "New Arrivals", href: "/shop/clothing" },
  ],
  Sale: [
    { label: "All Sale", href: "/shop/sale" },
    { label: "Clothing Sale", href: "/shop/sale" },
  ],
};

const CATEGORY_HREF: Record<string, string> = {
  Clothing: "/shop/clothing",
  Sale: "/shop/sale",
};

export function NavBar() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count());
  const openCart = useCartStore((s) => s.open);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-[200] border-b border-border bg-cream-card">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:h-[66px] lg:px-10">
        <LogoMark size={38} />

        {/* Desktop nav (lg and up) */}
        <div className="hidden lg:flex lg:items-center">
          <NavBtn href="/" active={pathname === "/"}>
            Home
          </NavBtn>
          {Object.keys(MENUS).map((name) => (
            <div
              key={name}
              className="relative"
              onMouseEnter={() => setOpen(name)}
              onMouseLeave={() => setOpen(null)}
            >
              <NavBtn href={CATEGORY_HREF[name]} active={isActive(CATEGORY_HREF[name])}>
                {name} <span className="text-[0.5rem]">▾</span>
              </NavBtn>
              {open === name && (
                <div className="animate-dropIn absolute left-1/2 top-full z-[300] min-w-[185px] -translate-x-1/2 border border-border bg-cream-card shadow-[0_8px_28px_rgba(0,0,0,0.09)]">
                  {MENUS[name].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block whitespace-nowrap px-5 py-2.5 text-left text-[0.72rem] font-medium uppercase tracking-wide text-[#444] transition-all hover:bg-[#fafafa] hover:pl-6 hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <NavBtn href="/shop" active={pathname === "/shop"}>
            Shop All
          </NavBtn>
        </div>

        {/* Desktop right side (lg and up) */}
        <div className="hidden items-center gap-3.5 lg:flex">
          <Link
            href="/admin"
            className="bg-black px-3.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-white transition-all hover:bg-gold"
          >
            Sign In
          </Link>
          <button
            onClick={openCart}
            className="relative flex items-center gap-1.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-black transition-colors hover:text-gold"
          >
            <ShoppingBag size={15} /> Cart
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-black text-[0.57rem] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile right side (below lg) — real 44px tap targets */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-black text-[0.57rem] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={cn(
                "block h-[2px] w-6 bg-black transition-transform duration-200",
                mobileOpen && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 bg-black transition-opacity duration-200",
                mobileOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 bg-black transition-transform duration-200",
                mobileOpen && "-translate-y-[7px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel (below lg) */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-border bg-cream-card lg:hidden">
          <Link
            href="/"
            className="block px-5 py-4 text-[0.85rem] font-bold uppercase tracking-wide text-black"
          >
            Home
          </Link>
          {Object.keys(MENUS).map((name) => (
            <Link
              key={name}
              href={CATEGORY_HREF[name]}
              className="block border-t border-border px-5 py-4 text-[0.85rem] font-bold uppercase tracking-wide text-black"
            >
              {name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="block border-t border-border px-5 py-4 text-[0.85rem] font-bold uppercase tracking-wide text-black"
          >
            Shop All
          </Link>
          <Link
            href="/admin"
            className="block border-t border-border bg-cream px-5 py-4 text-[0.85rem] font-bold uppercase tracking-wide text-gold"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}

function NavBtn({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-1 px-4 py-[22px] text-[0.7rem] font-semibold uppercase tracking-wide text-black transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:origin-center after:scale-x-0 after:bg-gold after:transition-transform after:duration-250 hover:text-gold hover:after:scale-x-100",
        active && "text-gold after:scale-x-100"
      )}
    >
      {children}
    </Link>
  );
}
