// YAGONA NARX tizimi — hammasiga bitta narx:
//   Min. taklif: 30 000 · Qadam: 5 000 · TOP-1 egallash: +50 000 · Boshqa o'rinlar: +10 000
// Aksiya admin panelda boshqariladi (AppSettings: promoActive / promoEndsAt / promoPercent).

export const PRICE = {
  /** Yangi profil uchun eng kam taklif */
  min: 30_000,
  /** Miqdorni o'zgartirish qadami (minimal top-up) */
  step: 5_000,
  /** TOP-1 o'rinni egallash uchun qo'shimcha taklif */
  top1Premium: 50_000,
  /** Boshqa o'rinlarni egallash uchun qo'shimcha taklif */
  takeoverStep: 10_000,
};

/** Verifikatsiya ("Tekshirilgan" belgi) — bir martalik; to'lovining 50% ehsona ketadi */
export const VERIFICATION_FEE = 50_000;

export interface PromoConfig {
  active: boolean;
  endsAt: string; // ISO
  percent: number; // 0.5 = 50% chegirma
}

/** Standart aksiya konfigi (fallback — server ishlamasa) */
export const PROMO_FALLBACK: PromoConfig = {
  active: false,
  endsAt: new Date().toISOString(),
  percent: 0.5,
};

/**
 * Maqsadli o'rin uchun TO'LIQ narx (reytingga yoziladigan summa).
 * - O'rin bo'sh: min (30 000)
 * - TOP-1: hozirgi egasi + 50 000
 * - Boshqa o'rinlar: hozirgi egasi + 10 000
 */
export function fullPriceForPosition(
  ranked: { totalBid: number }[],
  position: number
): number {
  const pos = Math.max(1, Math.floor(position));
  const holder = ranked[pos - 1];
  if (!holder) return PRICE.min;
  if (pos === 1) return holder.totalBid + PRICE.top1Premium;
  return holder.totalBid + PRICE.takeoverStep;
}

/** Aksiya davrida haqiqiy to'lanadigan summa (500 so'mga yaxlitlash) */
export function payableAmount(full: number, promoActive: boolean, percent = 0.5): number {
  if (!promoActive) return full;
  return Math.max(500, Math.round((full * (1 - percent)) / 500) * 500);
}

/** Qulay kombain */
export function priceForPosition(
  ranked: { totalBid: number }[],
  position: number,
  promoActive: boolean,
  percent = 0.5
): number {
  return payableAmount(fullPriceForPosition(ranked, position), promoActive, percent);
}

/** Kirish narxi — CTA matnlari uchun */
export function entryPrice(promoActive: boolean, percent = 0.5): number {
  return payableAmount(PRICE.min, promoActive, percent);
}

/** Aksiya qolgan vaqt (ms) */
export function promoMsLeft(endsAt: string): number {
  return Math.max(0, new Date(endsAt).getTime() - Date.now());
}
