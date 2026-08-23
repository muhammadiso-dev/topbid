"use client";

import { GraduationCap, Briefcase, Info, ScrollText, ShieldCheck } from "lucide-react";
import { useUstarStore } from "@/lib/ustar/store";
import { formatCompactSom } from "@/lib/ustar/constants";
import { entryPrice } from "@/lib/ustar/pricing";

/** Minimal footer — sticky pastda */
export function Footer() {
  const { setView, setPool, setEduSubFilter } = useUstarStore();

  const goPool = (p: "education" | "it") => {
    setPool(p);
    setEduSubFilter("all");
    setView({ name: "home" });
  };

  return (
    <footer className="mt-auto bg-white border-t border-border">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Logo va tavsif */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#d97b29] flex items-center justify-center text-white font-extrabold text-sm">
                T
              </div>
              <span className="font-extrabold text-lg text-[#241c14]">
                TopBid<span className="text-[#d97b29]">.uz</span>
              </span>
            </div>
            <p className="text-xs text-[#7d6c58] font-medium leading-relaxed mt-2.5">
              O'zbekistondagi ta'lim va IT mutaxassislar reytingi. O'z o'rinngizni egallang yoki
              eng yaxshi mutaxassisni toping.
            </p>
          </div>

          {/* Havolalar */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2" aria-label="Footer navigatsiya">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#94836f]">
                Reytinglar
              </p>
              <button
                onClick={() => goPool("education")}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                O'rganish
              </button>
              <button
                onClick={() => goPool("it")}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Yollash
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#94836f]">
                Platforma
              </p>
              <button
                onClick={() => setView({ name: "about" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <Info className="w-3.5 h-3.5" />
                Haqida
              </button>
              <button
                onClick={() => setView({ name: "rules" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <ScrollText className="w-3.5 h-3.5" />
                Qoidalar
              </button>
              <button
                onClick={() => setView({ name: "admin" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#94836f] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-[#f0e6da] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#7d6c58] font-medium">
            © 2026 TopBid.uz. Barcha huquqlar himoyalangan.
          </p>
          <p className="text-[11px] text-[#7d6c58] font-medium tabular-nums">
            To'lovlar Telegram bot orqali • {formatCompactSom(entryPrice("education", false))}dan
          </p>
        </div>
      </div>
    </footer>
  );
}
