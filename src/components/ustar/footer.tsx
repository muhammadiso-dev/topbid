"use client";

import { Info, ScrollText } from "lucide-react";
import { useI18n } from "@/lib/ustar/i18n";
import { useUstarStore } from "@/lib/ustar/store";
import { formatCompactSom } from "@/lib/ustar/constants";
import { entryPrice } from "@/lib/ustar/pricing";

/** Minimal footer — sticky pastda */
export function Footer() {
  const { setView } = useUstarStore();
  const { t, lang } = useI18n();


  return (
    <footer className="mt-auto bg-white border-t border-border">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Logo va tavsif */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              { }
              <img src="/logo-96.png" alt="TopBid" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-lg text-[#241c14]">
                TopBid<span className="text-[#d97b29]">.uz</span>
              </span>
            </div>
            <p className="text-xs text-[#7d6c58] font-medium leading-relaxed mt-2.5">
              {t("footer.desc")}
            </p>
          </div>

          {/* Havolalar */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2" aria-label="Footer navigatsiya">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#94836f]">
                {t("footer.platform")}
              </p>
              <button
                onClick={() => setView({ name: "about" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <Info className="w-3.5 h-3.5" />
                {t("nav.about")}
              </button>
              <button
                onClick={() => setView({ name: "rules" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#574634] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <ScrollText className="w-3.5 h-3.5" />
                {t("nav.rules")}
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-[#f0e6da] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#7d6c58] font-medium">
            {t("footer.copyright")}
          </p>
          <p className="text-[11px] text-[#7d6c58] font-medium tabular-nums">
            {t("footer.payments")} • {formatCompactSom(entryPrice("education", false), lang)}{t("home.from")}
          </p>
        </div>
      </div>
    </footer>
  );
}
