import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankedProfiles, computeRevenue } from "@/lib/ustar/server";
import type { AdminLogDTO, VerificationRequestDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin?password=... — admin panel: bildirishnomalar, profillar,
 * verifikatsiya so'rovlari va daromad.
 */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "ustar2024";
  if (password !== expected) {
    return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
  }
  const [logs, profiles, verifications, revenue, paymentLogs] = await Promise.all([
    db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    getRankedProfiles(),
    db.verificationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { profile: { select: { name: true, contactUrl: true, pool: true } } },
    }),
    computeRevenue(),
    db.paymentLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const logsDto: AdminLogDTO[] = logs.map((l) => ({
    id: l.id,
    type: l.type,
    message: l.message,
    profileId: l.profileId,
    createdAt: l.createdAt.toISOString(),
  }));
  const verDto: VerificationRequestDTO[] = verifications.map((v) => ({
    id: v.id,
    profileId: v.profileId,
    profileName: v.profile?.name ?? "(o'chirilgan)",
    profileContact: v.profile?.contactUrl ?? "",
    pool: v.profile?.pool ?? "",
    fee: v.fee,
    status: v.status as VerificationRequestDTO["status"],
    createdAt: v.createdAt.toISOString(),
    reviewedAt: v.reviewedAt?.toISOString() ?? null,
  }));
  const payDto = paymentLogs.map((p) => ({
    id: p.id,
    amount: p.amount,
    cardLast4: p.cardLast4,
    matched: p.matched,
    createdAt: p.createdAt.toISOString(),
  }));
  return NextResponse.json({ logs: logsDto, profiles, verifications: verDto, revenue, paymentLogs: payDto });
}
