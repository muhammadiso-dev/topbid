import type { Pool } from "./constants";

export interface ReviewDTO {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type VerifyStatus = "none" | "pending" | "verified";

export interface ProfileDTO {
  id: string;
  name: string;
  description: string;
  city: string;
  contactUrl: string;
  imageUrl: string | null;
  pool: Pool;
  subType: string;
  categoryId: string;
  categoryName: string;
  categoryGroup: string;
  verifyStatus: VerifyStatus;
  totalBid: number;
  clicks: number;
  views: number;
  createdAt: string;
  lastBidAt: string;
  reviewsCount: number;
  avgRating: number;
  /** Butun pool ichidagi global o'rni (1-based) */
  position: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  pool: Pool;
  group: string;
}

export interface SiteStatsDTO {
  online: number;
  visits: number;
  revenue: number;
  profilesCount: number;
}

export interface AdminLogDTO {
  id: string;
  type: string;
  message: string;
  profileId: string | null;
  createdAt: string;
}

export interface VerificationRequestDTO {
  id: string;
  profileId: string;
  profileName: string;
  profileContact: string;
  pool: string;
  fee: number;
  status: "pending" | "approved" | "refunded";
  createdAt: string;
  reviewedAt: string | null;
}

export interface PriceOptionDTO {
  /** Maqsadli o'rin (1-based, global) */
  position: number;
  /** Reytingga yoziladigan to'liq summa */
  fullPrice: number;
  /** Haqiqiy to'lanadigan summa (aksiya bilan) */
  price: number;
  /** Aksiya davri yoki yo'q */
  promo: boolean;
  /** Shu o'rinning hozirgi egasi (bo'sh bo'lsa null) */
  holderName: string | null;
}

export interface CreateProfileResult {
  ok: true;
  mode: "created" | "topup";
  profile: ProfileDTO;
  position: number;
  amount: number;
  message: string;
}

export interface CreateProfilePayload {
  pool: Pool;
  subType: string;
  categoryId: string;
  name: string;
  city: string;
  description: string;
  contactUrl: string;
  imageUrl?: string;
  targetPosition: number;
  sessionId: string;
}
