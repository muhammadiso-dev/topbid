import { db } from "@/lib/db";
import type { ProfileDTO, VerifyStatus } from "./types";
import type { Prisma } from "@prisma/client";

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: { category: true; reviews: { select: { rating: true } } };
}>;

/** Reyting tartibi (yagona, pool ixtiyoriy): totalBid kamayish bo'yicha, teng bo'lsa ilgari to'lov qilgan yuqorda */
export async function getRankedProfiles(pool?: string): Promise<ProfileDTO[]> {
  const where = pool ? { pool } : {};
  const profiles = await db.profile.findMany({
    where,
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: [{ totalBid: "desc" }, { lastBidAt: "asc" }, { createdAt: "asc" }],
  });
  return profiles.map((p, idx) => serializeProfile(p, idx + 1));
}

export function serializeProfile(p: ProfileWithRelations, position: number): ProfileDTO {
  const ratings = p.reviews.map((r) => r.rating);
  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    city: p.city,
    contactUrl: p.contactUrl,
    imageUrl: p.imageUrl ?? null,
    pool: p.pool as ProfileDTO["pool"],
    subType: p.subType,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    categoryGroup: p.category.groupName,
    verifyStatus: (p.verifyStatus as VerifyStatus) ?? "none",
    totalBid: p.totalBid,
    clicks: p.clicks,
    views: p.views,
    createdAt: p.createdAt.toISOString(),
    lastBidAt: p.lastBidAt.toISOString(),
    reviewsCount: ratings.length,
    avgRating: Math.round(avg * 10) / 10,
    position,
  };
}

/**
 * Jami haqiqiy daromad: to'langan bidlar + tasdiqlangan verifikatsiya to'lovlari.
 * (Aksiya davrida bidlar real to'langan summada yoziladi)
 */
export async function computeRevenue(): Promise<{
  bids: number;
  verification: number;
  total: number;
}> {
  const [bidAgg, verAgg] = await Promise.all([
    db.bid.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    db.verificationRequest.aggregate({
      where: { status: "approved" },
      _sum: { fee: true },
    }),
  ]);
  const bids = bidAgg._sum.amount ?? 0;
  const verification = verAgg._sum.fee ?? 0;
  return { bids, verification, total: bids + verification };
}
