"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function Hero() {
  const router = useRouter();
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push("/shop")}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push("/shop");
      }}
      className="relative grid h-[88vh] max-h-[840px] min-h-[560px] cursor-pointer grid-cols-2 overflow-hidden"
    >
      <div className="group relative overflow-hidden">
        <Image
          src="/images/IMG_MARBLE.jpg"
          alt="Marble Print Midi Dress"
          fill
          priority
          sizes="50vw"
          className="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute bottom-20 left-5 bg-white/[0.88] px-3.5 py-1.5 text-[0.63rem] font-bold uppercase tracking-wide text-black">
          Marble Print Midi · KES 1,500
        </div>
      </div>
      <div className="relative overflow-hidden">
        <Image
          src="/images/IMG_BEIGE.jpg"
          alt="Belted Maxi Dress"
          fill
          priority
          sizes="50vw"
          className="object-cover object-top transition-transform duration-[900ms] ease-out"
        />
        <div className="absolute bottom-20 right-5 bg-white/[0.88] px-3.5 py-1.5 text-[0.63rem] font-bold uppercase tracking-wide text-black">
          Belted Maxi · KES 1,500
        </div>
      </div>
      <div className="absolute inset-y-0 left-1/2 z-[5] w-[3px] bg-white opacity-15" />

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
            🚚 Free nationwide delivery
          </div>
          <Link href="/shop" className="btn-wht px-5 py-3 text-[0.72rem] sm:px-9 sm:py-3.5 sm:text-[0.75rem]">
            SHOP NOW →
          </Link>
          <a
            href={waLink("Hello Styled.ke! I'm interested in your products ✨")}
            target="_blank"
            rel="noreferrer"
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
