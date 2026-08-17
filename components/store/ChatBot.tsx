"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const BOT_REPLIES = [
  "✨ Our **Marble Print Midi Dress** just arrived — KES 1,500 and absolutely stunning for any occasion!",
  "💙 The **Abstract Kaftan Tops** are flying! KES 1,500 each, available in orange/red and blue/white. Very popular!",
  "👗 All clothing at Styled.ke is **KES 1,500** — dresses, tops, everything! Want me to help you find your size?",
  "🚚 We deliver nationwide, free of charge! Just add to your cart and check out on the site.",
];

interface Msg {
  from: "bot" | "user";
  text: string;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hello! I'm Style ✨ your personal Styled.ke assistant. All our clothing is KES 1,500! Ask me anything about our products or let me help you order.",
    },
  ]);
  const [input, setInput] = useState("");
  const riRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = () => {
    if (!input.trim()) return;
    const u = input;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: u }]);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: BOT_REPLIES[riRef.current % BOT_REPLIES.length] }]);
      riRef.current += 1;
    }, 800);
  };

  return (
    <>
      {open && (
        <div className="animate-chatUp fixed bottom-[86px] right-[22px] z-[400] flex h-[440px] w-[325px] flex-col border border-border bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2.5 bg-black px-3.5 py-3">
            <Image
              src="/images/LOGO.jpg"
              alt=""
              width={29}
              height={29}
              className="rounded-full border border-gold/40 object-cover"
            />
            <div>
              <div className="pf text-[0.88rem] font-bold text-white">Style</div>
              <div className="text-[0.56rem] tracking-wide text-gold">
                AI Assistant · Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-xl leading-none text-white/50"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[#fafafa] p-2.5">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-2.5 py-2 text-[0.77rem] leading-relaxed ${
                    m.from === "user"
                      ? "bg-black text-white"
                      : "border border-border bg-white text-black"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-1.5 border-t border-border bg-white p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about products or prices…"
              className="field flex-1 py-1.5 text-[0.75rem]"
            />
            <button className="btn-blk px-3 py-1.5 text-[0.77rem]" onClick={send} aria-label="Send message">
              <ArrowRight size={14} />
            </button>
          </div>
          <a
            href={waLink("Hello Styled.ke! I was chatting with Style AI ✨")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 border-t border-[#f0f0f0] bg-white p-1.5 text-[0.64rem] text-whatsapp"
          >
            <WhatsAppIcon size={10} /> Continue on WhatsApp · 0734 807 511
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[22px] right-[22px] z-[400] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black shadow-[0_4px_18px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:bg-gold"
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} className="text-white" /> : <Sparkles size={20} className="text-white" />}
      </button>
    </>
  );
}
