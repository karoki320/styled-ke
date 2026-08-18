"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface HeroSlide {
  id: string;
  image_url: string;
  headline: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_href: string | null;
  /** 0-100, where the subject sits horizontally in the photo (50 = center).
   * Keeps the garment in frame when the crop narrows on small screens. */
  focal_x?: number;
}

/** Shown if Supabase isn't configured yet, or no slides have been added in
 * the admin panel — keeps the homepage looking finished either way. */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    image_url: "/images/hero/hero-1.jpg",
    headline: "Pleated Chiffon Dress",
    subtext: "KES 1,500",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
    focal_x: 25,
  },
  {
    id: "fallback-2",
    image_url: "/images/hero/hero-2.jpg",
    headline: "New Arrivals",
    subtext: "All KES 1,500",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
    focal_x: 50,
  },
  {
    id: "fallback-3",
    image_url: "/images/hero/hero-3.jpg",
    headline: "Marble Print Midi",
    subtext: "Nationwide Delivery",
    cta_label: "SHOP NOW",
    cta_href: "/shop",
    focal_x: 78,
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
          .select("id, image_url, headline, subtext, cta_label, cta_href, focal_x")
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
    <div className="relative h-[58vh] min-h-[420px] overflow-hidden bg-black sm:h-[88vh] sm:max-h-[780px] sm:min-h-[520px]">
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
            className="object-cover"
            style={{ objectPosition: `${s.focal_x ?? 50}% center` }}
          />
          {/* subtle darken so the centered CTA and text stay readable on any photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
        </div>
      ))}

      {/* Centered ecommerce-style CTA overlay */}
      <div className="pointer-events-none absolute inset-0 z-[6] flex flex-col items-center justify-center px-6 text-center">
        {slide?.headline && (
          <div className="pf mb-1.5 text-[1.5rem] font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-[2.4rem]">
            {slide.headline}
          </div>
        )}
        {slide?.subtext && (
          <div className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:mb-7 sm:text-[0.85rem]">
            {slide.subtext}
          </div>
        )}
        <Link
          href={slide?.cta_href || "/shop"}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto bg-cream-card px-9 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-black transition-all hover:scale-105 hover:bg-gold hover:text-white sm:px-12 sm:py-4 sm:text-[0.78rem]"
        >
          {slide?.cta_label || "SHOP NOW"}
        </Link>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-[6] flex -translate-x-1/2 gap-1.5 sm:bottom-8">
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
    </div>
  );
}
