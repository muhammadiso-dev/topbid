import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/internal — StarKerak listener'dan kelgan REAL to'lov xabarlari.
 * HumoCardBot → StarKerak (WebSocket) → bu listener → shu endpoint.
 *
 * Body: { secret, payment: { id, amount, card_last4, ... } }
 * Match: so'nggi 45 daqiqada yaratilgan, hali match bo'lmagan BID bilan
 * summa bo'yicha (±500 so'm tolerans) moslashtiriladi.
 * Natija admin Telegram guruhiga avtomatik xabar qilinadi.
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

    // Match: so'nggi 45 daqiqada yaratilgan, match bo'lmagan bid
    const since = new Date(Date.now() - 45 * 60_000);
    // Match bo'lmagan bidlar: PaymentLog'da matchedBidId sifatida qayd etilmaganlar
    const matchedIds = await db.paymentLog.findMany({
      where: { matchedBidId: { not: null } },
      select: { matchedBidId: true },
    });
    const excluded = matchedIds.map((m) => m.matchedBidId).filter(Boolean) as string[];
    const candidates = await db.bid.findMany({
      where: {
        status: "paid",
        createdAt: { gte: since },
        id: { notIn: excluded },
      },
      include: { profile: { select: { name: true, contactUrl: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Eng yaqin summa (tolerans ±500)
    let best: (typeof candidates)[number] | null = null;
    let bestDiff = Infinity;
    for (const c of candidates) {
      const diff = Math.abs(c.amount - amount);
      if (diff <= 500 && diff < bestDiff) {
        best = c;
        bestDiff = diff;
      }
    }

    // Yozuvni saqlash
    const log = await db.paymentLog.create({
      data: {
        externalId,
        amount,
        cardLast4,
        rawMessage: JSON.stringify(p).slice(0, 2000),
        matched: !!best,
        matchedProfileId: best?.profileId ?? null,
        matchedBidId: best?.id ?? null,
        processedAt: new Date(),
      },
    });

    if (best) {
      await notifyAdmin(
        "payment_auto",
        `✅ AVTOMATIK TO'OV TASDIQLANDI\n\n💳 Summa: ${formatSom(amount)} (karta: ****${cardLast4})\n👤 Profil: ${best.profile.name}\n🔗 ${best.profile.contactUrl}\n\nTo'lov HumoCardBot orqali avtomatik match qilindi.`
      );
      return NextResponse.json({ ok: true, matched: true, profileName: best.profile.name });
    }

    // Match topilmadi — admin ogohlantiriladi
    await notifyAdmin(
      "payment_unmatched",
      `⚠️ TUSHGAN TO'LOV — MATCH TOPILMADI\n\n💳 Summa: ${formatSom(amount)} (karta: ****${cardLast4})\n\nSo'nggi 45 daqiqada mos keladigan kutilayotgan to'lov topilmadi. Tekshirib, kerak bo'lsa qo'lda qarang.`
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
  const expected = process.env.ADMIN_PASSWORD || "ustar2024";
  if (password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const logs = await db.paymentLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ logs });
}
