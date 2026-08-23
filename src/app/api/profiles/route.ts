import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { getRankedProfiles } from "@/lib/ustar/server";
import { fullPriceForPosition, payableAmount, PRICE } from "@/lib/ustar/pricing";
import { getPromoConfig } from "@/lib/ustar/promo-server";
import {
  isValidContactUrl,
  normalizeContactUrl,
  formatSom,
} from "@/lib/ustar/constants";
import type { CreateProfilePayload, CreateProfileResult } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/** Yangi yaratilgan profil uchun vaqtinchalik DTO (reytingda hali yo'q) */
function serializeProfileExisting(p: {
  id: string;
  name: string;
  description: string;
  city: string;
  contactUrl: string;
  imageUrl: string | null;
  pool: string;
  subType: string;
  categoryId: string;
  verifyStatus: string;
  totalBid: number;
  clicks: number;
  views: number;
  createdAt: Date;
  lastBidAt: Date;
}): import("@/lib/ustar/types").ProfileDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    city: p.city,
    contactUrl: p.contactUrl,
    imageUrl: p.imageUrl,
    pool: p.pool as "education" | "it",
    subType: p.subType,
    categoryId: p.categoryId,
    categoryName: "",
    categoryGroup: "",
    verifyStatus: (p.verifyStatus as "none" | "pending" | "verified") ?? "none",
    totalBid: p.totalBid,
    clicks: p.clicks,
    views: p.views,
    createdAt: p.createdAt.toISOString(),
    lastBidAt: p.lastBidAt.toISOString(),
    reviewsCount: 0,
    avgRating: 0,
    position: 0,
  };
}

/**
 * GET /api/profiles — YAGONA reyting (ta'lim + IT birga) + aksiya holati.
 */
export async function GET() {
  const [ranked, promo] = await Promise.all([getRankedProfiles(), getPromoConfig()]);
  return NextResponse.json({
    profiles: ranked,
    promo,
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

    const promo = await getPromoConfig();
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

    const pool = existing ? existing.pool : category!.pool;
    const st = existing ? existing.subType : subType || (pool === "it" ? "it" : "individual");

    const ranked = await getRankedProfiles();
    const pos = Math.max(1, Math.floor(Number(targetPosition) || ranked.length + 1));

    // --- Top-up (mavjud kontakt) ---
    if (existing) {
      const requiredFull = fullPriceForPosition(ranked, pos, tier);
      let credit = requiredFull - existing.totalBid;
      if (credit <= 0) credit = t.step;
      const paid = payableAmount(credit, promo.active, promo.percent);

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
        `💰 Summa qo'shildi: ${existing.name} — to'langan ${formatSom(paid)}${promo.active ? ` (aksiya -${Math.round(promo.percent*100)}%)` : ""}\nReyting summasi: +${formatSom(credit)} • ${updated ? updated.position : "?"}-o'rin`,
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

    // --- Yangi profil — PENDING (pul tushmaguncha reytingda ko'rinmaydi) ---
    const full = fullPriceForPosition(ranked, pos);
    const paid = payableAmount(full, promo.active, promo.percent);
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
        totalBid: full, // o'rinni band qiladi; status pending bo'lgani uchun reytingda ko'rinmaydi
        lastBidAt: new Date(),
        editToken,
        status: "pending",
      },
    });
    await db.bid.create({
      data: { profileId: profile.id, amount: paid, credit: full, status: "awaiting" },
    });

    await notifyAdmin(
      "new_profile_awaiting",
      `⏳ YANGI PROFIL (pul kutilmoqda): ${name.trim()}\n${category!.groupName ? category!.groupName + " • " : ""}${category!.name} • ${city}\nKutilmoqda: ${formatSom(paid)}${promo.active ? ` (aksiya -${Math.round(promo.percent*100)}%, reytingga ${formatSom(full)})` : ""}\nKontakt: ${normalized}\nPul tushishi bilan avtomatik reytingga chiqadi.`,
      profile.id
    );

    const result: CreateProfileResult = {
      ok: true,
      mode: "created",
      profile: serializeProfileExisting(profile),
      position: pos,
      amount: paid,
      editToken,
      message: `To'lov qabul qilindi! Kartaga ${formatSom(paid)} o'tkazing — pul tushishi bilan profilingiz ${pos}-o'rinda reytingda ko'rinadi.`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Profil yaratishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
