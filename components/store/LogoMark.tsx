import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/images/LOGO.jpg"
        alt="Styled.ke"
        width={size}
        height={size}
        className="rounded-full border-2 border-gold/35 object-cover"
      />
      <div>
        <div className="pf text-[1.3rem] font-bold leading-none tracking-tight text-black">
          Styled.ke
        </div>
        <div className="mt-0.5 text-[0.47rem] uppercase tracking-[0.25em] text-gold">
          Fashion &amp; Scents
        </div>
      </div>
    </Link>
  );
}
