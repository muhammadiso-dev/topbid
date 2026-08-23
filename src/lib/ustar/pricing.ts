// YAGONA NARX tizimi — hammasiga bitta narx (raqobatchi sindr.uz modeli):
//   Min. taklif: 30 000 · Qadam: 5 000 · TOP-1 egallash: +50 000 · Boshqa o'rinlar: +10 000
// Aksiya davrida HAQIQIY to'lov 50% kam, reytingga TO'LIQ summa yoziladi.

import { PROMO_MULTIPLIER, promoInfo } from "./constants";

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
export function payableAmount(full: number, promoActive: boolean): number {
  if (!promoActive) return full;
  return Math.max(500, Math.round((full * PROMO_MULTIPLIER) / 500) * 500);
}

/** Qulay kombain */
export function priceForPosition(
  ranked: { totalBid: number }[],
  position: number,
  promoActive: boolean
): number {
  return payableAmount(fullPriceForPosition(ranked, position), promoActive);
}

/** Kirish narxi — CTA matnlari uchun */
export function entryPrice(promoActive: boolean): number {
  return payableAmount(PRICE.min, promoActive);
}

/** Aksiya holati */
export { promoInfo };
