"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Receipt, Banknote, Smartphone, CreditCard, FileText, CircleCheck, Printer, type LucideIcon } from "lucide-react";
import { PRODUCTS } from "@/lib/mock-data";
import { fmtKES } from "@/lib/utils";
import { usePOSStore, type POSPaymentMethod } from "@/store/pos";
import type { Product } from "@/types";

const CATEGORY_TABS: ("All" | Product["category"])[] = ["All", "Clothing"];

export default function POSPage() {
  const session = usePOSStore((s) => s.session);
  const openSession = usePOSStore((s) => s.openSession);

  if (!session.isOpen) {
    return <OpenSessionScreen onOpen={openSession} />;
  }

  return <POSWorkspace />;
}

function OpenSessionScreen({ onOpen }: { onOpen: (float: number) => void }) {
  const [float, setFloat] = useState("2000");
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm border border-border bg-white p-8 text-center">
        <Receipt size={30} className="mx-auto mb-2 text-[#555]" />
        <h1 className="pf mb-1 text-xl font-bold">Open POS Session</h1>
        <p className="mb-5 text-sm text-muted">
          Enter your opening cash float to start selling.
        </p>
        <label className="mb-1.5 block text-left text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
          Opening Float (KES)
        </label>
        <input
          type="number"
          className="field mb-4"
          value={float}
          onChange={(e) => setFloat(e.target.value)}
        />
        <button
          className="btn-blk w-full justify-center py-3.5 text-[0.72rem]"
          onClick={() => onOpen(Number(float) || 0)}
        >
          ✓ OPEN SESSION
        </button>
      </div>
    </div>
  );
}

