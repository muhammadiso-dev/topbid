"use client";

import {
  BadgeCheck,
  Clock3,
  MapPin,
  Eye,
  MousePointerClick,
  Globe,
  TrendingUp,
  Star,
} from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatSom, timeAgo } from "@/lib/ustar/constants";
import type { ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProfileCardProps {
  profile: ProfileDTO;
  /** Ko'rsatilayotgan (lokal — filtrlangan) o'rin */
  displayPosition: number;
  /** Butun pool ichidagi global o'rin */
  globalPosition: number;
  /** Filtrlar faolmi (lokal/global farqi ko'rinadi) */
  filtersActive: boolean;
  /** CTA narx matni: "95 000 so'm" yoki "dan 57 500 so'm" */
  priceLabel: string;
  /** Aksiya faolmi (-50% belgisi uchun) */
  promoActive: boolean;
  highlighted?: boolean;
  onOpen: (id: string) => void;
  onTakeSpot: (globalPosition: number) => void;
}

/** Reyting kartochkasi — mobil: bir ustunli stacked, desktop: 4 ustunli */
export function ProfileCard({
  profile,
  displayPosition,
  globalPosition,
  filtersActive,
  priceLabel,
  promoActive,
  highlighted,
  onOpen,
  onTakeSpot,
}: ProfileCardProps) {
  const isTop3 = displayPosition <= 3;
  const isTop1 = displayPosition === 1;
  const showGlobalChip = filtersActive;

  const verifyBadge =
    profile.verifyStatus === "verified" ? (
      <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-[#1d7ed8] bg-[#e8f2fc] px-1.5 py-0.5 rounded-full shrink-0">
        <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
        Tekshirilgan
      </span>
    ) : profile.verifyStatus === "pending" ? (
      <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-[#a86a00] bg-[#fff4d6] px-1.5 py-0.5 rounded-full shrink-0">
        <Clock3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
        Tekshirilmoqda
      </span>
    ) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative bg-white rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5",
        isTop1 &&
          "top-glow border-transparent bg-gradient-to-b from-[#fff9f2] to-white hover:shadow-[0_12px_32px_-10px_rgba(217,123,41,0.4)]",
        isTop3 &&
          !isTop1 &&
          "border-2 border-[#e9b98a] top-soft hover:shadow-[0_10px_28px_-10px_rgba(217,123,41,0.35)]",
        !isTop3 &&
          "border-border hover:border-[#e0cdb4] hover:shadow-[0_6px_20px_-10px_rgba(36,28,20,0.2)]",
        highlighted && "ring-2 ring-[#d97b29] ring-offset-2 ring-offset-[#fffdfa]"
      )}
      onClick={() => onOpen(profile.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(profile.id);
        }
      }}
      aria-label={`${displayPosition}-o'rin: ${profile.name}`}
    >
      {/* TOP badge */}
      {isTop3 && (
        <div
          className={cn(
            "absolute -top-2.5 left-4 md:left-6 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-sm z-10",
            isTop1 ? "bg-[#d97b29] text-white" : "bg-[#fdeedd] text-[#b25e14] border border-[#f0d5b8]"
          )}
        >
          TOP {displayPosition}
        </div>
      )}

      <div className={cn("pt-4 md:pt-5", isTop3 ? "px-4 pb-4 md:px-5 md:pb-5" : "px-3.5 pb-3.5 md:p-4")}>
        {/* ==================== DESKTOP (md+) ==================== */}
        <div className="hidden md:flex gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center justify-start w-14 shrink-0 select-none">
            <span
              className={cn(
                "font-extrabold tabular-nums leading-none text-4xl",
                isTop3 ? "text-[#d97b29]" : "text-[#c4b5a1]"
              )}
            >
              {displayPosition}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider mt-1",
                isTop3 ? "text-[#d97b29]/70" : "text-[#c4b5a1]"
              )}
            >
              o'rin
            </span>
            {showGlobalChip && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#94836f] bg-[#f6efe6] px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3" />
                Global {globalPosition}
              </span>
            )}
          </div>

          <ProfileAvatar
            name={profile.name}
            imageUrl={profile.imageUrl}
            size={64}
            className="rounded-2xl"
          />

          {/* Ma'lumot */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 flex-wrap">
              <h3
                className={cn(
                  "font-extrabold text-[#241c14] leading-tight",
                  isTop3 ? "text-xl" : "text-base"
                )}
              >
                {profile.name}
              </h3>
              {verifyBadge}
            </div>

            <p
              className={cn(
                "text-[#6b5d4d] mt-1 leading-normal",
                isTop3 ? "text-[15px] line-clamp-2" : "text-sm line-clamp-2"
              )}
            >
              {profile.description}
            </p>

            {/* Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] font-bold text-[#b25e14] bg-[#fdeedd] px-2 py-0.5 rounded-full">
                {profile.categoryName}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#574634] bg-[#f6efe6] px-2 py-0.5 rounded-full">
                <MapPin className="w-3 h-3" />
                {profile.city}
              </span>
              {profile.pool === "education" && (
                <span className="text-[11px] font-semibold text-[#574634] bg-[#f6efe6] px-2 py-0.5 rounded-full">
                  {profile.subType === "center" ? "Markaz" : "Repetitor"}
                </span>
              )}
            </div>

            {/* Statistika */}
            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-2 text-xs text-[#94836f] font-medium">
              {profile.reviewsCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <StarRating value={profile.avgRating} size={12} />
                  <span className="font-bold text-[#574634]">{profile.avgRating}</span>
                  <span>({profile.reviewsCount})</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatCompactNumber(profile.views)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                {formatCompactNumber(profile.clicks)}
              </span>
              <span className="inline-flex items-center gap-1">
                {timeAgo(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Narx + CTA */}
          <div className="flex flex-col items-end justify-between gap-2 shrink-0 max-w-[190px]">
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
                Reyting summasi
              </p>
              <p
                className={cn(
                  "font-extrabold tabular-nums text-[#241c14] mt-1 leading-tight",
                  isTop3 ? "text-xl" : "text-base"
                )}
              >
                {formatSom(profile.totalBid)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 text-xs font-extrabold rounded-lg border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] hover:border-[#f0d5b8] whitespace-nowrap",
                isTop3 && "bg-white"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTakeSpot(globalPosition);
              }}
              aria-label={`${globalPosition}-o'rinni egallash — ${priceLabel}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              O'rinni egallash
              <span className="text-[#d97b29]">{priceLabel}</span>
            </Button>
          </div>
        </div>

        {/* ==================== MOBIL (<md) ==================== */}
        <div className="md:hidden">
          {/* 1-qator: avatar + nom + rank */}
          <div className="flex items-start gap-3">
            <ProfileAvatar name={profile.name} imageUrl={profile.imageUrl} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    "font-extrabold text-[#241c14] leading-tight min-w-0",
                    isTop3 ? "text-base" : "text-[15px]"
                  )}
                >
                  {profile.name}
                </h3>
                <div className="flex flex-col items-end shrink-0 -mt-0.5">
                  <span
                    className={cn(
                      "font-extrabold tabular-nums leading-none",
                      isTop3 ? "text-2xl text-[#d97b29]" : "text-xl text-[#c4b5a1]"
                    )}
                  >
                    {displayPosition}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4b5a1] mt-0.5">
                    o'rin
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                {verifyBadge}
                {showGlobalChip && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#94836f] bg-[#f6efe6] px-1.5 py-0.5 rounded-full">
                    <Globe className="w-2.5 h-2.5" />
                    Global {globalPosition}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2-qator: tavsif */}
          <p className="text-[13px] text-[#6b5d4d] mt-2 leading-normal line-clamp-2">
            {profile.description}
          </p>

          {/* 3-qator: chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[10px] font-bold text-[#b25e14] bg-[#fdeedd] px-2 py-0.5 rounded-full max-w-[55%] truncate">
              {profile.categoryName}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#574634] bg-[#f6efe6] px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5" />
              {profile.city}
            </span>
            {profile.pool === "education" && (
              <span className="text-[10px] font-semibold text-[#574634] bg-[#f6efe6] px-2 py-0.5 rounded-full">
                {profile.subType === "center" ? "Markaz" : "Repetitor"}
              </span>
            )}
          </div>

          {/* 4-qator: statistika */}
          <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap mt-2 text-[11px] text-[#94836f] font-medium">
            {profile.reviewsCount > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-[#d97b29] text-[#d97b29]" />
                <span className="font-bold text-[#574634]">{profile.avgRating}</span>
                <span>({profile.reviewsCount})</span>
              </span>
            )}
            <span className="inline-flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {formatCompactNumber(profile.views)}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <MousePointerClick className="w-3 h-3" />
              {formatCompactNumber(profile.clicks)}
            </span>
            <span>{timeAgo(profile.createdAt)}</span>
            <span className="inline-flex items-center gap-1 ml-auto">
              <span className="font-extrabold text-[#241c14] tabular-nums">
                {formatSom(profile.totalBid)}
              </span>
            </span>
          </div>

          {/* 5-qator: CTA */}
          <Button
            variant="outline"
            className="mt-3 w-full h-11 rounded-lg border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] hover:border-[#f0d5b8] font-extrabold text-[13px]"
            onClick={(e) => {
              e.stopPropagation();
              onTakeSpot(globalPosition);
            }}
            aria-label={`${globalPosition}-o'rinni egallash — ${priceLabel}`}
          >
            <TrendingUp className="w-4 h-4" />
            O'rinni egallash
            <span className="text-[#d97b29]">{priceLabel}</span>
            {promoActive && (
              <span className="text-[9px] font-extrabold bg-[#d97b29] text-white px-1.5 py-0.5 rounded-full">
                -50%
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
