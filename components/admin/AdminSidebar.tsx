"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAVS = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/orders", icon: "📦", label: "Orders" },
  { href: "/admin/products", icon: "🛍", label: "Products" },
  { href: "/admin/customers", icon: "👥", label: "Customers" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
  { href: "/admin/pos", icon: "🧾", label: "POS" },
  { href: "/admin/whatsapp", icon: "💬", label: "WhatsApp" },
  { href: "/admin/delivery", icon: "🚚", label: "Delivery Areas" },
  { href: "/admin/settings", icon: "⚙", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 z-[200] flex h-screen w-[230px] flex-col border-r border-border bg-white">
      <div className="flex items-center gap-2.5 border-b border-border p-4">
        <Image
          src="/images/LOGO.jpg"
          alt=""
          width={34}
          height={34}
          className="rounded-full border-2 border-gold/30 object-cover"
        />
        <div>
          <div className="pf text-[0.92rem] font-bold">Styled.ke</div>
          <div className="text-[0.46rem] uppercase tracking-[0.2em] text-gold">
            Admin Panel
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-1.5">
        {NAVS.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={cn("anav", active && "act")}>
              <span>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link href="/" className="btn-out w-full justify-center py-2 text-[0.64rem]">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}
