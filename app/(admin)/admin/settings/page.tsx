"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [taxRate, setTaxRate] = useState("0");
  const [receiptHeader, setReceiptHeader] = useState("Styled.ke — Nairobi, Kenya");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for shopping with us! WhatsApp: 0734 807 511");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="mb-5">
        <span className="sec-label">Configuration</span>
        <h1 className="pf text-[1.65rem] font-bold">Settings</h1>
      </div>

      <div className="mb-5 max-w-xl border border-border bg-white p-5">
        <div className="pf mb-4 text-base font-bold">Business Details</div>
        <div className="space-y-3 text-sm">
          <SettingRow label="Business Name" value="Styled.ke" />
          <SettingRow label="WhatsApp Number" value="+254 734 807 511" />
          <SettingRow label="M-Pesa Paybill" value="247 247" />
          <SettingRow label="M-Pesa Account" value="094 903" />
          <SettingRow label="TikTok" value="@styled.ke" />
          <SettingRow label="Location" value="Nairobi, Kenya" />
        </div>
        <p className="mt-3 text-[0.7rem] text-gray-400">
          These are set as environment variables — see .env.example — so they stay consistent
          across the storefront, POS, and WhatsApp bot.
        </p>
      </div>

      <div className="max-w-xl border border-border bg-white p-5">
        <div className="pf mb-4 text-base font-bold">POS Settings</div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
            Tax Rate (%)
          </label>
          <input type="number" className="field" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
            Receipt Header
          </label>
          <input className="field" value={receiptHeader} onChange={(e) => setReceiptHeader(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wide text-[#888]">
            Receipt Footer
          </label>
          <textarea className="field" rows={2} value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} />
        </div>
        <button onClick={() => setSaved(true)} className="btn-blk px-5 py-2.5 text-[0.68rem]">
          ✓ SAVE SETTINGS
        </button>
        {saved && <span className="ml-3 text-[0.78rem] text-success">Saved!</span>}
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#f5f5f5] py-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
