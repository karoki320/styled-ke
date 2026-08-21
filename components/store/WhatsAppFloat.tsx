import { waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink("Hello Styled.ke! I'm interested in your products ✨")}
      target="_blank"
      rel="noreferrer"
      className="animate-waPulse fixed bottom-[148px] right-[22px] z-[400] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-whatsapp transition-transform hover:scale-110 hover:[animation:none] lg:bottom-[88px]"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon size={23} color="#fff" />
    </a>
  );
}
