"use client";

import { GraduationCap, Code2, Info, ScrollText, ShieldCheck } from "lucide-react";
import { useUstarStore } from "@/lib/ustar/store";

/** Minimal footer — sticky pastda */
export function Footer() {
  const { setView, setPool } = useUstarStore();

  return (
    <footer className="mt-auto bg-white border-t border-border">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Logo va tavsif */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#d97b29] flex items-center justify-center text-white font-extrabold text-sm">
                u
              </div>
              <span className="font-extrabold text-lg text-[#241c14]">
                ustar<span className="text-[#d97b29]">.</span>
              </span>
            </div>
            <p className="text-xs text-[#94836f] font-medium leading-relaxed mt-2.5">
              O'zbekistondagi ta'lim va IT mutaxassislar reytingi. O'z o'rinngizni
              egallang yoki eng yaxshi mutaxassisni toping.
            </p>
          </div>

          {/* Havolalar */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2" aria-label="Footer navigatsiya">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#c4b5a1]">Reytinglar</p>
              <button
                onClick={() => {
                  setPool("education");
                  setView({ name: "home" });
                }}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Ta'lim reytingi
              </button>
              <button
                onClick={() => {
                  setPool("it");
                  setView({ name: "home" });
                }}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <Code2 className="w-3.5 h-3.5" />
                IT mutaxassislar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#c4b5a1]">Platforma</p>
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
          <p className="text-[11px] text-[#c4b5a1] font-medium">
            © 2026 Ustar. Barcha huquqlar himoyalangan.
          </p>
          <p className="text-[11px] text-[#c4b5a1] font-medium">
            To'lovlar Telegram bot orqali • Boshlanish narxi 20 000 so'm
          </p>
        </div>
      </div>
    </footer>
  );
}
