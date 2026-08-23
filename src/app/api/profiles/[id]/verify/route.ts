import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { payableAmount, promoInfo } from "@/lib/ustar/pricing";
import { VERIFICATION_FEE, formatSom } from "@/lib/ustar/constants";

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

    const promo = promoInfo();
    const fee = payableAmount(VERIFICATION_FEE, promo.active);

    const request = await db.verificationRequest.create({
      data: { profileId: id, fee, status: "pending" },
    });
    await db.profile.update({ where: { id }, data: { verifyStatus: "pending" } });

    await notifyAdmin(
      "verification",
      `🛡️ Verifikatsiya so'rovi: ${profile.name}\nTo'lov: ${formatSom(fee)}${promo.active ? " (aksiya -50%)" : ""}\nKontakt: ${profile.contactUrl}\nHujjatlarni tekshirib, panelda tasdiqlang yoki rad eting.`,
      id
    );

    return NextResponse.json({
      ok: true,
      requestId: request.id,
      fee,
      message: "So'rovingiz yuborildi! Admin 24 soat ichida ko'rib chiqadi.",
    });
  } catch (e) {
    console.error("Verifikatsiya so'rovida xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
