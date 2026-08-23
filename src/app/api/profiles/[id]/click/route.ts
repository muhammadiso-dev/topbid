import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deviceFromUA, geoFromIp, ipFromHeaders, referrerHost } from "@/lib/ustar/geo";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/[id]/click — profil ko'rilgan yoki kontakt havolasiga bosilgan.
 * Body: { type: "view" | "click", sessionId: string }
 * Analytics: geo (IP), qurilma (UA), referrer saqlanadi.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const type = body?.type === "click" ? "click" : "view";
    const sessionId = String(body?.sessionId || "");

    const profile = await db.profile.findUnique({ where: { id }, select: { id: true } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }

    // Analytics ma'lumotlari (parallel, sekin bo'lsa ham kutmaymiz)
    const [geo] = await Promise.all([geoFromIp(ipFromHeaders(req.headers))]);
    const device = deviceFromUA(req.headers.get("user-agent") || "");
    const referrer = referrerHost(req.headers.get("referer"));

    await db.$transaction([
      db.profile.update({
        where: { id },
        data: type === "click" ? { clicks: { increment: 1 } } : { views: { increment: 1 } },
      }),
      db.profileView.create({
        data: {
          profileId: id,
          sessionId: sessionId || "anon",
          type,
          city: geo.city,
          country: geo.country,
          device,
          referrer,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Click tracking xatosi:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
