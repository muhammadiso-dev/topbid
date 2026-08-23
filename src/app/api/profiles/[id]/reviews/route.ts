import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/[id]/reviews — bepul sharh qoldirish.
 * Rate-limit: bir sessiya bir profilga bir marta yozadi (unikal indeks).
 * Body: { sessionId, authorName, rating (1..5), comment }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const sessionId = String(body?.sessionId || "");
    const authorName = String(body?.authorName || "").trim();
    const rating = Math.floor(Number(body?.rating));
    const comment = String(body?.comment || "").trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Sessiya topilmadi" }, { status: 400 });
    }
    if (authorName.length < 2 || authorName.length > 40) {
      return NextResponse.json({ error: "Ismingiz 2-40 belgidan iborat bo'lsin" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Baho 1 dan 5 gacha bo'lishi kerak" }, { status: 400 });
    }
    if (comment.length < 3 || comment.length > 500) {
      return NextResponse.json({ error: "Sharh 3-500 belgidan iborat bo'lsin" }, { status: 400 });
    }

    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }

    const existing = await db.review.findUnique({
      where: { profileId_sessionId: { profileId: id, sessionId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Siz bu profilga allaqachon sharh yozgansiz" },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: { profileId: id, sessionId, authorName, rating, comment },
    });

    await notifyAdmin(
      "review",
      `⭐ Yangi sharh: ${profile.name} — ${rating}/5 (${authorName})`,
      id
    );

    return NextResponse.json({ ok: true, review });
  } catch (e) {
    console.error("Sharh qo'shishda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
