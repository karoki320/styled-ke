import Link from "next/link";
import { PackageCheck, Mail, Truck, type LucideIcon } from "lucide-react";
import { fmtKES } from "@/lib/utils";

const STEPS: [LucideIcon, string, string][] = [
  [PackageCheck, "Order Placed", "Right now"],
  [Mail, "Receipt Emailed", "Right now"],
  [Truck, "Delivery", "1-3 business days"],
];

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; name?: string; total?: string; phone?: string; email?: string };
}) {
  const order = searchParams.order || "#SK-0000";
  const name = searchParams.name || "there";
  const total = Number(searchParams.total || 0);
  const email = searchParams.email || "";
  const firstName = name.split(" ")[0];

  return (
    <section className="mx-auto max-w-[520px] px-5 py-20 text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eefaf1]">
        <PackageCheck size={32} className="text-success" strokeWidth={1.75} />
      </div>
      <div className="border border-border p-8">
        <div className="mb-4.5 inline-block bg-black px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white">
          Order Confirmed!
        </div>
        <h1 className="pf mb-1.5 text-[1.7rem] font-bold">Thank you, {firstName}!</h1>
        <div className="mb-1.5 text-[0.88rem] font-bold text-gold">{order}</div>
        <p className="mb-5 text-[0.85rem] leading-loose text-[#777]">
          Your order of <strong>{fmtKES(total)}</strong> is confirmed.{" "}
          {email ? (
            <>
              A receipt has been sent to <strong>{email}</strong> — no calls, we&apos;ll just get
              your order to you.
            </>
          ) : (
            <>We don&apos;t call before delivery — we&apos;ll just get your order to you.</>
          )}
        </p>
        {STEPS.map(([Icon, title, sub], i) => (
          <div
            key={title}
            className="mb-1.5 flex items-center gap-2.5 bg-bg-light p-3 text-left"
          >
            <Icon size={17} className="flex-shrink-0 text-[#555]" />
            <div>
              <div className="text-[0.83rem] font-semibold">{title}</div>
              <div className="text-[0.7rem] text-gray-400">{sub}</div>
            </div>
            <div className="ml-auto text-[0.63rem] font-bold text-gold">Step {i + 1}</div>
          </div>
        ))}
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/shop" className="btn-blk w-full justify-center py-3.5 text-[0.7rem]">
            CONTINUE SHOPPING →
          </Link>
        </div>
      </div>
    </section>
  );
}
