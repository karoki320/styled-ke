"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Receipt,
  MessageCircle,
  Truck,
  Settings,
  ArrowLeft,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAVS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/products", icon: ShoppingBag, label: "Products" },
  { href: "/admin/hero", icon: ImageIcon, label: "Hero Images" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/admin/pos", icon: Receipt, label: "POS" },
  { href: "/admin/whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { href: "/admin/delivery", icon: Truck, label: "Delivery Areas" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar — only the hamburger lives outside the off-canvas panel */}
      <div className="fixed inset-x-0 top-0 z-[190] flex h-14 items-center justify-between border-b border-white/10 bg-black px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/LOGO.jpg"
            alt=""
            width={28}
            height={28}
            className="rounded-full border-2 border-gold/40 object-cover"
          />
          <div className="pf text-[0.85rem] font-bold text-white">Styled.ke Admin</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center text-white/70"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[195] bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-[200] flex h-screen w-[230px] flex-col bg-black transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-2.5 border-b border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/LOGO.jpg"
              alt=""
              width={34}
              height={34}
              className="rounded-full border-2 border-gold/40 object-cover"
            />
            <div>
              <div className="pf text-[0.92rem] font-bold text-white">Styled.ke</div>
              <div className="text-[0.46rem] uppercase tracking-[0.2em] text-gold">
                Admin Panel
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center text-white/50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAVS.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} className={cn("anav", active && "act")}>
                <Icon size={16} strokeWidth={2} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="btn-out-w w-full justify-center gap-1.5 py-2 text-[0.64rem]">
            <ArrowLeft size={13} /> Back to Store
          </Link>
        </div>
      </div>
    </>
  );
}
