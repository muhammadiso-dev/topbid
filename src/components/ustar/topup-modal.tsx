"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "./payment-modal";
import { useUstarStore, getSessionId, saveEditToken } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import { formatSom } from "@/lib/ustar/constants";
import { PRICE } from "@/lib/ustar/pricing";
import { fullPriceForPosition, payableAmount, type PromoConfig, PROMO_FALLBACK } from "@/lib/ustar/pricing";
import type { ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Crown, Trophy } from "lucide-react";

interface TopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileDTO;
  onDone?: () => void;
}

/** "O'rinni yaxshilash" — alohida top-up oqimi (profil ma'lumotlari yozilmaydi) */
export function TopupModal({ open, onOpenChange, profile, onDone }: TopupModalProps) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [ranked, setRanked] = useState<ProfileDTO[] | null>(null);
  const [targetPosition, setTargetPosition] = useState<number | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [promo, setPromo] = useState<PromoConfig>(PROMO_FALLBACK);

  useEffect(() => {
    if (!open) return;
    setRanked(null);
    setTargetPosition(null);
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((d: { profiles: ProfileDTO[]; promo: PromoConfig }) => {
        setRanked(d.profiles);
        setPromo(d.promo ?? PROMO_FALLBACK);
      })
      .catch(() => setRanked([]));
  }, [open]);

  const amountFor = useCallback(
    (position: number) => {
      if (!ranked) return 0;
      const full = fullPriceForPosition(ranked, position);
      // Hozirgi summadan qancha qo'shish kerak
      const credit = Math.max(full - profile.totalBid, PRICE.step);
      return payableAmount(credit, promo.active, promo.percent);
    },
    [ranked, profile.totalBid, promo.active]
  );

  const creditFor = useCallback(
    (position: number) => {
      if (!ranked) return 0;
      const full = fullPriceForPosition(ranked, position);
      return Math.max(full - profile.totalBid, PRICE.step);
    },
    [ranked, profile.totalBid]
  );

  const amount = targetPosition ? amountFor(targetPosition) : 0;
  const credit = targetPosition ? creditFor(targetPosition) : 0;

  const handlePaid = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPosition: targetPosition ?? (ranked?.length ?? 0) + 1,
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast({ title: "⏳ To'lov kutilmoqda", description: data.message });
      // Edit token saqlash (agar qaytsa)
      if (data.editToken) saveEditToken(profile.id, data.editToken);
    } catch (e) {
      toast({
        title: t("err.generic"),
        description: e instanceof Error ? e.message : t("err.server"),
        variant: "destructive",
      });
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block max-h-[92vh] overflow-y-auto scrollbar-thin">
          <DialogHeader className="p-5 pb-3 border-b border-[#f0e6da] sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#d97b29]" />
              {t("topup.title")}
            </DialogTitle>
            <DialogDescription className="text-[#6b5d4d] text-sm">
              {t("topup.desc")}
            </DialogDescription>
            {/* Hozirgi holat */}
            <div className="mt-2 flex items-center gap-2 text-[12px] font-bold">
              <span className="text-[#94836f]">{t("topup.currentRank")}:</span>
              <span className="text-[#d97b29]">{profile.position}-o'rin</span>
              <span className="text-[#c4b5a1]">·</span>
              <span className="text-[#241c14] truncate">{profile.name}</span>
            </div>
          </DialogHeader>

          <div className="p-5">
            {!ranked ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg bg-[#f0e6da]" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1 -mr-1">
                {Array.from({ length: ranked.length + 1 }, (_, i) => i + 1).map((pos) => {
                  const holder = ranked[pos - 1];
                  const isSelf = holder?.id === profile.id;
                  const pay = amountFor(pos);
                  const cr = creditFor(pos);
                  const active = targetPosition === pos;
                  const isTop = pos <= 3;
                  const isTop1 = pos === 1;
                  return (
                    <button
                      key={pos}
                      type="button"
                      disabled={isSelf}
                      onClick={() => setTargetPosition(pos)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-3 rounded-lg border-2 transition-all text-left",
                        isSelf
                          ? "border-[#e9b98a] bg-[#fff9f2] opacity-60 cursor-not-allowed"
                          : active
                            ? "border-[#d97b29] bg-[#fff9f2] cursor-pointer"
                            : "border-[#f0e6da] bg-white hover:border-[#e0cdb4] cursor-pointer"
                      )}
                      aria-pressed={active}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {isTop1 ? (
                          <Crown className="w-4 h-4 shrink-0 text-[#d97b29]" />
                        ) : (
                          <Trophy
                            className={cn("w-4 h-4 shrink-0", isTop ? "text-[#d97b29]" : "text-[#c4b5a1]")}
                          />
                        )}
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "flex items-center gap-1.5 text-[13px] font-extrabold",
                              active ? "text-[#b25e14]" : "text-[#241c14]"
                            )}
                          >
                            {pos}
                            {t("form.targetPosition")}
                            {isTop1 && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#d97b29] text-white px-1.5 py-0.5 rounded-full shrink-0">
                                TOP-1
                              </span>
                            )}
                            {isTop && !isTop1 && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#fdeedd] text-[#b25e14] px-1.5 py-0.5 rounded-full shrink-0">
                                TOP
                              </span>
                            )}
                            {isSelf && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#f6efe6] text-[#94836f] px-1.5 py-0.5 rounded-full shrink-0">
                                siz
                              </span>
                            )}
                          </span>
                          {holder ? (
                            <span className="block text-[10px] text-[#94836f] font-semibold truncate mt-0.5">
                              {t("form.holderNow")} {holder.name}
                            </span>
                          ) : (
                            <span className="block text-[10px] text-[#94836f] font-semibold mt-0.5">
                              {t("form.emptySpot")}
                            </span>
                          )}
                        </span>
                      </span>
                      {!isSelf && (
                        <span className="text-[13px] font-extrabold tabular-nums text-[#d97b29] shrink-0">
                          {formatSom(pay, lang)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Xulosa */}
            {targetPosition && (
              <div className="mt-4 bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94836f]">
                    {targetPosition}
                    {t("form.targetPosition")}
                  </p>
                  <p className="text-[11px] text-[#c4b5a1] font-medium mt-1">
                    +{formatSom(credit, lang)} reyting summasiga
                  </p>
                </div>
                <p className="text-xl font-extrabold text-white tabular-nums shrink-0">
                  {formatSom(amount, lang)}
                </p>
              </div>
            )}

            <Button
              disabled={!targetPosition || submitting}
              onClick={() => setPaymentOpen(true)}
              className="w-full h-12 mt-4 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-sm shadow-md shadow-[#d97b29]/25"
            >
              {t("form.toPayment")} — {formatSom(amount, lang)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Karta to'lovi — pul kutilmoqda */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={amount}
        fullAmount={null}
        onPaid={handlePaid}
        summary={{
          name: profile.name,
          poolLabel: profile.categoryName,
          targetLabel: `${targetPosition}${t("form.targetPosition")}`,
        }}
      />
    </>
  );
}
