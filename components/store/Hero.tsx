"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { createClient } from "@/lib/supabase/client";

export interface HeroSlide {
  id: string;
  image_url: string;
  headline: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_href: string | null;
}

/** Shown if Supabase isn't configured yet, or no slides have been added in
 * the admin panel — keeps the homepage looking finished either way. */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    image_url: "/images/hero/hero-1.png",
    headline: "Pleated Chiffon Dress",
    subtext: "KES 1,500",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
  },
  {
    id: "fallback-2",
    image_url: "/images/hero/hero-2.png",
    headline: "New Arrivals",
    subtext: "All KES 1,500",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
  },
  {
    id: "fallback-3",
    image_url: "/images/hero/hero-3.png",
    headline: "Marble Print Midi",
    subtext: "Nationwide Delivery",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
  },
];

const ROTATE_MS = 5500;

export function Hero() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSlides() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("hero_slides")
          .select("id, image_url, headline, subtext, cta_label, cta_href")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (!cancelled && !error && data && data.length > 0) {
          setSlides(data);
        }
      } catch {
        // Supabase not configured (local dev) — fallback slides stay in place.
      }
    }
    loadSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const slide = slides[active] ?? slides[0];

  return (
    <div className="relative h-[88vh] max-h-[840px] min-h-[560px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          role="link"
          tabIndex={i === active ? 0 : -1}
          onClick={() => router.push(s.cta_href || "/shop")}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(s.cta_href || "/shop");
          }}
          className="absolute inset-0 cursor-pointer transition-opacity duration-700 ease-out"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
        >
          <Image
            src={s.image_url}
            alt={s.headline || "Styled.ke"}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      ))}

      {(slide?.headline || slide?.subtext) && (
        <div className="absolute bottom-24 left-5 z-[6] bg-white/[0.88] px-4 py-2 sm:bottom-28 sm:left-8">
          {slide.headline && (
            <div className="pf text-[0.95rem] font-bold text-black sm:text-[1.05rem]">
              {slide.headline}
            </div>
          )}
          {slide.subtext && (
            <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-gold">
              {slide.subtext}
            </div>
          )}
        </div>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 z-[6] flex -translate-x-1/2 gap-1.5 sm:bottom-[76px]">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActive(i);
              }}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? "20px" : "6px",
                background: i === active ? "#c9a96e" : "rgba(255,255,255,0.55)",
              }}
            />
          ))}
        </div>
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-2.5 bg-black/[0.72] px-3.5 py-3 backdrop-blur-sm sm:justify-between sm:gap-3 sm:px-10 sm:py-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hidden items-center gap-3.5 sm:flex">
          <Image
            src="/images/LOGO.jpg"
            alt="Styled.ke"
            width={38}
            height={38}
            className="rounded-full border-2 border-gold/50 object-cover"
          />
          <div>
            <div className="pf text-[0.95rem] font-bold leading-none text-white">
              Styled.ke
            </div>
            <div className="text-[0.7rem] uppercase tracking-wide text-white/65">
              Fashion &amp; Scents · Nairobi
            </div>
          </div>
          <div className="mx-2 h-7 w-px bg-white/15" />
          <div>
            <div className="text-[0.7rem] uppercase tracking-wide text-white/65">
              All clothing from
            </div>
            <div className="pf text-base font-bold text-gold">KES 1,500</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-[0.65rem] uppercase tracking-wide text-white/50 lg:block">
            🚚 Nationwide delivery
          </div>
          <Link
            href={slide?.cta_href || "/shop"}
            onClick={(e) => e.stopPropagation()}
            className="btn-wht px-5 py-3 text-[0.72rem] sm:px-9 sm:py-3.5 sm:text-[0.75rem]"
          >
            {slide?.cta_label || "SHOP NOW"} →
          </Link>
          <a
            href={waLink("Hello Styled.ke! I'm interested in your products ✨")}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="btn-wa px-3.5 py-3 text-[0.68rem] sm:px-5 sm:text-[0.72rem]">
              <WhatsAppIcon size={14} /> WHATSAPP
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
