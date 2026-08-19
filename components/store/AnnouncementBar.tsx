"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  message: string;
  link_href: string | null;
}

/** Shown if Supabase isn't configured yet, or no announcements have been
 * added in the admin panel — keeps the bar looking finished either way. */
const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: "fallback-1", message: "All clothing KES 1,500 · Nationwide delivery", link_href: "/shop" },
  { id: "fallback-2", message: "Chat with us on WhatsApp: 0734 807 511", link_href: "https://wa.me/254734807511?text=Hello!" },
  { id: "fallback-3", message: "Visit us in store", link_href: null },
];

const ROTATE_MS = 4200;

export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>(FALLBACK_ANNOUNCEMENTS);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("announcements")
          .select("id, message, link_href")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (!cancelled && !error && data && data.length > 0) {
          setItems(data);
        }
      } catch {
        // Supabase not configured (local dev) — fallback messages stay in place.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  return (
    <div className="relative h-[34px] overflow-hidden bg-black px-5 text-center text-[0.67rem] font-medium uppercase tracking-[0.18em] text-white">
      {items.map((item, i) => {
        const content = item.message;
        const body = item.link_href ? (
          item.link_href.startsWith("http") ? (
            <a href={item.link_href} target="_blank" rel="noreferrer" className="hover:text-gold">
              {content}
            </a>
          ) : (
            <Link href={item.link_href} className="hover:text-gold">
              {content}
            </Link>
          )
        ) : (
          <span>{content}</span>
        );
        return (
          <div
            key={item.id}
            className="absolute inset-x-0 top-0 flex h-[34px] items-center justify-center px-8 transition-all duration-500 ease-out"
            style={{
              opacity: i === active ? 1 : 0,
              transform: `translateY(${i === active ? 0 : i < active ? -10 : 10}px)`,
              pointerEvents: i === active ? "auto" : "none",
            }}
            aria-hidden={i !== active}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
