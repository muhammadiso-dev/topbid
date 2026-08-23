import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { getRankedProfiles } from "@/lib/ustar/server";
import { fullPriceForPosition, payableAmount, tierFor, promoInfo } from "@/lib/ustar/pricing";
import {
  PRICE_TIERS,
  isValidContactUrl,
  normalizeContactUrl,
  formatSom,
} from "@/lib/ustar/constants";
import type { CreateProfilePayload, CreateProfileResult } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles — YAGONA reyting (ta'lim + IT birga) + aksiya holati.
 */
export async function GET() {
  const ranked = await getRankedProfiles();
  return NextResponse.json({
    profiles: ranked,
    promo: promoInfo(),
  });
}

/**
 * POST /api/profiles — yangi profil yoki mavjud profilga summa qo'shish.
 * Pool kategoriyadan olinadi (O'rganish/Yollash tanlovi yo'q).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateProfilePayload;
    const { subType, categoryId, name, city, description, contactUrl, imageUrl, targetPosition } =
      body;

    // --- 1: kontakt formati + mavjudlik ---
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
    const existing = await db.profile.findFirst({
      where: { contactUrl: normalized },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    // --- 2: yangi profil validatsiyasi ---
    let category: { id: string; pool: string; groupName: string; name: string } | null = null;
    if (!existing) {
      const errors: Record<string, string> = {};
      if (!categoryId) errors.categoryId = "Kategoriyani tanlang";
      if (!city) errors.city = "Shaharni tanlang";
      if (!name || name.trim().length < 2) errors.name = "Nom kamida 2 belgidan iborat bo'lsin";
      if (Object.keys(errors).length > 0) {
        return NextResponse.json({ error: "Validatsiya xatosi", errors }, { status: 400 });
      }
      const cat = await db.category.findUnique({ where: { id: categoryId } });
      if (!cat) {
        return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 400 });
      }
      category = { id: cat.id, pool: cat.pool, groupName: cat.groupName, name: cat.name };
    }

    // Tier: kategoriya pool'i + subType dan
    const pool = existing ? existing.pool : category!.pool;
    const st = existing ? existing.subType : pool === "it" ? "it" : subType || "individual";
    const tier = tierFor(pool, st);
    const t = PRICE_TIERS[tier];

    const ranked = await getRankedProfiles();
    const pos = Math.max(1, Math.floor(Number(targetPosition) || ranked.length + 1));

    // --- Top-up (mavjud kontakt) ---
    if (existing) {
      const requiredFull = fullPriceForPosition(ranked, pos, tier);
      let credit = requiredFull - existing.totalBid;
      if (credit <= 0) credit = t.step;
      const paid = payableAmount(credit, promo.active);

      await db.$transaction([
        db.bid.create({ data: { profileId: existing.id, amount: paid, status: "paid" } }),
        db.profile.update({
          where: { id: existing.id },
          data: { totalBid: { increment: credit }, lastBidAt: new Date() },
        }),
      ]);

      const newRanked = await getRankedProfiles();
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
        editToken: existing.editToken ?? undefined,
        message: `Bu kontakt allaqachon ro'yxatda edi. To'lagan summingiz profilingizga qo'shildi — hozir ${updated?.position ?? pos}-o'rindasiz!`,
      };
      return NextResponse.json(result);
    }

    // --- Yangi profil ---
    const full = fullPriceForPosition(ranked, pos, tier);
    const paid = payableAmount(full, promo.active);
    const editToken = crypto.randomUUID();

    const profile = await db.profile.create({
      data: {
        name: name.trim(),
        description: (description || name).trim().slice(0, 300),
        city,
        contactUrl: normalized,
        imageUrl: imageUrl?.trim() || null,
        pool,
        subType: st,
        categoryId: category!.id,
        totalBid: full,
        lastBidAt: new Date(),
        editToken,
      },
    });
    await db.bid.create({
      data: { profileId: profile.id, amount: paid, status: "paid" },
    });

    const newRanked = await getRankedProfiles();
    const created = newRanked.find((p) => p.id === profile.id);

    await notifyAdmin(
      "new_profile",
      `🆕 Yangi profil: ${name.trim()}\n${category!.groupName ? category!.groupName + " • " : ""}${category!.name} • ${city}\nTo'langan: ${formatSom(paid)}${promo.active ? ` (aksiya -50%, reytingga ${formatSom(full)})` : ""} • ${created?.position ?? "?"}-o'rin\nKontakt: ${normalized}`,
      profile.id
    );

    const result: CreateProfileResult = {
      ok: true,
      mode: "created",
      profile: created!,
      position: created?.position ?? pos,
      amount: paid,
      editToken,
      message: `Profilingiz reytingga qo'shildi — ${created?.position ?? pos}-o'rindasiz!`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Profil yaratishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
