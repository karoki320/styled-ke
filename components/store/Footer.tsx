import Image from "next/image";
import Link from "next/link";
import { waLink, WA_DISPLAY } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Clothing — KES 1,500", href: "/shop/clothing" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Sale", href: "/shop/sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", href: waLink("Hello Styled.ke! I need help ✨") },
      { label: "FAQs", href: "/#faqs" },
      { label: "Returns Policy", href: "/#returns" },
      { label: "Track Order", href: "/account" },
    ],
  },
  {
    title: "Styled.ke",
    links: [
      { label: "Our Story", href: "/#story" },
      { label: "Visit Our Store", href: waLink("Hi! Where is your boutique located?") },
      { label: "TikTok @styled.ke", href: "https://tiktok.com/@styled.ke" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-black px-6 pb-6 pt-14 sm:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Image
                src="/images/LOGO.jpg"
                alt="Styled.ke"
                width={40}
                height={40}
                className="rounded-full border-2 border-gold/30 object-cover"
              />
              <div>
                <div className="pf text-[1.1rem] font-bold text-white">Styled.ke</div>
                <div className="text-[0.46rem] uppercase tracking-[0.22em] text-gold">
                  Fashion &amp; Scents
                </div>
              </div>
            </div>
            <p className="mb-3.5 max-w-[210px] text-[0.78rem] leading-loose text-white/[0.42]">
              Nairobi&apos;s premium boutique. All clothing KES 1,500. Authentic,
              quality-checked fashion.
            </p>
            <a
              href={waLink("Hello Styled.ke! ✨")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-whatsapp"
            >
              <WhatsAppIcon size={12} color="#25D366" /> {WA_DISPLAY}
            </a>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-[0.61rem] font-bold uppercase tracking-[0.2em] text-white/[0.32]">
                {col.title}
              </div>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="block py-1 text-[0.78rem] text-white/[0.52] transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mb-4 h-px bg-white/[0.08]" />
        <div className="text-center text-[0.68rem] tracking-wide text-white/[0.26]">
          © {new Date().getFullYear()} Styled.ke. All rights reserved. Premium
          Kenyan Boutique.
        </div>
      </div>
    </footer>
  );
}
