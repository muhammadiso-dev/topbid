import type { Pool } from "./constants";

export interface ReviewDTO {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  verified: boolean;
  totalBid: number;
  clicks: number;
  views: number;
  createdAt: string;
  lastBidAt: string;
  reviewsCount: number;
  avgRating: number;
  /** Butun pool ichidagi o'rni (1-based) */
  position: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  pool: Pool;
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

export interface PriceOptionDTO {
  /** Maqsadli o'rin (1-based) */
  position: number;
  /** Shu o'rinni olish uchun to'lanadigan summa */
  price: number;
  label: string;
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
  /** Maqsadli o'rin (1-based) */
  targetPosition: number;
  sessionId: string;
}
