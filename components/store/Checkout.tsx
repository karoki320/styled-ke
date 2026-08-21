"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";
import { ShoppingBag, CreditCard, Smartphone, Mail, DoorOpen } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { fmtKES, waLink, colorToCss } from "@/lib/utils";
import { DELIVERY_OPTIONS } from "@/lib/mock-data";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { DeliveryMethodId } from "@/types";

interface FormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
  payment: "paystack" | "mpesa";
  deliveryMethod: DeliveryMethodId;
  address: string;
  city: string;
  destination: string;
  sacco: string;
  zone: string;
  agent: string;
  pickupAddress: string;
}

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri", "Machakos"];

export function Checkout() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    notes: "",
    payment: "mpesa",
    deliveryMethod: "rider",
    address: "",
    city: "Nairobi",
    destination: "",
    sacco: "",
    zone: "",
    agent: "",
    pickupAddress: "",
  });

  const upd = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const delOpt = DELIVERY_OPTIONS.find((d) => d.id === form.deliveryMethod)!;
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub + delOpt.fee;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <ShoppingBag size={44} className="mx-auto mb-4 text-[#bbb]" strokeWidth={1.5} />
        <h1 className="pf mb-2 text-2xl font-bold">Nothing to check out yet</h1>
        <p className="mb-6 text-sm text-muted">Add something to your cart first.</p>
        <Link href="/shop" className="btn-blk px-6 py-3.5 text-[0.72rem]">
          SHOP NOW →
        </Link>
      </section>
    );
  }

  // One combined check instead of gating progress step-by-step — the whole
  // form is on one page now, so validation happens once, at the moment
  // someone actually taps "Place Order".
  const validate = () => {
    if (!form.name.trim() || !form.phone.trim()) return "Please add your name and phone number.";
    const m = form.deliveryMethod;
    if (m === "rider" && !form.address) return "Enter your delivery address.";
    if (m === "matatu" && (!form.destination || !form.sacco)) return "Enter your destination and sacco.";
    if (m === "mtaani" && (!form.zone || !form.agent)) return "Enter your zone and pickup agent.";
    if (m === "doorstep" && !form.pickupAddress) return "Enter your pickup address.";
    return null;
  };

  const handlePlace = async () => {
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          notes: form.notes || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            color: i.variant,
          })),
          subtotal: sub,
          deliveryFee: delOpt.fee,
          total,
          deliveryMethod: form.deliveryMethod,
          deliveryDetails: {
            delivery_address: form.address,
            delivery_city: form.city,
            delivery_zone: form.zone,
            delivery_agent: form.agent,
          },
          paymentMethod: form.payment === "paystack" ? "paystack" : form.payment,
        }),
      });
      const data = await res.json();

      if (form.payment === "paystack") {
        const initRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email || `${form.phone.replace(/\D/g, "")}@styled.ke`,
            amount: total,
            reference: data.orderNumber,
            metadata: { orderNumber: data.orderNumber, phone: form.phone },
          }),
        });
        if (initRes.ok) {
          const initData = await initRes.json();
          clear();
          window.location.href = initData.data.authorization_url;
          return;
        }
      }

      clear();
      const params = new URLSearchParams({
        order: data.orderNumber,
        name: form.name,
        total: String(total),
        phone: form.phone,
        ...(form.email ? { email: form.email } : {}),
      });
      router.push(`/checkout/success?${params.toString()}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong placing your order. Please try WhatsApp instead.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="mx-auto max-w-[980px] px-6 pb-20 pt-9 sm:px-10">
      <Link
        href="/shop"
        className="mb-7 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400"
      >
        ← Continue Shopping
      </Link>
      <div className="mb-7 text-center">
        <h1 className="pf mb-1.5 text-[1.9rem] font-bold">Checkout</h1>
        <p className="text-[0.78rem] text-gray-400">
          Fill this in once, then tap Place Order — that&rsquo;s it.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6 border border-border p-6">
          {/* One page, top to bottom — no "next step" clicks. Everything
              needed to place the order lives here; the button at the very
              bottom is the only one that matters. */}
          <div>
            <div className="pf mb-3.5 text-[1.05rem] font-bold">Your Details</div>
            <div className="flex flex-col gap-3">
              <Field label="Full Name" value={form.name} onChange={(v) => upd("name", v)} placeholder="e.g. Amina Wanjiru" />
              <Field label="Phone" value={form.phone} onChange={(v) => upd("phone", v)} placeholder="e.g. 0712 345 678" type="tel" />
              <Field label="Email (optional, for your receipt)" value={form.email} onChange={(v) => upd("email", v)} placeholder="amina@gmail.com" type="email" />
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="self-start text-[0.68rem] font-bold uppercase tracking-wide text-gray-400 underline underline-offset-2"
                >
                  + Add a note (optional)
                </button>
              ) : (
                <textarea
                  className="field resize-y"
                  rows={2}
                  autoFocus
                  value={form.notes}
                  onChange={(e) => upd("notes", e.target.value)}
                  placeholder="Anything else we should know?"
                />
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="pf mb-3.5 text-[1.05rem] font-bold">Delivery</div>
            <div className="flex flex-col gap-2.5">
              {DELIVERY_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => upd("deliveryMethod", opt.id)}
                  className="cursor-pointer border-[1.5px] p-4 transition-all hover:border-[#888]"
                  style={{
                    borderColor: form.deliveryMethod === opt.id ? "#1a1a1a" : "#e8e8e8",
                    background: form.deliveryMethod === opt.id ? "#fafafa" : "#fff",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <opt.icon size={20} className="flex-shrink-0 text-[#555]" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-[0.84rem] font-bold">{opt.label}</div>
                        <div className="text-[0.8rem] font-bold text-gold">{opt.feeLabel}</div>
                      </div>
                      <div className="mt-0.5 text-[0.7rem] text-gray-400">{opt.desc}</div>
                    </div>
                    <div
                      className="flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        border: `2px solid ${form.deliveryMethod === opt.id ? "#1a1a1a" : "#ddd"}`,
                      }}
                    >
                      {form.deliveryMethod === opt.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-black" />
                      )}
                    </div>
                  </div>
                  {form.deliveryMethod === opt.id && (
                    <div
                      className="mt-3.5 flex flex-col gap-2.5 border-t border-border pt-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {opt.id === "rider" && (
                        <>
                          <Field label="Delivery Address" value={form.address} onChange={(v) => upd("address", v)} placeholder="Estate, street e.g. Westlands" />
                          <select className="field" value={form.city} onChange={(e) => upd("city", e.target.value)}>
                            {CITIES.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <div className="flex items-start gap-1.5 bg-cream-card p-2.5 text-[0.71rem] text-[#555]">
                            <Mail size={14} className="mt-0.5 flex-shrink-0" />
                            <span>We won&apos;t call — your receipt is emailed right away.</span>
                          </div>
                        </>
                      )}
                      {opt.id === "matatu" && (
                        <>
                          <Field label="Destination / Stage" value={form.destination} onChange={(v) => upd("destination", v)} placeholder="e.g. Rongai Terminus" />
                          <Field label="Sacco / Bus Route" value={form.sacco} onChange={(v) => upd("sacco", v)} placeholder="e.g. Citi Hoppa Route 9" />
                        </>
                      )}
                      {opt.id === "mtaani" && (
                        <>
                          <Field label="Zone / Area" value={form.zone} onChange={(v) => upd("zone", v)} placeholder="e.g. Kasarani Zone 3" />
                          <Field label="Pickup Agent" value={form.agent} onChange={(v) => upd("agent", v)} placeholder="e.g. Mama Njeri Shop" />
                        </>
                      )}
                      {opt.id === "doorstep" && (
                        <>
                          <Field label="Pickup Address" value={form.pickupAddress} onChange={(v) => upd("pickupAddress", v)} placeholder="e.g. Opp. Total Petrol, Huruma" />
                          <div className="flex items-start gap-1.5 border border-[#b7efc5] bg-[#f0fff4] p-2.5 text-[0.71rem] text-[#555]">
                            <DoorOpen size={14} className="mt-0.5 flex-shrink-0" />
                            <span>Final price confirmed via WhatsApp based on exact location.</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="pf mb-3.5 text-[1.05rem] font-bold">Payment</div>
            {[
                { id: "paystack" as const, icon: CreditCard, label: "Card / M-Pesa (Paystack)", desc: "Secure online payment — instant confirmation." },
                { id: "mpesa" as const, icon: Smartphone, label: "M-Pesa Paybill", desc: "Pay manually via M-Pesa Paybill." },
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => upd("payment", pm.id)}
                  className="mb-2.5 cursor-pointer p-4 transition-all"
                  style={{
                    border: `1.5px solid ${form.payment === pm.id ? "#1a1a1a" : "#e8e8e8"}`,
                    background: form.payment === pm.id ? "#fafafa" : "#fff",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <pm.icon size={20} className="flex-shrink-0 text-[#555]" />
                    <div>
                      <div className="text-[0.84rem] font-bold">{pm.label}</div>
                      <div className="text-[0.7rem] text-gray-400">{pm.desc}</div>
                    </div>
                    <div
                      className="ml-auto flex h-[15px] w-[15px] items-center justify-center rounded-full"
                      style={{ border: `2px solid ${form.payment === pm.id ? "#1a1a1a" : "#ddd"}` }}
                    >
                      {form.payment === pm.id && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                </div>
              ))}
              {form.payment === "mpesa" && (
                <div className="mb-3.5 border border-border bg-cream-card p-3.5 text-[0.74rem] leading-loose">
                  <strong className="text-gold">M-Pesa Steps:</strong>
                  <br />
                  1. M-Pesa → Lipa na M-Pesa → Paybill
                  <br />
                  2. Business No: <strong>247 247</strong>
                  <br />
                  3. Account No: <strong>094 903</strong>
                  <br />
                  4. Amount: <strong>{fmtKES(total)}</strong>
                </div>
              )}
          </div>

          {formError && (
            <p className="border border-[#f5c6cb] bg-[#fdecea] p-2.5 text-[0.78rem] text-[#a94442]">
              {formError}
            </p>
          )}

          <button
            className="btn-blk w-full justify-center py-4 text-[0.78rem] disabled:opacity-60"
            onClick={handlePlace}
            disabled={placing}
          >
            {placing ? "PLACING ORDER…" : `✓ PLACE ORDER — ${fmtKES(total)}`}
          </button>
        </div>

        <div>
          <div className="mb-3 border border-border p-5">
            <div className="pf mb-3.5 text-[0.92rem] font-bold">Order Summary</div>
            {items.map((i) => (
              <div key={`${i.productId}-${i.variant || ""}`} className="mb-2.5 flex items-center gap-2.5">
                <NextImage
                  src={i.image}
                  alt={i.name}
                  width={44}
                  height={56}
                  className="h-14 w-11 flex-shrink-0 object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.76rem] font-semibold leading-tight">{i.name}</div>
                  <div className="flex items-center gap-1 text-[0.68rem] text-gray-400">
                    {i.variant && (
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-black/15"
                        style={{ background: colorToCss(i.variant) }}
                      />
                    )}
                    {i.variant ? `${i.variant} · ` : ""}× {i.qty}
                  </div>
                </div>
                <div className="flex-shrink-0 text-[0.8rem] font-bold">{fmtKES(i.price * i.qty)}</div>
              </div>
            ))}
            <div className="my-2.5 h-px bg-border" />
            <div className="mb-1 flex justify-between text-[0.8rem]">
              <span className="text-gray-400">Subtotal</span>
              <span>{fmtKES(sub)}</span>
            </div>
            <div className="mb-2.5 flex justify-between text-[0.8rem]">
              <span className="text-gray-400">Delivery</span>
              <span className="font-semibold">
                {delOpt.fee > 0 ? fmtKES(delOpt.fee) : delOpt.feeLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="pf font-bold">Total</span>
              <span className="pf font-bold">{fmtKES(total)}</span>
            </div>
          </div>
          <a
            href={waLink("Hello Styled.ke! I need help with my order ✨")}
            target="_blank"
            rel="noreferrer"
            className="btn-wa w-full justify-center py-2.5 text-[0.69rem]"
          >
            <WhatsAppIcon size={12} /> NEED HELP? CHAT WITH US
          </a>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
        {label}
      </label>
      <input
        type={type}
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
