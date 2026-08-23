import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchPayment } from "@/lib/ustar/payment-match";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/internal — ichki to'lov webhook (masalan, kelajakda bank API).
 * Bot webhook'ining o'zi ham xuddi shu matchPayment logikasini ishlatadi.
 * Body: { secret, payment: { amount, card_last4?, id? } }
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
    const amount = Math.round(Number(p.amount) || 0);
    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Noto'g'ri summa" }, { status: 400 });
    }

    const result = await matchPayment({
      amount,
      cardLast4: String(p.card_last4 || p.card || ""),
      externalId: p.id ? String(p.id) : null,
      raw: JSON.stringify(p),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("Internal payment xatosi:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/** GET — so'nggi to'lov xabarlari (admin kuzatuvi uchun) */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";
  if (password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const logs = await db.paymentLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ logs });
}
