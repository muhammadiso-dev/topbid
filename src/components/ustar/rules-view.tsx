"use client";

import { ArrowLeft, Check, X, ScrollText, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import { formatSom } from "@/lib/ustar/constants";
import { PRICE } from "@/lib/ustar/pricing";

/** "Qoidalar" sahifasi */
export function RulesView() {
  const { setView } = useUstarStore();
  const { t, lang } = useI18n();

  const allowed = [t("rules.allowed1"), t("rules.allowed2"), t("rules.allowed3"), t("rules.allowed4"), t("rules.allowed5")];
  const forbidden = [t("rules.forbidden1"), t("rules.forbidden2"), t("rules.forbidden3"), t("rules.forbidden4"), t("rules.forbidden5")];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-6 md:pt-8">
        <Button
          variant="ghost"
          onClick={() => setView({ name: "home" })}
          className="rounded-lg hover:bg-[#f6efe6] text-[#574634] font-bold gap-1.5 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("detail.back")}
        </Button>
      </div>

      <header className="mt-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#fdeedd] flex items-center justify-center shrink-0">
          <ScrollText className="w-6 h-6 text-[#d97b29]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#241c14]">{t("rules.title")}</h1>
          <p className="text-xs md:text-sm text-[#6b5d4d] mt-0.5">{t("rules.updated")}</p>
        </div>
      </header>

      {/* Auksion va narxlar */}
      <section className="mt-7 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">1</span>
          {t("rules.s1")}
        </h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#f0e6da]">
          <div className="grid grid-cols-2 px-3 py-2.5 bg-[#f6efe6] text-[10px] font-extrabold uppercase tracking-wide text-[#574634]">
            <span>{t("about.tableTier")}</span>
            <span className="text-right">{t("about.tableMin")}</span>
          </div>
          {[
            { label: t("price.minBid"), value: formatSom(PRICE.min, lang) },
            { label: t("price.top1Take"), value: "+" + formatSom(PRICE.top1Premium, lang) },
            { label: t("price.takeover"), value: "+" + formatSom(PRICE.takeoverStep, lang) },
            { label: t("price.step"), value: formatSom(PRICE.step, lang) },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-2 px-3 py-2.5 border-t border-[#f0e6da] text-[12px] md:text-[13px]"
            >
              <span className="font-extrabold text-[#241c14]">{row.label}</span>
              <span className="text-right font-bold text-[#574634] tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>

        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          {[t("rules.s1li1"), t("rules.s1li2"), t("rules.s1li3"), t("rules.s1li4")].map((li) => (
            <li key={li} className="flex gap-2.5">
              <span className="text-[#d97b29] font-extrabold">•</span>
              {li}
            </li>
          ))}
        </ul>
      </section>

      {/* Ochilish aksiyasi */}
      <section className="mt-4 bg-gradient-to-r from-[#fdeedd] to-[#fff9f2] border border-[#f0d5b8] rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#b25e14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">2</span>
          {t("rules.s2")}
        </h2>
        <ul className="mt-3.5 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          {[t("rules.s2li1"), t("rules.s2li2"), t("rules.s2li3")].map((li) => (
            <li key={li} className="flex gap-2.5">
              <span className="text-[#d97b29] font-extrabold">•</span>
              {li}
            </li>
          ))}
        </ul>
      </section>

      {/* Ruxsat / taqiq */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            {t("rules.allowedTitle")}
          </h2>
          <ul className="mt-3.5 space-y-2">
            {allowed.map((a) => (
              <li key={a} className="flex gap-2 text-[13px] text-[#574634] leading-relaxed">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </span>
            {t("rules.forbiddenTitle")}
          </h2>
          <ul className="mt-3.5 space-y-2">
            {forbidden.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] text-[#574634] leading-relaxed">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* To'lov va qaytarish */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">3</span>
          {t("rules.s3")}
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          {[t("rules.s3li1"), t("rules.s3li2"), t("rules.s3li3"), t("rules.s3li4")].map((li) => (
            <li key={li} className="flex gap-2.5">
              <span className="text-[#d97b29] font-extrabold">•</span>
              {li}
            </li>
          ))}
        </ul>
      </section>

      {/* Sharh qoidalari */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">4</span>
          {t("rules.s4")}
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          {[t("rules.s4li1"), t("rules.s4li2"), t("rules.s4li3")].map((li) => (
            <li key={li} className="flex gap-2.5">
              <span className="text-[#d97b29] font-extrabold">•</span>
              {li}
            </li>
          ))}
        </ul>
      </section>

      {/* Verifikatsiya */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">5</span>
          {t("rules.s5")}
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          {[t("rules.s5li1"), t("rules.s5li2"), t("rules.s5li3"), t("rules.s5li4")].map((li) => (
            <li key={li} className="flex gap-2.5">
              <span className="text-[#d97b29] font-extrabold">•</span>
              {li}
            </li>
          ))}
        </ul>
      </section>

      {/* Xayriya fondi */}
      <section className="mt-4 bg-gradient-to-br from-[#fff5f0] to-[#fffaf7] border border-[#ffd9c9] rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#b4522d] flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#d94f29] fill-[#d94f29]" />
          {t("charity.section")}
        </h2>
        <ul className="mt-3 space-y-2 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          <li className="flex gap-2.5">
            <span className="text-[#d94f29] font-extrabold">•</span>
            O'rin to'lovlarining <b>10%</b> va verifikatsiya to'lovlarining <b>50%</b> xayriya fondiga yo'naltiriladi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d94f29] font-extrabold">•</span>
            Har oyning boshida o'tgan oyda yig'ilgan mablag'lar <b>{CHARITY_FUND.name}</b> jamg'armasining rasmiy hisob raqamiga o'tkaziladi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d94f29] font-extrabold">•</span>
            Har bir o'tkazmaning kvitansiyasi Telegram kanalimizda oshkor e'lon qilinadi — to'liq shaffoflik.
          </li>
        </ul>
        <a
          href={CHARITY_FUND.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#b4522d] hover:underline"
        >
          {CHARITY_FUND.site} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* Admin huquqi */}
      <section className="mt-4 bg-[#fff9f2] border border-[#f0d5b8] rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#b25e14]">{t("rules.adminTitle")}</h2>
        <p className="mt-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">{t("rules.adminDesc")}</p>
      </section>
    </div>
  );
}
