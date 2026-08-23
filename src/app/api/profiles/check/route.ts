import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeContactUrl } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/profiles/check?contact=@username
 * Kontakt allaqachon ro'yxatda bor-yo'qligini tekshirish (forma uchun).
 */
export async function GET(req: NextRequest) {
  const contact = req.nextUrl.searchParams.get("contact") || "";
  if (!contact.trim()) {
    return NextResponse.json({ exists: false });
  }
  const normalized = normalizeContactUrl(contact);
  const profile = await db.profile.findFirst({
    where: { contactUrl: normalized },
    select: { id: true, name: true, totalBid: true },
  });
  if (!profile) {
    return NextResponse.json({ exists: false });
  }
  return NextResponse.json({
    exists: true,
    profile: {
      id: profile.id,
      name: profile.name,
      totalBid: profile.totalBid,
    },
  });
}
