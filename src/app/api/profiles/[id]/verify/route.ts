import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";
import { VERIFICATION_FEE, payableAmount } from "@/lib/ustar/pricing";
import { getPromoConfig } from "@/lib/ustar/promo-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/[id]/verify — "Tekshirilgan" belgisi uchun to'lov va so'rov.
 * To'lov Telegram botda amalga oshirilgan deb hisoblanadi (demo),
 * real integratsiyada webhook tasdiqlaydi.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const editToken = String(body?.editToken || "");
    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }
    if (profile.verifyStatus === "verified") {
      return NextResponse.json({ error: "Profil allaqachon tekshirilgan" }, { status: 409 });
    }
    // Verifikatsiya faqat profil egasi uchun — editToken majburiy
    if (!profile.editToken || profile.editToken !== editToken) {
      return NextResponse.json(
        { error: "Avval profil egaligini tasdiqlang (claim)" },
        { status: 403 }
      );
    }

    const pending = await db.verificationRequest.findFirst({
      where: { profileId: id, status: "pending" },
    });
    if (pending) {
      return NextResponse.json(
        { error: "Verifikatsiya so'rovi allaqachon ko'rib chiqilmoqda" },
        { status: 409 }
      );
    }

    const promo = await getPromoConfig();
    const fee = payableAmount(VERIFICATION_FEE, promo.active, promo.percent);

    // AWAITING: pul tushishi bilan (StarKerak) "pending" (hujjat kutilmoqda) ga o'tadi
    const request = await db.verificationRequest.create({
      data: { profileId: id, fee, status: "awaiting" },
    });
    await db.profile.update({ where: { id }, data: { verifyStatus: "awaiting" } });

    await notifyAdmin(
      "verification",
      `⏳ Verifikatsiya to'lovi KUTILMOQDA: ${profile.name}\nSumma: ${formatSom(fee)}${promo.active ? ` (aksiya -${Math.round(promo.percent*100)}%)` : ""}\nKontakt: ${profile.contactUrl}\nPul tushishi bilan hujjatlar so'raladi.`,
      id
    );

    return NextResponse.json({
      ok: true,
      requestId: request.id,
      fee,
      message: "To'lov kutilmoqda! Kartaga o'tkazing — pul tushishi bilan verifikatsiya jarayoni boshlanadi.",
    });
  } catch (e) {
    console.error("Verifikatsiya so'rovida xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
