"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ORDERS } from "@/lib/mock-data";
import { fmtKES, formatDate } from "@/lib/utils";

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AccountPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinStatus, setPinStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!isSupabaseConfigured) {
      setStatus({
        type: "error",
        msg: "Accounts aren't connected yet — add your Supabase keys to .env.local to enable sign-in (see README).",
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setStatus({ type: "success", msg: "Account created! Check your email to confirm." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus({ type: "success", msg: "Signed in!" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!isSupabaseConfigured || !email) return;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setMagicLinkSent(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);
    setPinLoading(true);
    try {
      const res = await fetch("/api/admin/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinStatus({ type: "error", msg: data.error || "Incorrect PIN." });
        return;
      }
      setPinStatus({ type: "success", msg: "Welcome back — opening admin…" });
      // Full page navigation (not router.push) so the freshly-set session
      // cookie is present on the request middleware.ts reads for /admin.
      window.location.href = "/admin";
    } catch {
      setPinStatus({ type: "error", msg: "Something went wrong. Try again." });
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-[420px] px-6 py-16 sm:px-10">
      <div className="mb-8 text-center">
        <span className="sec-label">Welcome</span>
        <h1 className="pf text-2xl font-bold">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>
      </div>

      <div className="mb-6 flex border-b border-border">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 border-b-2 py-2.5 text-[0.72rem] font-semibold uppercase tracking-wide ${
            mode === "signin" ? "border-black text-black" : "border-transparent text-gray-400"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 border-b-2 py-2.5 text-[0.72rem] font-semibold uppercase tracking-wide ${
            mode === "signup" ? "border-black text-black" : "border-transparent text-gray-400"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <input
            className="field"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="field"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button disabled={loading} className="btn-blk mt-1 w-full justify-center py-3.5 text-[0.72rem]">
          {loading ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>
      </form>

      <button
        onClick={handleMagicLink}
        className="mt-3 w-full text-center text-[0.72rem] uppercase tracking-wide text-gray-400 hover:text-black"
      >
        {magicLinkSent ? "Magic link sent — check your email" : "Or send me a magic link instead"}
      </button>

      {status && (
        <div
          className={`mt-4 border p-3 text-[0.78rem] ${
            status.type === "error"
              ? "border-danger/30 bg-danger/5 text-danger"
              : "border-success/30 bg-success/5 text-success"
          }`}
        >
          {status.msg}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-5">
        <button
          onClick={() => setShowPin((v) => !v)}
          className="w-full text-center text-[0.68rem] uppercase tracking-wide text-gray-400 hover:text-black"
        >
          Admin? Use quick-access PIN
        </button>
        {showPin && (
          <form onSubmit={handlePinSubmit} className="mt-3 flex flex-col gap-2.5">
            <input
              type="password"
              inputMode="text"
              className="field text-center tracking-[0.2em]"
              placeholder="Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              required
            />
            <button disabled={pinLoading || !pin} className="btn-blk w-full justify-center py-3 text-[0.7rem]">
              {pinLoading ? "CHECKING…" : "ENTER ADMIN"}
            </button>
            {pinStatus && (
              <div
                className={`border p-2.5 text-[0.74rem] ${
                  pinStatus.type === "error"
                    ? "border-danger/30 bg-danger/5 text-danger"
                    : "border-success/30 bg-success/5 text-success"
                }`}
              >
                {pinStatus.msg}
              </div>
            )}
          </form>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <div className="mb-3 text-[0.62rem] font-bold uppercase tracking-wide text-gray-400">
          Recent Orders (sample)
        </div>
        <div className="space-y-2">
          {ORDERS.slice(0, 3).map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.order_number.replace("#", "")}`}
              className="flex items-center justify-between border border-border px-3.5 py-2.5 text-sm transition-colors hover:border-black"
            >
              <div>
                <div className="font-semibold text-gold">{o.order_number}</div>
                <div className="text-[0.68rem] text-gray-400">{formatDate(o.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{fmtKES(o.total)}</div>
                <div className="text-[0.68rem] capitalize text-gray-400">{o.status}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
