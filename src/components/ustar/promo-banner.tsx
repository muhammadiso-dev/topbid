"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { promoInfo } from "@/lib/ustar/pricing";
import { useUstarStore } from "@/lib/ustar/store";

/** Ochilish aksiyasi banneri — 50% chegirma, jonli countdown bilan */
export function PromoBanner() {
  const openAddForm = useUstarStore((s) => s.openAddForm);
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const promo = promoInfo();

  useEffect(() => {
    if (!promo.active) return;
    const endsAt = new Date(promo.endsAt).getTime();
    const tick = () => setMsLeft(Math.max(0, endsAt - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
     
  }, []);

  if (!promo.active || msLeft === null) return null;

  const days = Math.floor(msLeft / 86_400_000);
  const hours = Math.floor((msLeft % 86_400_000) / 3_600_000);
  const minutes = Math.floor((msLeft % 3_600_000) / 60_000);
  const seconds = Math.floor((msLeft % 60_000) / 1000);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#d97b29] to-[#e8944a] px-4 py-3.5 md:px-5 md:py-4 text-white shadow-md shadow-[#d97b29]/25">
      {/* Dekorativ doiralar */}
      <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-16 -bottom-14 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur">
            <Rocket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-sm md:text-base leading-tight">
              Ochilish aksiyasi — barcha narxlarga 50% chegirma
            </p>
            <p className="text-[12px] md:text-[13px] text-white/95 font-medium mt-0.5">
              Erta qo'shilganlarga maxsus narx. Aksiya tugagach narxlar avtomatik normal holatga qaytadi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Countdown */}
          <div className="flex items-center gap-1" aria-label="Aksiya tugashiga qolgan vaqt">
            {[
              { v: days, l: "kun" },
              { v: hours, l: "soat" },
              { v: minutes, l: "daq" },
              { v: seconds, l: "sek" },
            ].map((u, i) => (
              <div key={u.l} className="flex items-center gap-1">
                <div className="flex flex-col items-center bg-white/15 backdrop-blur rounded-lg px-2 py-1 min-w-[38px]">
                  <span className="font-extrabold text-sm md:text-base tabular-nums leading-none">
                    {String(u.v).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-white/85 tracking-wide">{u.l}</span>
                </div>
                {i < 3 && <span className="font-extrabold text-white/50 text-sm">:</span>}
              </div>
            ))}
          </div>
          <button
            onClick={() => openAddForm()}
            className="hidden sm:inline-flex items-center h-11 px-4 rounded-lg bg-[#241c14] hover:bg-[#3a2e22] text-white font-extrabold text-sm cursor-pointer transition-colors active:scale-[0.97]"
          >
            Foydalanish
          </button>
        </div>
      </div>

      {/* Mobil CTA */}
      <button
        onClick={() => openAddForm()}
        className="sm:hidden relative mt-3 w-full h-11 rounded-lg bg-[#241c14] text-white font-extrabold text-sm cursor-pointer active:scale-[0.98] transition-transform"
      >
        Chegirmadan foydalanish
      </button>
    </div>
  );
}
