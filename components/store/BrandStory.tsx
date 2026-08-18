import Image from "next/image";
import Link from "next/link";
import { waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const FEATURES = [
  "All clothing from KES 1,500 only",
  "Authentic & quality-checked products",
  "Nationwide delivery — fee calculated at checkout",
  "Visit our physical boutique in Nairobi",
];

export function BrandStory() {
  return (
    <section className="bg-cream-card px-6 py-16 sm:px-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-[72px]">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="relative row-span-2 aspect-[3/4]">
            <Image
              src="/images/IMG_PURPLE.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover object-top"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <Image
              src="/images/IMG_MARBLE.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover object-top"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <Image
              src="/images/IMG_BEIGE.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div>
          <span className="sec-label">Our Story</span>
          <h2 className="sec-title mb-4">
            From Our Boutique,
            <br />
            <em className="italic text-gold">To Your Door</em>
          </h2>
          <p className="mb-5.5 text-[0.88rem] leading-loose text-[#666]">
            Styled.ke is Nairobi&apos;s home for accessible, elevated fashion —
            our own exclusive clothing line, all KES 1,500. Hand-picked for
            quality, style, and value.
          </p>
          {FEATURES.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2.5 border-b border-border py-2 text-[0.8rem] text-[#444]"
            >
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-black text-[0.56rem] text-white">
                ✓
              </span>
              {f}
            </div>
          ))}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/shop/clothing" className="btn-blk px-5.5 py-3.5 text-[0.7rem]">
              SHOP CLOTHING →
            </Link>
            <a
              href={waLink("Hello Styled.ke! I'd like to know more about your products ✨")}
              target="_blank"
              rel="noreferrer"
              className="btn-wa px-5 py-3.5 text-[0.7rem]"
            >
              <WhatsAppIcon size={13} /> WHATSAPP US
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
