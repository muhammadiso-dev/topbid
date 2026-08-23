"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatSom } from "@/lib/ustar/constants";
import { VERIFICATION_FEE } from "@/lib/ustar/pricing";
import { payableAmount } from "@/lib/ustar/pricing";
import { CheckCircle2, Loader2, ShieldCheck, BadgeCheck, TrendingUp, Star, Clock3, Copy, Send, PartyPopper } from "lucide-react";
import { useI18n } from "@/lib/ustar/i18n";
import { ADMIN_CARD } from "@/lib/ustar/payment-config";

interface VerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoActive: boolean;
  editToken?: string;
  onPaid: () => Promise<void> | void;
}

type Step = "benefits" | "card" | "processing" | "done";

/** Verifikatsiya to'lov oqimi — "Tekshirilgan" belgisi uchun */
export function VerifyModal({ open, onOpenChange, promoActive, editToken, onPaid }: VerifyModalProps) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState<Step>("benefits");
  const [error, setError] = useState<string | null>(null);

  const fee = payableAmount(VERIFICATION_FEE, promoActive);
  const promo = promoActive && fee < VERIFICATION_FEE;

  const handleClose = () => {
    if (step === "processing") return;
    onOpenChange(false);
    setStep("benefits");
    setError(null);
  };

  const [copied, setCopied] = useState(false);

  const copyCard = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_CARD.number.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const confirmPayment = async () => {
    setStep("processing");
    try {
      await onPaid();
      setTimeout(() => setStep("done"), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "To'lovda xatolik yuz berdi");
      setStep("card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-white border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block">
        {step === "benefits" && (
          <div>
            <DialogHeader className="p-5 pb-4 border-b border-[#f0e6da]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#b45f14]" />
                {t("verify.title")}
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] text-sm">
                {t("verify.subtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Afzalliklar */}
              <div className="space-y-2.5">
                <Benefit
                  icon={<BadgeCheck className="w-4 h-4 text-[#b45f14]" />}
                  text={t("verify.benefit1")}
                />
                <Benefit
                  icon={<TrendingUp className="w-4 h-4 text-[#b45f14]" />}
                  text={t("verify.benefit2")}
                />
                <Benefit
                  icon={<Star className="w-4 h-4 text-[#b45f14]" />}
                  text={t("verify.benefit3")}
                />
              </div>

              {/* Jarayon */}
              <div className="bg-[#fffdfa] border border-[#f0e6da] rounded-xl p-3.5 text-[12px] text-[#574634] leading-relaxed">
                <b className="text-[#241c14]">{t("verify.howTitle")}</b> {t("verify.howDesc")}
              </div>

              {/* Narx */}
              <div className="bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
                    {t("verify.oneTime")}
                  </p>
                  {promo && (
                    <p className="text-[11px] text-[#e9a05c] font-bold mt-1">
                      Aksiya -50%
                    </p>
                  )}
                </div>
                <p className="text-right">
                  {promo && (
                    <span className="block text-xs font-bold text-[#94836f] line-through tabular-nums">
                      {formatSom(VERIFICATION_FEE, lang)}
                    </span>
                  )}
                  <span className="text-2xl font-extrabold text-white tabular-nums">
                    {formatSom(fee, lang)}
                  </span>
                </p>
              </div>

              <Button
                onClick={() => setStep("card")}
                className="w-full h-12 bg-[#1d7ed8] hover:bg-[#1769b8] text-white font-extrabold rounded-xl text-sm active:scale-[0.98] transition-transform"
              >
                <Send className="w-4 h-4" />
                {t("verify.payViaBot")}
              </Button>

              <div className="flex items-center gap-2 text-[11px] text-[#94836f] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                {t("verify.refundNote")}
              </div>
            </div>
          </div>
        )}

        {step === "card" && (
          <div>
            <DialogHeader className="p-5 pb-3 border-b border-[#f0e6da]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#b45f14]" />
                {t("verify.title")}
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] text-sm">{t("pay.cardDesc")}</DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              <p className="text-[12px] text-[#574634] font-semibold leading-relaxed">
                1. {t("pay.cardStep1")}
              </p>

              <div className="relative bg-gradient-to-br from-[#241c14] via-[#3a2e22] to-[#241c14] rounded-2xl p-5 text-white shadow-lg overflow-hidden">
                <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-[#d97b29]/20 pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#e9a05c] to-[#d97b29]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e9a05c]">
                    {ADMIN_CARD.bank}
                  </span>
                </div>
                <p className="mt-4 font-mono text-lg md:text-xl font-extrabold tracking-[0.12em] tabular-nums">
                  {ADMIN_CARD.number}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white/90">{ADMIN_CARD.holder}</span>
                  <button
                    onClick={copyCard}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur px-2.5 py-1.5 rounded-lg font-extrabold text-[10px] cursor-pointer transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t("editlink.copied") : t("pay.copyCard")}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-[12px] text-[#574634] font-medium">
                <p>2. {t("pay.cardStep2")} <b className="tabular-nums text-[#b25e14]">{formatSom(fee, lang)}</b></p>
              </div>

              <div className="bg-[#fff8ec] border border-[#f0d5b8] rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <Clock3 className="w-3.5 h-3.5 text-[#b25e14] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8a6a3a] font-bold leading-snug">{t("pay.awaitingNote")}</p>
              </div>

              <Button
                onClick={confirmPayment}
                className="w-full h-12 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-sm"
              >
                {formatSom(fee, lang)} — {t("pay.transferred")}
              </Button>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#b45f14] animate-spin" />
            <p className="font-bold text-[#241c14]">{t("pay.processing")}</p>
            <p className="text-xs text-[#94836f]">{t("pay.wait")}</p>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-[#b45f14]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#241c14]">{t("verify.requestSent")}</h3>
            <p className="text-sm text-[#6b5d4d] max-w-[300px] leading-relaxed">
              {t("verify.requestSentDesc")}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#b45f14] bg-[#fff3df] border border-[#f0d5b8] rounded-full px-3 py-1.5 mt-1">
              <Clock3 className="w-3.5 h-3.5" />
              {formatSom(fee, lang)} — {t("pay.awaitingBadge")}
            </div>
            <Button
              onClick={handleClose}
              className="mt-3 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg w-full"
            >
              Yopish
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#fff3df] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="text-[13px] text-[#574634] font-semibold leading-snug pt-1">{text}</p>
    </div>
  );
}
