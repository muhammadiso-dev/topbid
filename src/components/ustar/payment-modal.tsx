"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatSom } from "@/lib/ustar/constants";
import { ADMIN_CARD } from "@/lib/ustar/payment-config";
import { useI18n } from "@/lib/ustar/i18n";
import { CheckCircle2, Copy, CreditCard, Heart, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Haqiqiy to'lanadigan summa (aksiya bilan) */
  amount: number;
  /** Aksiya mavjud bo'lsa — to'liq narx (chizilgan ko'rinish uchun) */
  fullAmount?: number | null;
  /** To'lov e'lon qilindi — profil PENDING yaratiladi (pul tushishi bilan aktiv) */
  onPaid: (paidAmount: number) => Promise<void> | void;
  summary: {
    name: string;
    poolLabel: string;
    targetLabel: string;
  };
}

type Step = "card" | "processing" | "done";

/**
 * To'lov — FAQAT KARTA (Humo).
 * PUL TUSHISHINI KUTAMIZ: "O'tkazdim" → profil PENDING yaratiladi
 * → StarKerak/HumoCardBot pul tushishini tasdiqlaydi → profil reytingga chiqadi.
 * Bu yerda hech narsa avtomatik tasdiqlanmaydi!
 */
export function PaymentModal({
  open,
  onOpenChange,
  amount,
  fullAmount,
  onPaid,
  summary,
}: PaymentModalProps) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState<Step>("card");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  
  // To'lovlarni unikal qilish uchun summadan -1 dan -99 gacha tasodifiy ayiramiz (agar summa 500 dan katta bo'lsa)
  const uniqueAmount = useMemo(() => {
    if (amount <= 500) return amount;
    return amount - (Math.floor(Math.random() * 99) + 1);
  }, [amount]);

  const handleClose = () => {
    if (step === "processing") return;
    onOpenChange(false);
    setStep("card");
    setError(null);
  };

  /** Foydalanuvchi o'tkazdi dedi — profil pending yaratiladi, pul kutiladi */
  const confirmTransfer = async () => {
    setStep("processing");
    try {
      await onPaid(uniqueAmount);
      setTimeout(() => setStep("done"), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
      setStep("card");
    }
  };

  const copyCard = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_CARD.number.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const copyAmountFn = async () => {
    try {
      await navigator.clipboard.writeText(uniqueAmount.toString());
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      /* noop */
    }
  };

  const promo = fullAmount != null && fullAmount > amount;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-white dark:bg-[#201a14] border-[#e8ddd0] dark:border-[#362c20] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block max-h-[92vh] overflow-y-auto scrollbar-thin">
        {step === "card" && (
          <div>
            <DialogHeader className="p-5 pb-3 border-b border-[#f0e6da] dark:border-[#362c20]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d97b29]" />
                {t("pay.title")}
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] dark:text-[#a3937f] text-sm">{t("pay.cardDesc")}</DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Xulosa */}
              <div className="bg-[#fffdfa] dark:bg-[#2b241b] border border-[#f0e6da] dark:border-[#362c20] rounded-xl p-4 space-y-2">
                <Row label={t("pay.profile")} value={summary.name} />
                <Row label={t("pay.target")} value={summary.targetLabel} />
                <div className="pt-2 border-t border-dashed border-[#e8ddd0] flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#574634] dark:text-[#c9bba7]">{t("pay.amount")}</span>
                  <span className="text-right">
                    {promo && (
                      <span className="block text-[11px] font-bold text-[#94836f] dark:text-[#8a7a68] line-through tabular-nums leading-none mb-0.5">
                        {formatSom(fullAmount!, lang)}
                      </span>
                    )}
                    <span className="text-lg font-extrabold text-[#d97b29] tabular-nums leading-none">
                      {formatSom(uniqueAmount, lang)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Karta vizual ko'rinishi */}
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

              <div className="space-y-1.5 text-[12px] text-[#574634] dark:text-[#c9bba7] font-medium">
                <p>
                  1. {t("pay.cardStep1")}
                </p>
                <div className="bg-[#fff0ed] dark:bg-[#4a221a] border border-[#ffcdbc] dark:border-[#6b3126] rounded-xl p-3 my-3">
                  <p className="text-[13px] font-bold text-[#b43217] dark:text-[#ff9c8a] leading-tight mb-2">
                    ⚠️ Diqqat! Tizim profilingizni avtomatik topib olishi uchun FAQATGINA quyidagi summani (tiyinigacha aniq qilib) o'tkazing:
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-[#201a14] rounded-lg p-2 border border-[#ffd9c9] dark:border-[#523019]">
                    <span className="font-extrabold text-[15px] text-[#d97b29] tabular-nums">
                      {formatSom(uniqueAmount, lang)}
                    </span>
                    <button
                      onClick={copyAmountFn}
                      className="inline-flex items-center gap-1.5 bg-[#f6efe6] hover:bg-[#eadecc] dark:bg-[#2b241b] dark:hover:bg-[#3a2e22] text-[#d97b29] px-2.5 py-1.5 rounded-md font-bold text-[10px] cursor-pointer transition-colors"
                    >
                      {copiedAmount ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAmount ? "Nusxalandi" : "Summani nusxalash"}
                    </button>
                  </div>
                </div>
                <p>3. {t("pay.cardStep3")}</p>
              </div>

              {/* PUL KUTILMOQDA ogohlantirish */}
              <div className="bg-[#fff8ec] border border-[#f0d5b8] rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <Clock3 className="w-4 h-4 text-[#b25e14] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8a6a3a] font-bold leading-snug">{t("pay.awaitingNote")}</p>
              </div>

              {/* Charity */}
              <div className="flex items-start gap-2 bg-[#fff5f0] dark:bg-[#3d2516] border border-[#ffd9c9] dark:border-[#523019] rounded-xl p-3">
                <Heart className="w-4 h-4 text-[#b4522d] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#b4522d] font-bold leading-snug">
                  {t("charity.paymentNote")}: {formatSom(Math.floor((uniqueAmount * 0.1) / 500) * 500, lang)}.{" "}
                  {t("charity.note")}.
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-[#f0e6da] dark:border-[#362c20] mt-auto">
              <Button
                onClick={confirmTransfer}
                className="w-full h-12 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl shadow-md shadow-[#d97b29]/25 text-[15px]"
              >
                {formatSom(uniqueAmount, lang)} — {t("pay.transferred")}
              </Button>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#f0d5b8] border-t-[#d97b29] rounded-full animate-spin" />
            <p className="font-bold text-[#241c14] dark:text-[#f2ebe2]">{t("pay.processing")}</p>
          </div>
        )}

        {/* PUL KUTILMOQDA — muvaffaqiyat ekrani */}
        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#fff8ec] border border-[#f0d5b8] flex items-center justify-center">
              <Clock3 className="w-8 h-8 text-[#b25e14]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#241c14] dark:text-[#f2ebe2]">{t("pay.awaitingTitle")}</h3>
            <p className="text-sm text-[#6b5d4d] dark:text-[#a3937f] max-w-[320px] leading-relaxed">{t("pay.awaitingDesc")}</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#b25e14] bg-[#fff8ec] border border-[#f0d5b8] rounded-full px-3 py-1.5 mt-1">
              <Clock3 className="w-3.5 h-3.5" />
              {formatSom(amount, lang)} — {t("pay.awaitingBadge")}
            </div>
            <Button
              onClick={handleClose}
              className="mt-3 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg w-full"
            >
              {t("pay.viewRating")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-[#94836f]">{label}</span>
      <span className="text-[13px] font-bold text-[#241c14] dark:text-[#f2ebe2] truncate max-w-[200px]">{value}</span>
    </div>
  );
}
