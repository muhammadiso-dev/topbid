"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatSom, VERIFICATION_FEE } from "@/lib/ustar/constants";
import { payableAmount } from "@/lib/ustar/pricing";
import { CheckCircle2, Loader2, Send, ShieldCheck, PartyPopper, BadgeCheck, TrendingUp, Star } from "lucide-react";

interface VerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoActive: boolean;
  onPaid: () => Promise<void> | void;
}

type Step = "benefits" | "bot" | "processing" | "done";

/** Verifikatsiya to'lov oqimi — "Tekshirilgan" belgisi uchun */
export function VerifyModal({ open, onOpenChange, promoActive, onPaid }: VerifyModalProps) {
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

  const confirmPayment = async () => {
    setStep("processing");
    try {
      await onPaid();
      setTimeout(() => setStep("done"), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "To'lovda xatolik yuz berdi");
      setStep("bot");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-white border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block">
        {step === "benefits" && (
          <div>
            <DialogHeader className="p-5 pb-4 border-b border-[#f0e6da]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#1d7ed8]" />
                "Tekshirilgan" profil belgisi
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] text-sm">
                Profilingizga ko'k belgi oling va ishonchni oshiring
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Afzalliklar */}
              <div className="space-y-2.5">
                <Benefit
                  icon={<BadgeCheck className="w-4 h-4 text-[#1d7ed8]" />}
                  text="Profilingizda ko'k «Tekshirilgan» belgisi doimiy ko'rinadi"
                />
                <Benefit
                  icon={<TrendingUp className="w-4 h-4 text-[#1d7ed8]" />}
                  text="Tekshirilgan proflarga mijozlar 2-3 barobar ko'proq ishonch qiladi"
                />
                <Benefit
                  icon={<Star className="w-4 h-4 text-[#1d7ed8]" />}
                  text="Sharhlaringiz yonida ham tasdiq belgisi paydo bo'ladi"
                />
              </div>

              {/* Jarayon */}
              <div className="bg-[#fffdfa] border border-[#f0e6da] rounded-xl p-3.5 text-[12px] text-[#574634] leading-relaxed">
                <b className="text-[#241c14]">Qanday ishlaydi?</b> To'lovdan so'ng admin siz bilan
                Telegram orqali bog'lanib, diplom/litsenziya nusxasini so'raydi. Hujjat 24 soat
                ichida ko'rib chiqiladi.
              </div>

              {/* Narx */}
              <div className="bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
                    Bir martalik to'lov
                  </p>
                  {promo && (
                    <p className="text-[11px] text-[#e9a05c] font-bold mt-1">
                      Ochilish aksiyasi -50%
                    </p>
                  )}
                </div>
                <p className="text-right">
                  {promo && (
                    <span className="block text-xs font-bold text-[#94836f] line-through tabular-nums">
                      {formatSom(VERIFICATION_FEE)}
                    </span>
                  )}
                  <span className="text-2xl font-extrabold text-white tabular-nums">
                    {formatSom(fee)}
                  </span>
                </p>
              </div>

              <Button
                onClick={() => setStep("bot")}
                className="w-full h-12 bg-[#1d7ed8] hover:bg-[#1769b8] text-white font-extrabold rounded-xl text-sm active:scale-[0.98] transition-transform"
              >
                <Send className="w-4 h-4" />
                Telegram bot orqali to'lash
              </Button>

              <div className="flex items-center gap-2 text-[11px] text-[#94836f] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                Agar verifikatsiya rad etilsa — to'lov to'liq qaytariladi
              </div>
            </div>
          </div>
        )}

        {step === "bot" && (
          <div>
            <DialogHeader className="p-5 pb-3 border-b border-[#f0e6da]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#229ed9]" />
                Telegram bot
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] text-sm">
                Bot sizga to'lov havolasini yuboradi
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 bg-[#eef4f9]">
              <div className="flex flex-col gap-2.5 max-w-[85%]">
                <div className="self-start bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold text-[#229ed9] mb-1">TopBid Bot</p>
                  <p className="text-sm text-[#241c14] leading-relaxed">
                    Verifikatsiya uchun to'lov:{" "}
                    <b className="tabular-nums">{formatSom(fee)}</b>
                  </p>
                  <p className="text-sm text-[#241c14] mt-1.5">
                    «Tekshirilgan» belgi — bir martalik
                  </p>
                </div>
                <div className="self-start bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {["Payme", "Click", "Karta"].map((m, i) => (
                      <div
                        key={m}
                        className={
                          "text-center text-[11px] font-bold py-1.5 rounded-lg border " +
                          (i === 0
                            ? "bg-[#229ed9] text-white border-transparent"
                            : "bg-white text-[#6b5d4d] border-[#e0d3c2]")
                        }
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={confirmPayment}
                    className="w-full bg-[#229ed9] hover:bg-[#1a8ec4] text-white font-extrabold text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {formatSom(fee)} — To'lash
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-[#f0e6da]">
              <Button
                variant="ghost"
                onClick={() => setStep("benefits")}
                className="w-full text-[#6b5d4d] hover:bg-[#f6efe6] font-semibold"
              >
                Orqaga
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#1d7ed8] animate-spin" />
            <p className="font-bold text-[#241c14]">To'lov qayta ishlanmoqda...</p>
            <p className="text-xs text-[#94836f]">Iltimos, sahifani yopmang</p>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-[#1d7ed8]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#241c14]">So'rov yuborildi!</h3>
            <p className="text-sm text-[#6b5d4d] max-w-[300px] leading-relaxed">
              To'lovingiz qabul qilindi. Admin 24 soat ichida hujjatlar uchun siz bilan bog'lanadi.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d7ed8] bg-[#e8f2fc] border border-[#cbe9f8] rounded-full px-3 py-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {formatSom(fee)} to'landi
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
      <div className="w-8 h-8 rounded-lg bg-[#e8f2fc] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="text-[13px] text-[#574634] font-semibold leading-snug pt-1">{text}</p>
    </div>
  );
}
