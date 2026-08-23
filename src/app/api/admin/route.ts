import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeRevenue, serializeProfile } from "@/lib/ustar/server";
import type { AdminLogDTO, VerificationRequestDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin?password=... — admin panel: bildirishnomalar, profillar,
 * verifikatsiya so'rovlari va daromad.
 */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";
  if (password !== expected) {
    return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
  }
  // Admin BARCHA profillarni ko'radi (pending — pul kutilmoqda ham)
  const allProfiles = await db.profile.findMany({
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: [{ totalBid: "desc" }, { lastBidAt: "asc" }],
  });
  const rankedActive = allProfiles.filter((p) => p.status === "active");
  const profiles = rankedActive.map((p, i) =>
    serializeProfile(p, i + 1)
  );
  // Pending profillar alohida
  const pendingProfiles = allProfiles
    .filter((p) => p.status === "pending")
    .map((p) => serializeProfile(p, 0));

  const [logs, verifications, revenue, paymentLogs, awaitingBids, awaitingVerify] = await Promise.all([
    db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.verificationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { profile: { select: { name: true, contactUrl: true, pool: true } } },
    }),
    computeRevenue(),
    db.paymentLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.bid.findMany({
      where: { status: "awaiting" },
      include: { profile: { select: { id: true, name: true, contactUrl: true, city: true, status: true } } },
      orderBy: { createdAt: "asc" },
      take: 50,
    }),
    db.verificationRequest.findMany({
      where: { status: "awaiting" },
      include: { profile: { select: { id: true, name: true, contactUrl: true } } },
      orderBy: { createdAt: "asc" },
      take: 50,
    }),
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
  const awaitingBidsDto = awaitingBids.map((b) => ({
    id: b.id,
    amount: b.amount,
    credit: b.credit,
    createdAt: b.createdAt.toISOString(),
    profileId: b.profileId,
    profileName: b.profile.name,
    profileContact: b.profile.contactUrl,
    profileCity: b.profile.city,
    profileStatus: b.profile.status,
  }));
  const awaitingVerifyDto = awaitingVerify.map((v) => ({
    id: v.id,
    fee: v.fee,
    createdAt: v.createdAt.toISOString(),
    profileId: v.profileId,
    profileName: v.profile.name,
    profileContact: v.profile.contactUrl,
  }));
  return NextResponse.json({ logs: logsDto, profiles, pendingProfiles, verifications: verDto, revenue, paymentLogs: payDto, awaitingBids: awaitingBidsDto, awaitingVerifications: awaitingVerifyDto });
}