function POSWorkspace() {
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<POSPaymentMethod | null>(null);
  const [receipt, setReceipt] = useState<{ orderNo: string; method: POSPaymentMethod; amountReceived?: number } | null>(null);

  const {
    sale,
    discount,
    customer,
    addToSale,
    updateQty,
    removeFromSale,
    setDiscount,
    setCustomer,
    subtotal,
    total,
    clearSale,
    session,
    closeSession,
    recordPayment,
  } = usePOSStore();

  const products = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch && p.is_active;
    });
  }, [category, search]);

  const finalizeSale = (method: POSPaymentMethod, amountReceived?: number) => {
    const orderNo = `#SK-${Math.floor(Math.random() * 9000) + 1000}`;
    recordPayment(method, total());
    setReceipt({ orderNo, method, amountReceived });
    clearSale();
    setPayment(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Left: product grid */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {CATEGORY_TABS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="whitespace-nowrap border px-3.5 py-2 text-[0.68rem] font-semibold uppercase tracking-wide"
                style={{
                  background: category === c ? "#1a1a1a" : "#fff",
                  color: category === c ? "#fff" : "#333",
                  borderColor: category === c ? "#1a1a1a" : "#e8e8e8",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="text-[0.68rem] text-gray-400">
            Session opened {new Date(session.openedAt!).toLocaleTimeString()}
          </div>
        </div>
        <input
          className="field mb-3"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToSale(p)}
              className="min-h-[44px] border border-border bg-white p-2.5 text-left transition-shadow hover:shadow-md"
            >
              <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                <Image src={p.image} alt={p.name} fill sizes="150px" className="object-cover object-top" />
              </div>
              <div className="mb-1 truncate text-[0.76rem] font-semibold">{p.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-[0.78rem] font-bold text-gold">{fmtKES(p.price)}</span>
                <span
                  className="text-[0.62rem] font-bold"
                  style={{ color: p.stock_quantity > 5 ? "#27ae60" : "#e74c3c" }}
                >
                  {p.stock_quantity} left
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: current sale */}
      <div className="flex flex-col border border-border bg-white">
        <div className="border-b border-border p-4">
          <div className="pf text-base font-bold">Current Sale</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {sale.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              Tap a product to add it to the sale.
            </p>
          ) : (
            sale.map((item) => (
              <div key={item.productId} className="mb-3 flex items-center gap-2.5">
                <Image src={item.image} alt="" width={40} height={50} className="h-[50px] w-10 flex-shrink-0 object-cover object-top" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.78rem] font-semibold">{item.name}</div>
                  <div className="text-[0.7rem] text-gray-400">{fmtKES(item.price)}</div>
                </div>
                <button
                  className="flex h-8 w-8 min-h-[44px] min-w-[32px] items-center justify-center border border-border bg-[#f5f5f5]"
                  onClick={() => updateQty(item.productId, item.qty - 1)}
                >
                  −
                </button>
                <span className="w-5 text-center font-bold">{item.qty}</span>
                <button
                  className="flex h-8 w-8 min-h-[44px] min-w-[32px] items-center justify-center border border-border bg-[#f5f5f5]"
                  onClick={() => updateQty(item.productId, item.qty + 1)}
                >
                  +
                </button>
                <button
                  className="text-[0.65rem] text-gray-300 hover:text-danger"
                  onClick={() => removeFromSale(item.productId)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <input
              className="field"
              placeholder="Customer phone lookup…"
              value={customer?.phone || ""}
              onChange={(e) => setCustomer({ name: customer?.name || "Walk-in", phone: e.target.value })}
            />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[0.7rem] text-gray-400">Discount (KES)</span>
            <input
              type="number"
              className="field w-24 py-1.5"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span>{fmtKES(subtotal())}</span>
          </div>
          {discount > 0 && (
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-400">Discount</span>
              <span className="text-danger">-{fmtKES(discount)}</span>
            </div>
          )}
          <div className="mb-3 flex justify-between border-t border-border pt-2">
            <span className="pf font-bold">Total</span>
            <span className="pf text-lg font-bold text-gold">{fmtKES(total())}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PayButton icon={Banknote} label="CASH" onClick={() => setPayment("cash")} disabled={sale.length === 0} />
            <PayButton icon={Smartphone} label="M-PESA" onClick={() => setPayment("mpesa")} disabled={sale.length === 0} />
            <PayButton icon={CreditCard} label="CARD" onClick={() => setPayment("card")} disabled={sale.length === 0} />
            <PayButton icon={FileText} label="INVOICE" onClick={() => setPayment("invoice")} disabled={sale.length === 0} />
          </div>

          <button
            onClick={() => {
              if (confirm(`Close session? Cash: ${fmtKES(session.cashSales)}, M-Pesa: ${fmtKES(session.mpesaSales)}, Card: ${fmtKES(session.cardSales)}`)) {
                closeSession();
              }
            }}
            className="mt-3 w-full text-center text-[0.65rem] uppercase tracking-wide text-gray-400 hover:text-black"
          >
            Close Session &amp; Reconcile
          </button>
        </div>
      </div>

      {payment && (
        <PaymentModal
          method={payment}
          total={total()}
          onClose={() => setPayment(null)}
          onConfirm={(amountReceived) => finalizeSale(payment, amountReceived)}
        />
      )}

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function PayButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-blk min-h-[52px] justify-center gap-1.5 text-[0.72rem] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function PaymentModal({
  method,
  total,
  onClose,
  onConfirm,
}: {
  method: POSPaymentMethod;
  total: number;
  onClose: () => void;
  onConfirm: (amountReceived?: number) => void;
}) {
  const [received, setReceived] = useState(String(total));
  const change = Math.max(0, Number(received) - total);
  const labels: Record<POSPaymentMethod, string> = {
    cash: "Cash Payment",
    mpesa: "M-Pesa Payment",
    card: "Card Payment",
    invoice: "Create Invoice",
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/45 p-5" onClick={onClose}>
      <div className="w-full max-w-sm bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="pf mb-4 text-lg font-bold">{labels[method]}</div>
        <div className="mb-4 flex items-center justify-between border border-border bg-bg-light p-3">
          <span className="font-semibold">Total Due</span>
          <span className="pf text-xl font-bold text-gold">{fmtKES(total)}</span>
        </div>

        {method === "cash" && (
          <>
            <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
              Amount Received
            </label>
            <input
              type="number"
              className="field mb-3"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
            />
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-gray-400">Change Due</span>
              <span className="font-bold">{fmtKES(change)}</span>
            </div>
          </>
        )}
        {method === "mpesa" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
              M-Pesa Reference
            </label>
            <input className="field" placeholder="e.g. QGH7X2K9P1" />
          </div>
        )}
        {method === "card" && (
          <p className="mb-4 text-sm text-muted">Process on the Paystack card terminal, then confirm below.</p>
        )}
        {method === "invoice" && (
          <p className="mb-4 text-sm text-muted">This will be recorded as an order pending payment.</p>
        )}

        <div className="flex gap-2.5">
          <button onClick={onClose} className="btn-out flex-1 justify-center py-3 text-[0.7rem]">
            CANCEL
          </button>
          <button
            onClick={() => onConfirm(method === "cash" ? Number(received) : undefined)}
            className="btn-blk flex-[2] justify-center py-3 text-[0.7rem]"
          >
            ✓ CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: { orderNo: string; method: POSPaymentMethod; amountReceived?: number };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/45 p-5" onClick={onClose}>
      <div className="w-full max-w-xs bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <CircleCheck size={34} className="mx-auto mb-2 text-success" />
        <div className="pf mb-1 text-lg font-bold">Sale Complete</div>
        <div className="mb-4 text-sm font-semibold text-gold">{receipt.orderNo}</div>
        <div className="mb-5 border-t border-dashed border-border pt-4 text-left text-sm">
          <div className="mb-1 flex justify-between">
            <span className="text-gray-400">Payment</span>
            <span className="font-semibold uppercase">{receipt.method}</span>
          </div>
          {receipt.amountReceived !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-400">Received</span>
              <span>{fmtKES(receipt.amountReceived)}</span>
            </div>
          )}
          <div className="mt-3 text-center text-[0.7rem] text-gray-400">
            Thank you for shopping at Styled.ke! 💛
            <br />
            WhatsApp: 0734 807 511
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => window.print()} className="btn-out w-full justify-center gap-1.5 py-2.5 text-[0.68rem]">
            <Printer size={13} /> PRINT RECEIPT
          </button>
          <button onClick={onClose} className="btn-blk w-full justify-center py-2.5 text-[0.68rem]">
            NEW SALE
          </button>
        </div>
      </div>
    </div>
  );
}
