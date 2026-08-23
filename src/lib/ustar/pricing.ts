// Narx mantiqining yadrosi — client va server tomonida bir xil ishlaydi.
// Auksion qoidasi: N-o'rinni olish uchun shu o'rin egasidan qadam (+ TOP-1 uchun premium) ko'p to'lash kerak.
// Aksiya davrida HAQIQIY to'lov 50% kam, lekin reytingga TO'LIQ summa yoziladi
// (erta qo'shilganlar to'liq qiymatni yarim narxga oladi).

import {
  PRICE_TIERS,
  PROMO_MULTIPLIER,
  promoInfo,
  type PriceTier,
  type Pool,
} from "./constants";

/** Pool + toifadan narx darajasini aniqlash */
export function tierFor(pool: string, subType: string): PriceTier {
  if (pool === "it") return "it";
  return subType === "center" ? "edu_center" : "edu_individual";
}

/**
 * Maqsadli o'rin uchun TO'LIQ narx (reytingga yoziladigan summa).
 * - O'rin bo'sh bo'lsa: minimal taklif
 * - TOP-1: hozirgi egasi + qadam + TOP-1 premium
 * - Boshqa o'rinlar: hozirgi egasi + qadam
 */
export function fullPriceForPosition(
  ranked: { totalBid: number }[],
  position: number,
  tier: PriceTier
): number {
  const t = PRICE_TIERS[tier];
  const pos = Math.max(1, Math.floor(position));
  const holder = ranked[pos - 1];
  if (!holder) return t.min;
  if (pos === 1) return holder.totalBid + t.step + t.top1Extra;
  return holder.totalBid + t.step;
}

/** Aksiya davrida haqiqiy to'lanadigan summa (500 so'mga yaxlitlash) */
export function payableAmount(full: number, promoActive: boolean): number {
  if (!promoActive) return full;
  return Math.max(500, Math.round((full * PROMO_MULTIPLIER) / 500) * 500);
}

/** Qulay kombain: o'rin uchun to'lanadigan summa */
export function priceForPosition(
  ranked: { totalBid: number }[],
  position: number,
  tier: PriceTier,
  promoActive: boolean
): number {
  return payableAmount(fullPriceForPosition(ranked, position, tier), promoActive);
}

/** Kirish narxi (eng arzon yo'l) — CTA matnlari uchun */
export function entryPrice(pool: Pool, promoActive: boolean): number {
  if (pool === "it") return payableAmount(PRICE_TIERS.it.min, promoActive);
  // Ta'limda eng arzon yo'l — individual repetitor darajasi
  return payableAmount(PRICE_TIERS.edu_individual.min, promoActive);
}

/** Aksiya holati (clientda ham ishlaydi) */
export { promoInfo };
