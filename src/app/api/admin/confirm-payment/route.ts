import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/confirm-payment — admin qo'lda "pul tushdi" tasdiqlaydi.
 * Body: { adminPassword, type: "bid" | "verification", id }
 *   type=bid: awaiting bid → paid; pending profil → ACTIVE (reytingga chiqadi);
 *             mavjud profil → totalBid increment (o'rin yangilanadi)
 *   type=verification: awaiting → pending (hujjat kutilmoqda, verifyStatus=pending)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";
    if (String(body?.adminPassword || "") !== expected) {
      return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
    }

    const type = body?.type === "verification" ? "verification" : "bid";
    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ error: "ID kerak" }, { status: 400 });
    }

    if (type === "bid") {
      const bid = await db.bid.findUnique({
        where: { id },
        include: { profile: { select: { id: true, name: true, contactUrl: true, status: true } } },
      });
      if (!bid) {
        return NextResponse.json({ error: "Bid topilmadi" }, { status: 404 });
      }
      if (bid.status !== "awaiting") {
        return NextResponse.json({ error: "Bu bid allaqachon tasdiqlangan" }, { status: 400 });
      }

      const wasPending = bid.profile.status === "pending";
      await db.$transaction([
        db.bid.update({ where: { id }, data: { status: "paid" } }),
        db.profile.update({
          where: { id: bid.profileId },
          data: {
            status: "active",
            lastBidAt: new Date(),
            ...(wasPending ? {} : { totalBid: { increment: bid.credit } }),
          },
        }),
        db.paymentLog.create({
          data: {
            amount: bid.amount,
            cardLast4: "",
            rawMessage: "Admin qo'lda tasdiqladi",
            matched: true,
            matchedProfileId: bid.profileId,
            matchedBidId: bid.id,
            processedAt: new Date(),
          },
        }),
      ]);

      const { getRankedProfiles } = await import("@/lib/ustar/server");
      const ranked = await getRankedProfiles();
      const pos = ranked.find((r) => r.id === bid.profileId)?.position ?? "?";

      await notifyAdmin(
        "payment_manual",
        `✅ ADMIN TASDIQLADI — ${wasPending ? "PROFIL REYTINGGA CHIQDI" : "O'RIN YANGILANDI"}\n\n💳 ${formatSom(bid.amount)}\n👤 ${bid.profile.name}\n📍 ${pos}-o'rin\n🔗 ${bid.profile.contactUrl}`
      );

      return NextResponse.json({ ok: true, activated: wasPending, position: pos });
    }

    // Verifikatsiya
    const vr = await db.verificationRequest.findUnique({
      where: { id },
      include: { profile: { select: { id: true, name: true, contactUrl: true } } },
    });
    if (!vr) {
      return NextResponse.json({ error: "So'rov topilmadi" }, { status: 404 });
    }
    if (vr.status !== "awaiting") {
      return NextResponse.json({ error: "Bu so'rov allaqachon tasdiqlangan" }, { status: 400 });
    }

    await db.$transaction([
      db.verificationRequest.update({ where: { id }, data: { status: "pending" } }),
      db.profile.update({ where: { id: vr.profileId }, data: { verifyStatus: "pending" } }),
      db.paymentLog.create({
        data: {
          amount: vr.fee,
          cardLast4: "",
          rawMessage: "Admin qo'lda tasdiqladi (verifikatsiya)",
          matched: true,
          matchedProfileId: vr.profileId,
          processedAt: new Date(),
        },
      }),
    ]);

    await notifyAdmin(
      "verify_manual",
      `✅ ADMIN TASDIQLADI — VERIFIKATSIYA TO'LOVI\n\n💳 ${formatSom(vr.fee)}\n👤 ${vr.profile.name}\n🔗 ${vr.profile.contactUrl}\n\nEndi hujjatlar so'raladi — Tasdiqlash tugmasi faol.`
    );

    return NextResponse.json({ ok: true, verification: true });
  } catch (e) {
    console.error("Confirm payment xatosi:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
