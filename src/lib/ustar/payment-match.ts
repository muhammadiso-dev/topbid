// Umumiy to'lov MATCH logikasi — Telegram bot webhook va ichki API bir xil funksiyani ishlatadi.
// PUL TUSHGANDA: awaiting bid → paid + profil ACTIVE yoki topup increment;
// verifikatsiya awaiting → pending (hujjat kutilmoqda).

import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";

export interface IncomingPayment {
  amount: number;
  cardLast4?: string;
  externalId?: string | null;
  raw?: string;
}

/** Match natijasi */
export interface MatchResult {
  matched: boolean;
  kind?: "profile" | "topup" | "verification";
  profileName?: string;
  position?: number | string;
}

/**
 * Kirgan to'lovni kutilayotgan (awaiting) bid/verifikatsiya bilan moslashtirish.
 * Bir manba — bot webhook ham, ichki API ham shuni chaqiradi.
 */
export async function matchPayment(payment: IncomingPayment): Promise<MatchResult> {
  const amount = Math.round(payment.amount);
  const cardLast4 = (payment.cardLast4 || "").slice(-4);
  const externalId = payment.externalId ?? null;

  // Dubl himoya
  if (externalId) {
    const dup = await db.paymentLog.findFirst({ where: { externalId } });
    if (dup) return { matched: true, kind: "profile", profileName: "(dubl — o'tkazib yuborildi)" };
  }

  // ===== 1. Kutilayotgan BID =====
  const awaitingBids = await db.bid.findMany({
    where: { status: "awaiting" },
    include: { profile: { select: { id: true, name: true, contactUrl: true, status: true } } },
    orderBy: { createdAt: "asc" },
  });

  let bestBid: (typeof awaitingBids)[number] | null = null;
  let bestDiff = Infinity;
  for (const b of awaitingBids) {
    const diff = Math.abs(b.amount - amount);
    if (diff <= 500 && diff < bestDiff) {
      bestBid = b;
      bestDiff = diff;
    }
  }

  if (bestBid) {
    const wasPending = bestBid.profile.status === "pending";
    await db.$transaction([
      db.bid.update({ where: { id: bestBid.id }, data: { status: "paid" } }),
      db.profile.update({
        where: { id: bestBid.profileId },
        data: {
          status: "active",
          lastBidAt: new Date(),
          ...(wasPending ? {} : { totalBid: { increment: bestBid.credit } }),
        },
      }),
    ]);

    const { getRankedProfiles } = await import("@/lib/ustar/server");
    const ranked = await getRankedProfiles();
    const pos = ranked.find((r) => r.id === bestBid!.profileId)?.position ?? "?";

    await db.paymentLog.create({
      data: {
        externalId,
        amount,
        cardLast4,
        rawMessage: (payment.raw || "").slice(0, 2000),
        matched: true,
        matchedProfileId: bestBid.profileId,
        matchedBidId: bestBid.id,
        processedAt: new Date(),
      },
    });

    await notifyAdmin(
      "payment_auto",
      wasPending
        ? `✅ PUL TUSHDI — PROFIL REYTINGGA CHIQDI\n\n💳 ${formatSom(amount)}${cardLast4 ? ` (****${cardLast4})` : ""}\n👤 ${bestBid.profile.name}\n📍 ${pos}-o'rin\n🔗 ${bestBid.profile.contactUrl}\n\nTopBid bot orqali avtomatik tasdiqlandi.`
        : `✅ PUL TUSHDI — O'RIN YANGILANDI\n\n💳 ${formatSom(amount)}${cardLast4 ? ` (****${cardLast4})` : ""}\n👤 ${bestBid.profile.name}\n📍 Yangi o'rin: ${pos}\n➕ Reyting summasi: +${formatSom(bestBid.credit)}\n\nTopBid bot orqali avtomatik tasdiqlandi.`
    );

    return {
      matched: true,
      kind: wasPending ? "profile" : "topup",
      profileName: bestBid.profile.name,
      position: pos,
    };
  }

  // ===== 2. Kutilayotgan VERIFIKATSIYA =====
  const awaitingVerify = await db.verificationRequest.findMany({
    where: { status: "awaiting" },
    include: { profile: { select: { id: true, name: true, contactUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  let bestVerify: (typeof awaitingVerify)[number] | null = null;
  bestDiff = Infinity;
  for (const v of awaitingVerify) {
    const diff = Math.abs(v.fee - amount);
    if (diff <= 500 && diff < bestDiff) {
      bestVerify = v;
      bestDiff = diff;
    }
  }

  if (bestVerify) {
    await db.$transaction([
      db.verificationRequest.update({ where: { id: bestVerify.id }, data: { status: "pending" } }),
      db.profile.update({ where: { id: bestVerify.profileId }, data: { verifyStatus: "pending" } }),
    ]);

    await db.paymentLog.create({
      data: {
        externalId,
        amount,
        cardLast4,
        rawMessage: (payment.raw || "").slice(0, 2000),
        matched: true,
        matchedProfileId: bestVerify.profileId,
        processedAt: new Date(),
      },
    });

    await notifyAdmin(
      "verify_paid",
      `✅ PUL TUSHDI — VERIFIKATSIYA TO'LOVI\n\n💳 ${formatSom(amount)}${cardLast4 ? ` (****${cardLast4})` : ""}\n👤 ${bestVerify.profile.name}\n🔗 ${bestVerify.profile.contactUrl}\n\nHujjatlarni so'rang: admin panelda Tasdiqlash/Rad etish tugmalari faol.`
    );

    return { matched: true, kind: "verification", profileName: bestVerify.profile.name };
  }

  // ===== 3. Match topilmadi =====
  await db.paymentLog.create({
    data: {
      externalId,
      amount,
      cardLast4,
      rawMessage: (payment.raw || "").slice(0, 2000),
      matched: false,
      processedAt: new Date(),
    },
  });

  await notifyAdmin(
    "payment_unmatched",
    `⚠️ PUL TUSHDI — MATCH TOPILMADI\n\n💳 ${formatSom(amount)}${cardLast4 ? ` (****${cardLast4})` : ""}\n\nKutilayotgan to'lov topilmadi. Admin panelda tekshiring.`
  );

  return { matched: false };
}
