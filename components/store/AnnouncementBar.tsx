import { waLink } from "@/lib/utils";

export function AnnouncementBar() {
  return (
    <div className="bg-black px-5 py-2.5 text-center text-[0.67rem] font-medium uppercase tracking-[0.18em] text-white">
      ALL CLOTHING KES 1,500 · FREE NATIONWIDE DELIVERY ·{" "}
      <a
        href={waLink("Hello! ✨")}
        target="_blank"
        rel="noreferrer"
        className="text-gold"
      >
        WHATSAPP 0734 807 511
      </a>{" "}
      · VISIT US IN STORE ✨
    </div>
  );
}
