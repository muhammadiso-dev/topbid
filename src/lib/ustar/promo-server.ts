// Server tomonida aksiyani DB'dan o'qish (AppSettings)

import { db } from "@/lib/db";
import { PROMO_FALLBACK, type PromoConfig } from "@/lib/ustar/pricing";

export async function getPromoConfig(): Promise<PromoConfig> {
  try {
    const s = await db.appSettings.findUnique({ where: { id: "main" } });
    if (!s) return PROMO_FALLBACK;
    const active = s.promoActive && s.promoEndsAt.getTime() > Date.now();
    return {
      active,
      endsAt: s.promoEndsAt.toISOString(),
      percent: s.promoPercent,
    };
  } catch {
    return PROMO_FALLBACK;
  }
}
