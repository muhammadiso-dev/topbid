import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { formatSom } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/verify — verifikatsiya so'rovini tasdiqlash yoki rad etish.
 * Body: { requestId: string, decision: "approve" | "reject", adminPassword: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = String(body?.requestId || "");
    const decision = body?.decision === "approve" ? "approve" : "reject";
    const adminPassword = String(body?.adminPassword || "");
    const expected = process.env.ADMIN_PASSWORD || "ustar2024";
    if (adminPassword !== expected) {
      return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
    }

    const request = await db.verificationRequest.findUnique({
      where: { id: requestId },
      include: { profile: true },
    });
    if (!request || request.status !== "pending") {
      return NextResponse.json({ error: "So'rov topilmadi yoki allaqachon ko'rib chiqilgan" }, { status: 404 });
    }
    if (!request.profile) {
      return NextResponse.json({ error: "Profil o'chirilgan" }, { status: 404 });
    }

    if (decision === "approve") {
      await db.$transaction([
        db.verificationRequest.update({
          where: { id: requestId },
          data: { status: "approved", reviewedAt: new Date() },
        }),
        db.profile.update({
          where: { id: request.profileId },
          data: { verifyStatus: "verified" },
        }),
      ]);
      await notifyAdmin(
        "verify_approved",
        `✅ Verifikatsiya tasdiqlandi: ${request.profile.name}\nProfilga ko'k "Tekshirilgan" belgisi berildi.`,
        request.profileId
      );
      return NextResponse.json({ ok: true, status: "approved" });
    } else {
      await db.$transaction([
        db.verificationRequest.update({
          where: { id: requestId },
          data: { status: "refunded", reviewedAt: new Date() },
        }),
        db.profile.update({
          where: { id: request.profileId },
          data: { verifyStatus: "none" },
        }),
      ]);
      await notifyAdmin(
        "verify_rejected",
        `❌ Verifikatsiya rad etildi: ${request.profile.name}\nTo'lov qaytarildi: ${formatSom(request.fee)}`,
        request.profileId
      );
      return NextResponse.json({ ok: true, status: "refunded" });
    }
  } catch (e) {
    console.error("Verifikatsiya qarorida xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
