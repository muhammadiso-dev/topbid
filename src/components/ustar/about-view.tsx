"use client";

import { ArrowLeft, Trophy, Wallet, Bot, ShieldCheck, Star, TrendingUp, Users, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import { formatCompactSom, formatSom } from "@/lib/ustar/constants";
import { PRICE } from "@/lib/ustar/pricing";
import { CHARITY_FUND } from "@/lib/ustar/payment-config";

/** "Haqida" sahifasi */
export function AboutView() {
  const { setView } = useUstarStore();
  const { t, lang } = useI18n();

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-6 md:pt-8">
        <Button
          variant="ghost"
          onClick={() => setView({ name: "home" })}
          className="rounded-lg hover:bg-[#f6efe6] dark:bg-[#2b241b] text-[#574634] dark:text-[#c9bba7] font-bold gap-1.5 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("detail.back")}
        </Button>
      </div>

      <header className="mt-6 text-center">
        { }
        <img src="/logo-192.png" alt="TopBid" className="w-16 h-16 mx-auto object-contain" />
        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-[#241c14] dark:text-[#f2ebe2]">{t("about.title")}</h1>
        <p className="mt-3 text-sm md:text-base text-[#6b5d4d] dark:text-[#a3937f] leading-relaxed">{t("about.desc")}</p>
      </header>

      {/* Qanday ishlaydi */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] dark:text-[#f2ebe2] mb-4">{t("about.howTitle")}</h2>
        <div className="space-y-3">
          <Step num={1} icon={<Trophy className="w-5 h-5 text-[#d97b29]" />} title={t("about.step1")} text={t("about.step1Desc")} suffix={t("about.step")} />
          <Step num={2} icon={<Wallet className="w-5 h-5 text-[#d97b29]" />} title={t("about.step2")} text={t("about.step2Desc")} suffix={t("about.step")} />
          <Step num={3} icon={<TrendingUp className="w-5 h-5 text-[#d97b29]" />} title={t("about.step3")} text={t("about.step3Desc")} suffix={t("about.step")} />
          <Step num={4} icon={<Users className="w-5 h-5 text-[#d97b29]" />} title={t("about.step4")} text={t("about.step4Desc")} suffix={t("about.step")} />
        </div>
      </section>

      {/* Xayriya fondi */}
      <section className="mt-8 bg-gradient-to-br from-[#fff5f0] to-[#fffaf7] border border-[#ffd9c9] rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 text-[#d94f29] fill-[#d94f29]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-lg text-[#b4522d]">{t("charity.section")}</h3>
            <p className="text-[13px] md:text-sm text-[#574634] dark:text-[#c9bba7] leading-relaxed mt-1.5">{t("charity.desc")}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-white/80 border border-[#ffd9c9] rounded-xl px-3.5 py-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#b4522d]">O'rin to'lovlari</p>
            <p className="text-lg font-extrabold text-[#d94f29] tabular-nums mt-0.5">10%</p>
          </div>
          <div className="bg-white/80 border border-[#ffd9c9] rounded-xl px-3.5 py-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#b4522d]">Verifikatsiya</p>
            <p className="text-lg font-extrabold text-[#d94f29] tabular-nums mt-0.5">50%</p>
          </div>
        </div>
        <a
          href={CHARITY_FUND.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between gap-3 bg-white border border-[#ffd9c9] rounded-xl px-4 py-3 hover:bg-[#fff5f0] transition-colors"
        >
          <div>
            <p className="text-[13px] font-extrabold text-[#b4522d]">{t("charity.fundName")}</p>
            <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-semibold">{CHARITY_FUND.site} · {t("charity.donate")}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#d94f29] shrink-0" />
        </a>
      </section>

      {/* Narxlar */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] dark:text-[#f2ebe2] mb-4">{t("about.pricesTitle")}</h2>
        <div className="bg-white dark:bg-[#201a14] border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 px-4 py-3 bg-[#f6efe6] dark:bg-[#2b241b] text-[10px] md:text-[11px] font-extrabold uppercase tracking-wide text-[#574634] dark:text-[#c9bba7]">
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
              className="grid grid-cols-2 px-4 py-3 border-t border-[#f0e6da] text-[12px] md:text-[13px]"
            >
              <span className="font-extrabold text-[#241c14] dark:text-[#f2ebe2]">{row.label}</span>
              <span className="text-right font-bold text-[#574634] dark:text-[#c9bba7] tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium mt-2 leading-relaxed">{t("price.note")}</p>
      </section>

      {/* Ishonch features */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] dark:text-[#f2ebe2] mb-4">{t("about.whyTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Feature icon={<Star className="w-5 h-5 text-[#d97b29]" />} title={t("about.f1")} text={t("about.f1Desc")} />
          <Feature icon={<Bot className="w-5 h-5 text-[#d97b29]" />} title={t("about.f2")} text={t("about.f2Desc")} />
          <Feature icon={<ShieldCheck className="w-5 h-5 text-[#d97b29]" />} title={t("about.f3")} text={t("about.f3Desc")} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] dark:text-[#f2ebe2] mb-4">{t("about.faqTitle")}</h2>
        <div className="space-y-2.5">
          <Faq q={t("about.faq1q")} a={t("about.faq1a")} />
          <Faq q={t("about.faq2q")} a={t("about.faq2a")} />
          <Faq q={t("about.faq3q")} a={t("about.faq3a")} />
          <Faq q={t("about.faq4q")} a={t("about.faq4a")} />
          <Faq q={t("about.faq5q")} a={t("about.faq5a")} />
        </div>
      </section>

      {/* CTA */}
      <div className="mt-10 bg-[#241c14] rounded-2xl p-6 md:p-8 text-center">
        <h2 className="text-white font-extrabold text-xl md:text-2xl">{t("about.ctaTitle")}</h2>
        <p className="text-[#c4b5a1] text-sm mt-2 max-w-sm mx-auto leading-relaxed">{t("about.ctaDesc")}</p>
        <Button
          onClick={() => setView({ name: "add-profile" })}
          className="mt-5 bg-[#d97b29] hover:bg-[#e8944a] text-white font-extrabold rounded-xl h-11 px-6"
        >
          {t("about.ctaBtn")}
        </Button>
      </div>
    </div>
  );
}

function Step({ num, icon, title, text, suffix }: { num: number; icon: React.ReactNode; title: string; text: string; suffix: string }) {
  return (
    <div className="bg-white dark:bg-[#201a14] border border-border rounded-2xl p-4 md:p-5 flex gap-4">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#fdeedd] dark:bg-[#3a2c1c] flex items-center justify-center">{icon}</div>
        <span className="text-[10px] font-extrabold text-[#c4b5a1]">
          {num}
          {suffix}
        </span>
      </div>
      <div>
        <h3 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2]">{title}</h3>
        <p className="text-[13px] text-[#6b5d4d] dark:text-[#a3937f] leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white dark:bg-[#201a14] border border-border rounded-2xl p-4">
      <div className="w-9 h-9 rounded-lg bg-[#fdeedd] dark:bg-[#3a2c1c] flex items-center justify-center">{icon}</div>
      <h3 className="font-extrabold text-sm text-[#241c14] dark:text-[#f2ebe2] mt-2.5">{title}</h3>
      <p className="text-xs text-[#6b5d4d] dark:text-[#a3937f] leading-relaxed mt-1.5">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-white dark:bg-[#201a14] border border-border rounded-xl group">
      <summary className="px-4 py-3.5 font-bold text-sm text-[#241c14] dark:text-[#f2ebe2] cursor-pointer list-none flex items-center justify-between gap-2">
        {q}
        <span className="text-[#d97b29] font-extrabold text-lg group-open:rotate-45 transition-transform leading-none">
          +
        </span>
      </summary>
      <p className="px-4 pb-4 text-[13px] text-[#6b5d4d] dark:text-[#a3937f] leading-relaxed">{a}</p>
    </details>
  );
}
