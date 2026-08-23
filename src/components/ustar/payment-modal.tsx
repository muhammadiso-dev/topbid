"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatSom } from "@/lib/ustar/constants";
import { CheckCircle2, Loader2, Send, Wallet, ShieldCheck, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  /** To'lov muvaffaqiyatli bo'lganda */
  onPaid: () => Promise<void> | void;
  summary: {
    name: string;
    poolLabel: string;
    targetLabel: string;
  };
}

type Step = "method" | "bot" | "processing" | "done";

/**
 * To'lov oqimi — Telegram to'lov boti simulyatsiyasi.
 * Real integratsiya: TELEGRAM_BOT_TOKEN orqali bot invoice yuboradi;
 * bu demo rejimida to'lov tugmasi bosilgach tasdiqlanadi.
 */
export function PaymentModal({ open, onOpenChange, amount, onPaid, summary }: PaymentModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [error, setError] = useState<string | null>(null);

  // Yopilganda keyingi ochilish uchun holatni tiklash
  const handleClose = () => {
    if (step === "processing") return;
    onOpenChange(false);
    setStep("method");
    setError(null);
  };

  const confirmPayment = async () => {
    setStep("processing");
    try {
      await onPaid();
      // To'lov "bajarilishi" uchun qisqa kutish (real botda webhook keladi)
      setTimeout(() => setStep("done"), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "To'lovda xatolik yuz berdi");
      setStep("bot");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-white border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block">
        {step === "method" && (
          <div>
            <DialogHeader className="p-5 pb-4 border-b border-[#f0e6da]">
              <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#d97b29]" />
                To'lov
              </DialogTitle>
              <DialogDescription className="text-[#6b5d4d] text-sm">
                Reytingda o'rin uchun to'lovni amalga oshiring
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Xaridor ma'lumoti */}
              <div className="bg-[#fffdfa] border border-[#f0e6da] rounded-xl p-4 space-y-2">
                <Row label="Profil" value={summary.name} />
                <Row label="Yo'nalish" value={summary.poolLabel} />
                <Row label="Maqsad" value={summary.targetLabel} />
                <div className="pt-2 border-t border-dashed border-[#e8ddd0] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#574634]">To'lov summasi</span>
                  <span className="text-xl font-extrabold text-[#d97b29] tabular-nums">
                    {formatSom(amount)}
                  </span>
                </div>
              </div>

              {/* Asosiy usul: Telegram bot */}
              <button
                onClick={() => setStep("bot")}
                className="w-full flex items-center gap-3.5 p-4 rounded-xl border-2 border-[#2aabee]/60 bg-[#f0f9ff] hover:bg-[#e3f4fd] transition-colors cursor-pointer text-left"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2aabee] to-[#229ed9] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[#241c14] text-sm">Telegram bot orqali</p>
                  <p className="text-xs text-[#6b5d4d] mt-0.5">@UstarBot — karta yoki Payme</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#229ed9] bg-white px-2 py-1 rounded-full border border-[#cbe9f8]">
                  Tavsiya
                </span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[#94836f] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                To'lov Telegram to'lov boti orqali xavfsiz amalga oshiriladi
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

            {/* Telegram chat ko'rinishi */}
            <div className="p-5 bg-[#eef4f9]">
              <div className="flex flex-col gap-2.5 max-w-[85%]">
                <div className="self-start bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold text-[#229ed9] mb-1">Ustar Bot</p>
                  <p className="text-sm text-[#241c14] leading-relaxed">
                    Reytingda o'rin uchun to'lov:{" "}
                    <b className="tabular-nums">{formatSom(amount)}</b>
                  </p>
                  <p className="text-sm text-[#241c14] mt-1.5">{summary.targetLabel}</p>
                </div>
                <div className="self-start bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <p className="text-sm text-[#241c14] mb-2.5">
                    To'lov usulini tanlang va tugmani bosing:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {["Payme", "Click", "Karta"].map((m, i) => (
                      <div
                        key={m}
                        className={cn(
                          "text-center text-[11px] font-bold py-1.5 rounded-lg border",
                          i === 0
                            ? "bg-[#229ed9] text-white border-transparent"
                            : "bg-white text-[#6b5d4d] border-[#e0d3c2]"
                        )}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={confirmPayment}
                    disabled={step === "processing"}
                    className="w-full bg-[#229ed9] hover:bg-[#1a8ec4] text-white font-extrabold text-sm py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {formatSom(amount)} — To'lash
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
                onClick={() => setStep("method")}
                className="w-full text-[#6b5d4d] hover:bg-[#f6efe6] font-semibold"
              >
                Orqaga
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#d97b29] animate-spin" />
            <p className="font-bold text-[#241c14]">To'lov qayta ishlanmoqda...</p>
            <p className="text-xs text-[#94836f]">Iltimos, sahifani yopmang</p>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-extrabold text-[#241c14]">To'lov muvaffaqiyatli!</h3>
            <p className="text-sm text-[#6b5d4d] max-w-[280px] leading-relaxed">
              Tabriklaymiz! Profilingiz reytingga qo'shildi. Admin telegram guruhiga xabar yuborildi.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {formatSom(amount)} to'landi
            </div>
            <Button
              onClick={handleClose}
              className="mt-3 bg-[#d97b29] hover:bg-[#c2691f] text-white font-bold rounded-lg w-full"
            >
              Reytingni ko'rish
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
      <span className="text-[13px] font-bold text-[#241c14] truncate max-w-[200px]">{value}</span>
    </div>
  );
}
