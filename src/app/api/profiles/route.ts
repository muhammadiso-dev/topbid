import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { getRankedProfiles } from "@/lib/ustar/server";
import { fullPriceForPosition, payableAmount, tierFor, promoInfo } from "@/lib/ustar/pricing";
import {
  PRICE_TIERS,
  isValidContactUrl,
  normalizeContactUrl,
  formatSom,
  type Pool,
} from "@/lib/ustar/constants";
import type { CreateProfilePayload, CreateProfileResult } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles?pool=education
 * Pool bo'yicha global reyting + aksiya holati.
 */
export async function GET(req: NextRequest) {
  const pool = (req.nextUrl.searchParams.get("pool") || "education") as Pool;
  const safePool = pool === "it" ? "it" : "education";
  const ranked = await getRankedProfiles(safePool);
  return NextResponse.json({
    profiles: ranked,
    promo: promoInfo(),
  });
}

/**
 * POST /api/profiles — yangi profil qo'shish yoki mavjud profilga summa qo'shish.
 *
 * Auksion + aksiya mantig'i:
 *  - Kontakt mavjud bo'lsa — yangi profil ochilmaydi, farq (top-up) mavjud profilga qo'shiladi.
 *  - Reytingga TO'LIQ summa yoziladi, aksiya davrida haqiqiy to'lov 50% kam.
 *  - Summa server tomonida qayta hisoblanadi (ishonch uchun).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateProfilePayload;
    const {
      pool,
      subType,
      categoryId,
      name,
      city,
      description,
      contactUrl,
      imageUrl,
      targetPosition,
      sessionId,
    } = body;

    // --- 1-bosqich: kontakt formati va mavjudligini tekshirish ---
    if (!contactUrl || !isValidContactUrl(contactUrl)) {
      return NextResponse.json(
        {
          error: "Validatsiya xatosi",
          errors: { contactUrl: "Kontakt havolasi noto'g'ri (masalan: @username yoki https://...)" },
        },
        { status: 400 }
      );
    }

    const promo = promoInfo();
    const normalized = normalizeContactUrl(contactUrl);

    // Mavjud profil (bir xil kontakt) — top-up rejimi, qolgan maydonlar talab qilinmaydi
    const existing = await db.profile.findFirst({
      where: { contactUrl: normalized },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    // --- 2-bosqich: yangi profil uchun to'liq validatsiya ---
    if (!existing) {
      const errors: Record<string, string> = {};
      if (pool !== "education" && pool !== "it") errors.pool = "Yo'nalish noto'g'ri";
      if (!name || name.trim().length < 2) errors.name = "Nom kamida 2 belgidan iborat bo'lsin";
      if (name && name.trim().length > 60) errors.name = "Nom 60 belgidan oshmasin";
      // Tavsif ixtiyoriy (URL dan avtomatik olinadi); bo'sh bo'lsa nomdan yasaladi
      if (description && description.trim().length > 300)
        errors.description = "Tavsif 300 belgidan oshmasin";
      if (!city) errors.city = "Shaharni tanlang";
      if (!categoryId) errors.categoryId = "Yo'nalishni tanlang";
      if (Object.keys(errors).length > 0) {
        return NextResponse.json({ error: "Validatsiya xatosi", errors }, { status: 400 });
      }
    }

    const tier = tierFor(pool, subType || (pool === "it" ? "it" : "individual"));
    const t = PRICE_TIERS[tier];

    const ranked = await getRankedProfiles(pool);
    const pos = Math.max(1, Math.floor(Number(targetPosition) || ranked.length + 1));

    if (existing) {
      const requiredFull = fullPriceForPosition(ranked, pos, tier);
      let credit = requiredFull - existing.totalBid;
      if (credit <= 0) credit = t.step; // minimal top-up
      const paid = payableAmount(credit, promo.active);

      await db.$transaction([
        db.bid.create({ data: { profileId: existing.id, amount: paid, status: "paid" } }),
        db.profile.update({
          where: { id: existing.id },
          data: { totalBid: { increment: credit }, lastBidAt: new Date() },
        }),
      ]);

      const newRanked = await getRankedProfiles(pool);
      const updated = newRanked.find((p) => p.id === existing.id);

      await notifyAdmin(
        "topup",
        `💰 Summa qo'shildi: ${existing.name} — to'langan ${formatSom(paid)}${promo.active ? " (aksiya -50%)" : ""}\nReyting summasi: +${formatSom(credit)} • ${updated ? updated.position : "?"}-o'rin`,
        existing.id
      );

      const result: CreateProfileResult = {
        ok: true,
        mode: "topup",
        profile: updated!,
        position: updated?.position ?? pos,
        amount: paid,
        message: `Bu kontakt allaqachon ro'yxatda edi. To'lagan summingiz profilingizga qo'shildi — hozir ${updated?.position ?? pos}-o'rindasiz!`,
      };
      return NextResponse.json(result);
    }

    // --- Yangi profil ---
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category || category.pool !== pool) {
      return NextResponse.json(
        { error: "Kategoriya topilmadi yoki yo'nalishga mos emas" },
        { status: 400 }
      );
    }
    const full = fullPriceForPosition(ranked, pos, tier);
    const paid = payableAmount(full, promo.active);

    const profile = await db.profile.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        city,
        contactUrl: normalized,
        imageUrl: imageUrl?.trim() || null,
        pool,
        subType: pool === "it" ? category.groupName : subType,
        categoryId,
        totalBid: full,
        lastBidAt: new Date(),
      },
    });
    await db.bid.create({
      data: { profileId: profile.id, amount: paid, status: "paid" },
    });

    const newRanked = await getRankedProfiles(pool);
    const created = newRanked.find((p) => p.id === profile.id);

    await notifyAdmin(
      "new_profile",
      `🆕 Yangi profil: ${name.trim()}\n${category.groupName ? category.groupName + " • " : ""}${category.name} • ${city}\nTo'langan: ${formatSom(paid)}${promo.active ? ` (aksiya -50%, reytingga ${formatSom(full)})` : ""} • ${created?.position ?? "?"}-o'rin\nKontakt: ${normalized}`,
      profile.id
    );

    const result: CreateProfileResult = {
      ok: true,
      mode: "created",
      profile: created!,
      position: created?.position ?? pos,
      amount: paid,
      message: `Profilingiz reytingga qo'shildi — ${created?.position ?? pos}-o'rindasiz!`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Profil yaratishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
