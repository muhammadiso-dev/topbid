import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankedProfiles, serializeProfile } from "@/lib/ustar/server";
import { formatSom } from "@/lib/ustar/constants";
import { fullPriceForPosition, payableAmount, tierFor, promoInfo } from "@/lib/ustar/pricing";
import { PRICE_TIERS } from "@/lib/ustar/constants";
import { notifyAdmin } from "@/lib/ustar/telegram";
import type { CreateProfileResult } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles/[id] — profil batafsil + sharhlar.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await db.profile.findUnique({
    where: { id },
    include: { category: true, reviews: { select: { rating: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
  }
  const ranked = await getRankedProfiles(profile.pool);
  const dto = ranked.find((p) => p.id === id);
  const reviews = await db.review.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({
    profile: dto ?? serializeProfile(profile, 0),
    reviews,
  });
}

/**
 * POST /api/profiles/[id] — mavjud profilga qo'shimcha to'lov (o'rin uchun raqobat).
 * Body: { targetPosition: number }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const targetPosition = Math.max(1, Math.floor(Number(body?.targetPosition) || 1));

    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }

    const promo = promoInfo();
    const tier = tierFor(profile.pool, profile.subType);
    const t = PRICE_TIERS[tier];

    const ranked = await getRankedProfiles(profile.pool);
    const requiredFull = fullPriceForPosition(ranked, targetPosition, tier);
    let credit = requiredFull - profile.totalBid;
    if (credit <= 0) credit = t.step; // minimal top-up
    const paid = payableAmount(credit, promo.active);

    await db.$transaction([
      db.bid.create({ data: { profileId: id, amount: paid, status: "paid" } }),
      db.profile.update({
        where: { id },
        data: { totalBid: { increment: credit }, lastBidAt: new Date() },
      }),
    ]);

    const newRanked = await getRankedProfiles(profile.pool);
    const updated = newRanked.find((p) => p.id === id);

    await notifyAdmin(
      "topup",
      `💰 Summa qo'shildi: ${profile.name} — to'langan ${formatSom(paid)}${promo.active ? " (aksiya -50%)" : ""}\nReyting summasi: +${formatSom(credit)} • Yangi o'rin: ${updated?.position}`,
      id
    );

    const result: CreateProfileResult = {
      ok: true,
      mode: "topup",
      profile: updated!,
      position: updated?.position ?? targetPosition,
      amount: paid,
      message: `To'lovingiz qabul qilindi — hozir ${updated?.position ?? targetPosition}-o'rindasiz!`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Bid qo'shishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/**
 * DELETE /api/profiles/[id] — admin profilni o'chirish (pul qaytarish bilan).
 * Body: { adminPassword: string }
 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const adminPassword = String(body?.adminPassword || "");
    const expected = process.env.ADMIN_PASSWORD || "ustar2024";
    if (adminPassword !== expected) {
      return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }

    // Bidlar "refunded" deb belgilanadi (daromad kamayadi), verifikatsiya so'rovlari cascade o'chadi
    await db.$transaction([
      db.bid.updateMany({ where: { profileId: id }, data: { status: "refunded" } }),
      db.profile.delete({ where: { id } }),
    ]);

    await notifyAdmin(
      "refund",
      `🗑 Profil o'chirildi: ${profile.name}\nBarcha to'lovlar qaytarildi`,
      id
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Profilni o'chirishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
