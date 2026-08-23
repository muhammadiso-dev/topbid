import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/settings — aksiya holati (public) */
export async function GET() {
  const s = await db.appSettings.findUnique({ where: { id: "main" } });
  const now = Date.now();
  const active = s ? s.promoActive && s.promoEndsAt.getTime() > now : false;
  return NextResponse.json({
    promo: {
      active,
      endsAt: s?.promoEndsAt?.toISOString() ?? null,
      percent: s?.promoPercent ?? 0.5,
    },
  });
}

/**
 * PUT /api/settings — aksiyani boshqarish (admin).
 * Body: { adminPassword, promoActive?, promoEndsAt? (ISO), promoPercent? (0..0.9) }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";
    if (String(body?.adminPassword || "") !== expected) {
      return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body?.promoActive === "boolean") data.promoActive = body.promoActive;
    if (body?.promoEndsAt) {
      const d = new Date(body.promoEndsAt);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Sana noto'g'ri" }, { status: 400 });
      }
      data.promoEndsAt = d;
    }
    if (typeof body?.promoPercent === "number") {
      if (body.promoPercent < 0 || body.promoPercent > 0.9) {
        return NextResponse.json({ error: "Foiz 0 dan 90% gacha bo'lishi kerak" }, { status: 400 });
      }
      data.promoPercent = body.promoPercent;
    }

    const s = await db.appSettings.upsert({
      where: { id: "main" },
      update: data,
      create: {
        id: "main",
        promoActive: (data.promoActive as boolean) ?? true,
        promoEndsAt: (data.promoEndsAt as Date) ?? new Date(Date.now() + 14 * 86_400_000),
        promoPercent: (data.promoPercent as number) ?? 0.5,
      },
    });

    return NextResponse.json({ ok: true, settings: s });
  } catch (e) {
    console.error("Settings xatosi:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
