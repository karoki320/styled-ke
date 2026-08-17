import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

const HREF: Record<string, string> = {
  Clothing: "/shop/clothing",
  Perfumes: "/shop/perfumes",
  "Bath & Body": "/shop/bath-body",
};

export function Categories() {
  return (
    <div className="grid grid-cols-1 gap-[3px] sm:grid-cols-3">
      {CATEGORIES.map((c) => (
        <Link
          key={c.name}
          href={HREF[c.name] || "/shop"}
          className="group relative aspect-[3/4] overflow-hidden"
        >
          <Image
            src={c.image_url!}
            alt={c.name}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/[0.72] to-transparent to-55% p-6 pb-6">
            <div className="pf mb-1 text-[1.35rem] font-bold text-white">
              {c.name}
            </div>
            <div className="mb-3 text-[0.66rem] uppercase tracking-wide text-white/70">
              {c.description}
            </div>
            <div className="text-[0.63rem] font-bold uppercase tracking-wide text-gold">
              Shop Now →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
