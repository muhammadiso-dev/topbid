import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/[id]/click — profil ko'rilgan yoki kontakt havolasiga bosilgan.
 * Body: { type: "view" | "click" }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const type = body?.type === "click" ? "click" : "view";

    const profile = await db.profile.findUnique({ where: { id }, select: { id: true } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }

    await db.profile.update({
      where: { id },
      data: type === "click" ? { clicks: { increment: 1 } } : { views: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
