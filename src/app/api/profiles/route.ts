import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { computePriceForPosition, getRankedProfiles } from "@/lib/ustar/server";
import {
  isValidContactUrl,
  normalizeContactUrl,
  formatSom,
  MIN_BID,
  type Pool,
} from "@/lib/ustar/constants";
import type { CreateProfilePayload, CreateProfileResult, PriceOptionDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles?pool=education
 * Pool bo'yicha reyting (pozitsiyalar butun pool ichida hisoblanadi).
 */
export async function GET(req: NextRequest) {
  const pool = (req.nextUrl.searchParams.get("pool") || "education") as Pool;
  const ranked = await getRankedProfiles(pool === "education" || pool === "it" ? pool : undefined);

  // Har bir o'rin uchun narx variantlarini ham qaytaramiz (forma uchun)
  const priceOptions: PriceOptionDTO[] = ranked.map((p, idx) => ({
    position: idx + 1,
    price: computePriceForPosition(ranked, idx + 1),
    label: `${idx + 1}-o'rin — ${ranked[idx].name}`,
  }));
  // Ro'yxat oxiriga qo'shish varianti (minimal narx)
  priceOptions.push({
    position: ranked.length + 1,
    price: MIN_BID,
    label: `${ranked.length + 1}-o'rin (oxiri)`,
  });

  return NextResponse.json({ profiles: ranked, priceOptions });
}

/**
 * POST /api/profiles — yangi profil qo'shish yoki mavjud profilga summa qo'shish.
 *
 * Auksion mantig'i:
 *  - Kontakt havolasi allaqachon mavjud bo'lsa — yangi profil ochilmaydi,
 *    summa mavjud profilga qo'shiladi (top-up).
 *  - Summa server tomonida qayta hisoblanadi (maqsadli o'rindan +qadam).
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

    // --- Validatsiya ---
    const errors: Record<string, string> = {};
    if (pool !== "education" && pool !== "it") errors.pool = "Pool noto'g'ri";
    if (!name || name.trim().length < 2) errors.name = "Nom kamida 2 belgidan iborat bo'lsin";
    if (name && name.trim().length > 60) errors.name = "Nom 60 belgidan oshmasin";
    if (!description || description.trim().length < 10)
      errors.description = "Tavsif kamida 10 belgidan iborat bo'lsin";
    if (description && description.trim().length > 300)
      errors.description = "Tavsif 300 belgidan oshmasin";
    if (!city) errors.city = "Shaharni tanlang";
    if (!contactUrl || !isValidContactUrl(contactUrl))
      errors.contactUrl = "Kontakt havolasi noto'g'ri (masalan: @username yoki https://...)";
    if (!categoryId) errors.categoryId = "Fan/sohani tanlang";
    if (!subType) errors.subType = "Toifani tanlang";
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validatsiya xatosi", errors }, { status: 400 });
    }

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category || category.pool !== pool) {
      return NextResponse.json(
        { error: "Kategoriya topilmadi yoki poolga mos emas" },
        { status: 400 }
      );
    }

    const normalized = normalizeContactUrl(contactUrl);
    const ranked = await getRankedProfiles(pool);
    const pos = Math.max(1, Math.floor(Number(targetPosition) || ranked.length + 1));

    // --- Mavjud profil tekshiruvi (bir xil kontakt) ---
    const existing = await db.profile.findFirst({
      where: { contactUrl: normalized },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    if (existing) {
      // Top-up: summa mavjud profilga qo'shiladi
      const requiredTotal = computePriceForPosition(ranked, pos);
      const amount = Math.max(requiredTotal - existing.totalBid, MIN_BID);

      const [bid] = await db.$transaction([
        db.bid.create({
          data: { profileId: existing.id, amount, status: "paid" },
        }),
        db.profile.update({
          where: { id: existing.id },
          data: { totalBid: { increment: amount }, lastBidAt: new Date() },
        }),
      ]);

      const newRanked = await getRankedProfiles(pool);
      const updated = newRanked.find((p) => p.id === existing.id);

      await notifyAdmin(
        "topup",
        `💰 Summa qo'shildi: ${existing.name} — ${formatSom(amount)}\nYangi jami: ${formatSom(updated?.totalBid ?? existing.totalBid + amount)} • ${updated ? updated.position : "?"}-o'rin`,
        existing.id
      );

      const result: CreateProfileResult = {
        ok: true,
        mode: "topup",
        profile: updated!,
        position: updated?.position ?? pos,
        amount,
        message: `Bu kontakt allaqachon ro'yxatda edi. ${formatSom(amount)} summa profilingizga qo'shildi — hozir ${updated?.position ?? pos}-o'rindasiz.`,
      };
      void bid;
      return NextResponse.json(result);
    }

    // --- Yangi profil yaratish ---
    const amount = computePriceForPosition(ranked, pos);

    const profile = await db.profile.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        city,
        contactUrl: normalized,
        imageUrl: imageUrl?.trim() || null,
        pool,
        subType,
        categoryId,
        totalBid: amount,
        lastBidAt: new Date(),
      },
    });
    await db.bid.create({
      data: { profileId: profile.id, amount, status: "paid" },
    });

    const newRanked = await getRankedProfiles(pool);
    const created = newRanked.find((p) => p.id === profile.id);

    await notifyAdmin(
      "new_profile",
      `🆕 Yangi profil: ${name.trim()}\n${category.name} • ${city}\nTo'lov: ${formatSom(amount)} • ${created?.position ?? "?"}-o'rin\nKontakt: ${normalized}`,
      profile.id
    );

    const result: CreateProfileResult = {
      ok: true,
      mode: "created",
      profile: created!,
      position: created?.position ?? pos,
      amount,
      message: `Profilingiz reytingga qo'shildi — ${created?.position ?? pos}-o'rindasiz!`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Profil yaratishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
