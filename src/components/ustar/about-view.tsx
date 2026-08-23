"use client";

import { ArrowLeft, GraduationCap, Briefcase, Trophy, Wallet, Bot, ShieldCheck, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import { PRICE_TIERS, formatCompactSom } from "@/lib/ustar/constants";

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
          className="rounded-lg hover:bg-[#f6efe6] text-[#574634] font-bold gap-1.5 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("detail.back")}
        </Button>
      </div>

      <header className="mt-6 text-center">
        { }
        <img src="/logo-192.png" alt="TopBid" className="w-16 h-16 mx-auto object-contain" />
        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-[#241c14]">{t("about.title")}</h1>
        <p className="mt-3 text-sm md:text-base text-[#6b5d4d] leading-relaxed">{t("about.desc")}</p>
      </header>

      {/* Qanday ishlaydi */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">{t("about.howTitle")}</h2>
        <div className="space-y-3">
          <Step num={1} icon={<Trophy className="w-5 h-5 text-[#d97b29]" />} title={t("about.step1")} text={t("about.step1Desc")} suffix={t("about.step")} />
          <Step num={2} icon={<Wallet className="w-5 h-5 text-[#d97b29]" />} title={t("about.step2")} text={t("about.step2Desc")} suffix={t("about.step")} />
          <Step num={3} icon={<TrendingUp className="w-5 h-5 text-[#d97b29]" />} title={t("about.step3")} text={t("about.step3Desc")} suffix={t("about.step")} />
          <Step num={4} icon={<Users className="w-5 h-5 text-[#d97b29]" />} title={t("about.step4")} text={t("about.step4Desc")} suffix={t("about.step")} />
        </div>
      </section>

      {/* Ikki yo'nalish */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#d97b29]" />
          </div>
          <h3 className="font-extrabold text-[#241c14] mt-3">{t("about.eduTitle")}</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">{t("about.eduDesc")}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#d97b29]" />
          </div>
          <h3 className="font-extrabold text-[#241c14] mt-3">{t("about.itTitle")}</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">{t("about.itDesc")}</p>
        </div>
      </section>

      {/* Narxlar */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">{t("about.pricesTitle")}</h2>
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-[#f6efe6] text-[10px] md:text-[11px] font-extrabold uppercase tracking-wide text-[#574634]">
            <span className="col-span-2">{t("about.tableTier")}</span>
            <span className="text-right">{t("about.tableMin")}</span>
            <span className="text-right">{t("about.tableStep")}</span>
          </div>
          {Object.values(PRICE_TIERS).map((tier) => (
            <div
              key={tier.label}
              className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-[#f0e6da] text-[12px] md:text-[13px]"
            >
              <span className="col-span-2 font-extrabold text-[#241c14]">{tier.label}</span>
              <span className="text-right font-bold text-[#574634] tabular-nums">
                {formatCompactSom(tier.min, lang)}
              </span>
              <span className="text-right font-bold text-[#574634] tabular-nums">
                {formatCompactSom(tier.step, lang)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#94836f] font-medium mt-2 leading-relaxed">{t("about.pricesNote")}</p>
      </section>

      {/* Ishonch features */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">{t("about.whyTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Feature icon={<Star className="w-5 h-5 text-[#d97b29]" />} title={t("about.f1")} text={t("about.f1Desc")} />
          <Feature icon={<Bot className="w-5 h-5 text-[#d97b29]" />} title={t("about.f2")} text={t("about.f2Desc")} />
          <Feature icon={<ShieldCheck className="w-5 h-5 text-[#d97b29]" />} title={t("about.f3")} text={t("about.f3Desc")} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">{t("about.faqTitle")}</h2>
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
    <div className="bg-white border border-border rounded-2xl p-4 md:p-5 flex gap-4">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">{icon}</div>
        <span className="text-[10px] font-extrabold text-[#c4b5a1]">
          {num}
          {suffix}
        </span>
      </div>
      <div>
        <h3 className="font-extrabold text-[#241c14]">{title}</h3>
        <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <div className="w-9 h-9 rounded-lg bg-[#fdeedd] flex items-center justify-center">{icon}</div>
      <h3 className="font-extrabold text-sm text-[#241c14] mt-2.5">{title}</h3>
      <p className="text-xs text-[#6b5d4d] leading-relaxed mt-1.5">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-white border border-border rounded-xl group">
      <summary className="px-4 py-3.5 font-bold text-sm text-[#241c14] cursor-pointer list-none flex items-center justify-between gap-2">
        {q}
        <span className="text-[#d97b29] font-extrabold text-lg group-open:rotate-45 transition-transform leading-none">
          +
        </span>
      </summary>
      <p className="px-4 pb-4 text-[13px] text-[#6b5d4d] leading-relaxed">{a}</p>
    </details>
  );
}
