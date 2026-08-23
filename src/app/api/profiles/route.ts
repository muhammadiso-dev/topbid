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
    const { subType, categoryId, name, city, description, contactUrl, imageUrl, targetPosition, paidAmount } =
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
      const requiredFull = fullPriceForPosition(ranked, pos);
      let credit = requiredFull - existing.totalBid;
      if (credit <= 0) credit = PRICE.step;
      const calculatedPaid = payableAmount(credit, promo.active, promo.percent);
      const finalPaid = (paidAmount && Math.abs(paidAmount - calculatedPaid) <= 100) ? paidAmount : calculatedPaid;

      const bid = await db.bid.create({ 
        data: { 
          profileId: existing.id, 
          amount: finalPaid, 
          credit, 
          status: "awaiting" 
        } 
      });

      let updated = ranked.find(p => p.id === existing.id);
      let instantlyMatched = false;

      // O'tmishga qarash: tugma bosilmasdan oldin pul tushgan bo'lsa
      const pastPayment = await db.paymentLog.findFirst({
        where: { matched: false, amount: finalPaid, createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
        orderBy: { createdAt: "desc" }
      });

      if (pastPayment) {
        await db.$transaction([
          db.bid.update({ where: { id: bid.id }, data: { status: "paid" } }),
          db.profile.update({
            where: { id: existing.id },
            data: { status: "active", lastBidAt: new Date(), totalBid: { increment: credit } },
          }),
          db.paymentLog.update({
            where: { id: pastPayment.id },
            data: { matched: true, matchedProfileId: existing.id, matchedBidId: bid.id }
          })
        ]);
        instantlyMatched = true;
        
        // Yangi reytingni olamiz
        const { getRankedProfiles: refreshRanked } = await import("@/lib/ustar/server");
        const freshRanked = await refreshRanked();
        updated = freshRanked.find((p) => p.id === existing.id);
      }

      if (instantlyMatched) {
        await notifyAdmin(
          "payment_auto",
          `✅ PUL TUSHDI (Oldindan tushgan) — O'RIN YANGILANDI\n\n💳 ${formatSom(finalPaid)}\n👤 ${existing.name}\n📍 Yangi o'rin: ${updated?.position ?? pos}\n➕ Reyting summasi: +${formatSom(credit)}\n\n(Tugma kechikib bosildi, lekin avtomatik topildi)`
        );
      } else {
        await notifyAdmin(
          "topup",
          `⏳ To'lov kutilmoqda (Top-up): ${existing.name} — ${formatSom(finalPaid)}${promo.active ? ` (aksiya -${Math.round(promo.percent*100)}%)` : ""}\nTasdiqlangach reyting summasi: +${formatSom(credit)}`,
          existing.id
        );
      }

      const result: CreateProfileResult = {
        ok: true,
        mode: "topup",
        profile: updated || serializeProfileExisting(existing as any),
        position: updated?.position ?? pos,
        amount: finalPaid,
        editToken: existing.editToken ?? undefined,
        message: instantlyMatched 
          ? `Sizning to'lovingiz zudlik bilan tasdiqlandi! Siz ${updated?.position ?? pos}-o'ringa ko'tarildingiz!`
          : `Bu kontakt allaqachon ro'yxatda edi. Sizning o'rningiz pul tushgach avtomatik yangilanadi! Hozircha ${updated?.position ?? pos}-o'rindasiz.`,
      };
      return NextResponse.json(result);
    }

    // --- Yangi profil — PENDING (pul tushmaguncha reytingda ko'rinmaydi) ---
    const full = fullPriceForPosition(ranked, pos);
    const calculatedPaid = payableAmount(full, promo.active, promo.percent);
    const finalPaid = (paidAmount && Math.abs(paidAmount - calculatedPaid) <= 100) ? paidAmount : calculatedPaid;
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
    const bid = await db.bid.create({
      data: { profileId: profile.id, amount: finalPaid, credit: full, status: "awaiting" },
    });
    
    let instantlyMatched = false;
    let actualPos = pos;
    const pastPayment = await db.paymentLog.findFirst({
      where: { matched: false, amount: finalPaid, createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
      orderBy: { createdAt: "desc" }
    });

    if (pastPayment) {
      await db.$transaction([
        db.bid.update({ where: { id: bid.id }, data: { status: "paid" } }),
        db.profile.update({
          where: { id: profile.id },
          data: { status: "active", lastBidAt: new Date() }, // pendingdan active ga
        }),
        db.paymentLog.update({
          where: { id: pastPayment.id },
          data: { matched: true, matchedProfileId: profile.id, matchedBidId: bid.id }
        })
      ]);
      instantlyMatched = true;
      const { getRankedProfiles: refreshRanked } = await import("@/lib/ustar/server");
      const freshRanked = await refreshRanked();
      actualPos = freshRanked.find((p) => p.id === profile.id)?.position ?? pos;
    }

    if (instantlyMatched) {
      await notifyAdmin(
        "payment_auto",
        `✅ PUL TUSHDI (Oldindan tushgan) — PROFIL REYTINGGA CHIQDI\n\n💳 ${formatSom(finalPaid)}\n👤 ${profile.name}\n📍 ${actualPos}-o'rin\n🔗 ${profile.contactUrl}\n\n(Tugma kechikib bosildi, lekin avtomatik topildi)`
      );
    } else {
      await notifyAdmin(
        "new_profile_awaiting",
        `⏳ YANGI PROFIL (pul kutilmoqda): ${name.trim()}\n${category!.groupName ? category!.groupName + " • " : ""}${category!.name} • ${city}\nKutilmoqda: ${formatSom(finalPaid)}${promo.active ? ` (aksiya -${Math.round(promo.percent*100)}%, reytingga ${formatSom(full)})` : ""}\nKontakt: ${normalized}\nPul tushishi bilan avtomatik reytingga chiqadi.`,
        profile.id
      );
    }

    const result: CreateProfileResult = {
      ok: true,
      mode: "created",
      profile: serializeProfileExisting({ ...profile, status: instantlyMatched ? "active" : "pending" } as any),
      position: actualPos,
      amount: finalPaid,
      editToken,
      message: instantlyMatched
        ? `To'lovingiz zudlik bilan tasdiqlandi! Profilingiz reytingga chiqdi.`
        : `To'lov qabul qilindi! Kartaga ${formatSom(finalPaid)} o'tkazing — pul tushishi bilan profilingiz ${pos}-o'rinda reytingda ko'rinadi.`,
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("Profil yaratishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
