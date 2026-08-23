import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/internal — StarKerak listener'dan kelgan REAL to'lov xabarlari.
 * HumoCardBot → StarKerak (WebSocket) → listener → shu endpoint.
 *
 * PUL TUSHGANDA AVTOMATIK:
 *   1. Kutilayotgan (awaiting) bid topiladi → bid = paid
 *   2. Yangi profil bo'lsa (pending) → ACTIVE — reytingga chiqadi
 *   3. Top-up bo'lsa → totalBid increment — o'rin yangilanadi
 *   4. Verifikatsiya to'lovi bo'lsa → pending (hujjat kutmoqda)
 *   5. Admin Telegram guruhga xabar oladi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = String(body?.secret || "");
    const expected = process.env.INTERNAL_PAYMENT_SECRET || "topbid_internal_2026_x7k";

    if (secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = body?.payment || {};
    const externalId = p.id ? String(p.id) : null;
    const amount = Math.round(Number(p.amount) || 0);
    const cardLast4 = String(p.card_last4 || p.card || "").slice(-4);

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Noto'g'ri summa" }, { status: 400 });
    }

    // Dubl xabar tekshiruvi
    if (externalId) {
      const dup = await db.paymentLog.findFirst({ where: { externalId } });
      if (dup) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
    }

    // ===== 1. Kutilayotgan BID (o'rin to'lovi) =====
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
      // Bidni paid qilish + profilni active qilish + top-up bo'lsa increment
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

      // Profil hozirgi o'rinini olish
      const { getRankedProfiles } = await import("@/lib/ustar/server");
      const ranked = await getRankedProfiles();
      const pos = ranked.find((r) => r.id === bestBid!.profileId)?.position ?? "?";

      const log = await db.paymentLog.create({
        data: {
          externalId,
          amount,
          cardLast4,
          rawMessage: JSON.stringify(p).slice(0, 2000),
          matched: true,
          matchedProfileId: bestBid.profileId,
          matchedBidId: bestBid.id,
          processedAt: new Date(),
        },
      });
      void log;

      await notifyAdmin(
        "payment_auto",
        wasPending
          ? `✅ PUL TUSHDI — PROFIL REYTINGGA CHIQDI\n\n💳 ${formatSom(amount)} (****${cardLast4})\n👤 ${bestBid.profile.name}\n📍 ${pos}-o'rin\n🔗 ${bestBid.profile.contactUrl}\n\nPul HumoCardBot orqali avtomatik tasdiqlandi.`
          : `✅ PUL TUSHDI — O'RIN YANGILANDI\n\n💳 ${formatSom(amount)} (****${cardLast4})\n👤 ${bestBid.profile.name}\n📍 Yangi o'rin: ${pos}\n➕ Reyting summasi: +${formatSom(bestBid.credit)}\n\nPul avtomatik tasdiqlandi.`
      );
      return NextResponse.json({ ok: true, matched: true, activated: wasPending, profileName: bestBid.profile.name });
    }

    // ===== 2. Kutilayotgan VERIFIKATSIYA to'lovi =====
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
        db.verificationRequest.update({
          where: { id: bestVerify.id },
          data: { status: "pending" },
        }),
        db.profile.update({
          where: { id: bestVerify.profileId },
          data: { verifyStatus: "pending" },
        }),
      ]);

      await db.paymentLog.create({
        data: {
          externalId,
          amount,
          cardLast4,
          rawMessage: JSON.stringify(p).slice(0, 2000),
          matched: true,
          matchedProfileId: bestVerify.profileId,
          processedAt: new Date(),
        },
      });

      await notifyAdmin(
        "verify_paid",
        `✅ PUL TUSHDI — VERIFIKATSIYA TO'LOVI\n\n💳 ${formatSom(amount)} (****${cardLast4})\n👤 ${bestVerify.profile.name}\n🔗 ${bestVerify.profile.contactUrl}\n\nHujjatlarni so'rang: admin panelda Tasdiqlash/Rad etish tugmalari faol.`
      );
      return NextResponse.json({ ok: true, matched: true, verification: true, profileName: bestVerify.profile.name });
    }

    // ===== 3. Match topilmadi =====
    await db.paymentLog.create({
      data: {
        externalId,
        amount,
        cardLast4,
        rawMessage: JSON.stringify(p).slice(0, 2000),
        matched: false,
        processedAt: new Date(),
      },
    });

    await notifyAdmin(
      "payment_unmatched",
      `⚠️ PUL TUSHDI — MATCH TOPILMADI\n\n💳 ${formatSom(amount)} (****${cardLast4})\n\nKutilayotgan to'lov topilmadi. Admin panelda tekshirib, kerak bo'lsa qo'lda bajaring.`
    );
    return NextResponse.json({ ok: true, matched: false });
  } catch (e) {
    console.error("Internal payment xatosi:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/** GET — so'nggi to'lov xabarlari (admin kuzatuvi uchun) */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";
  if (password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const logs = await db.paymentLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ logs });
}
