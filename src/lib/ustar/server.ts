import { db } from "@/lib/db";
import type { ProfileDTO } from "./types";
import { BID_INCREMENT, MIN_BID } from "./constants";
import type { Prisma } from "@prisma/client";

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: { category: true; reviews: { select: { rating: true } } };
}>;

/** Reyting tartibi: totalBid kamayish bo'yicha, teng bo'lsa ilgari to'lov qilgan yuqorida */
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
    verified: p.verified,
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
 * Maqsadli o'rinni olish uchun kerakli summani hisoblash (server tomonida).
 * P-o'rinni olish uchun hozirgi P-o'rin egasidan BID_INCREMENT ga ko'p to'lash kerak.
 */
export function computePriceForPosition(
  ranked: ProfileDTO[],
  targetPosition: number
): number {
  const holder = ranked[targetPosition - 1];
  if (!holder) return MIN_BID; // ro'yxat oxiriga qo'shish — minimal narx
  return Math.max(holder.totalBid + BID_INCREMENT, MIN_BID);
}

/** Jami daromad: faqat to'langan (qaytarilmagan) bidlar yig'indisi */
export async function computeRevenue(): Promise<number> {
  const agg = await db.bid.aggregate({
    where: { status: "paid" },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}
