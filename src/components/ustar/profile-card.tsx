"use client";

import { BadgeCheck, MapPin, Eye, MousePointerClick, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatSom, timeAgo } from "@/lib/ustar/constants";
import type { ProfileDTO, PriceOptionDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProfileCardProps {
  profile: ProfileDTO;
  /** Shu o'rinni olish narxi (auksion) */
  takePrice: number;
  highlighted?: boolean;
  onOpen: (id: string) => void;
  onTakeSpot: (position: number) => void;
}

/** Reyting kartochkasi — TOP-3 katta va ramkali, qolganlari ixcham */
export function ProfileCard({ profile, takePrice, highlighted, onOpen, onTakeSpot }: ProfileCardProps) {
  const isTop3 = profile.position <= 3;
  const isTop1 = profile.position === 1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative bg-white rounded-xl border transition-all cursor-pointer",
        isTop1 && "top-glow border-transparent bg-gradient-to-b from-[#fff9f2] to-white",
        isTop3 && !isTop1 && "border-[#e9b98a] border-2 top-soft",
        !isTop3 && "border-border hover:border-[#e0cdb4] hover:shadow-[0_4px_16px_-8px_rgba(36,28,20,0.15)]",
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
      aria-label={`${profile.position}-o'rin: ${profile.name}`}
    >
      {/* TOP badge */}
      {isTop3 && (
        <div
          className={cn(
            "absolute -top-2.5 left-4 md:left-6 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-sm",
            isTop1 ? "bg-[#d97b29] text-white" : "bg-[#fdeedd] text-[#b25e14] border border-[#f0d5b8]"
          )}
        >
          TOP {profile.position}
        </div>
      )}

      <div
        className={cn(
          "flex gap-3 md:gap-4",
          isTop3 ? "p-4 md:p-5 pt-4" : "p-3.5 md:p-4"
        )}
      >
        {/* O'rin raqami */}
        <div
          className={cn(
            "flex flex-col items-center justify-start shrink-0 select-none",
            isTop3 ? "w-12 md:w-14" : "w-9"
          )}
        >
          <span
            className={cn(
              "font-extrabold tabular-nums leading-none",
              isTop3 ? "text-3xl md:text-4xl text-[#d97b29]" : "text-xl text-[#c4b5a1]"
            )}
          >
            {profile.position}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider mt-1",
              isTop3 ? "text-[#d97b29]/70" : "text-[#c4b5a1]"
            )}
          >
            o'rin
          </span>
        </div>

        {/* Avatar */}
        <ProfileAvatar
          name={profile.name}
          imageUrl={profile.imageUrl}
          size={isTop3 ? 56 : 44}
          className={isTop3 ? "md:!w-[64px] md:!h-[64px] rounded-2xl" : "rounded-xl"}
        />

        {/* Asosiy ma'lumot */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 flex-wrap">
            <h3
              className={cn(
                "font-extrabold text-[#241c14] leading-tight",
                isTop3 ? "text-lg md:text-xl" : "text-[15px] md:text-base"
              )}
            >
              {profile.name}
            </h3>
            {profile.verified && (
              <span className="inline-flex items-center gap-0.5 text-[#1d7ed8] text-[11px] font-bold bg-[#e8f2fc] px-1.5 py-0.5 rounded-full shrink-0">
                <BadgeCheck className="w-3 h-3" />
                Tekshirilgan
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-[#6b5d4d] mt-1 leading-normal",
              isTop3 ? "text-sm md:text-[15px] line-clamp-2" : "text-[13px] line-clamp-1 md:line-clamp-2"
            )}
          >
            {profile.description}
          </p>

          {/* Chips: toifa / fan / shahar */}
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
          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-2 text-[11px] md:text-xs text-[#94836f] font-medium">
            {profile.reviewsCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <StarRating value={profile.avgRating} size={12} />
                <span className="font-bold text-[#574634]">{profile.avgRating}</span>
                <span>({profile.reviewsCount} sharh)</span>
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
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(profile.createdAt)}
            </span>
          </div>
        </div>

        {/* O'ng tomon: narx va amallar */}
        <div className="flex flex-col items-end justify-between gap-2 shrink-0 max-w-[130px] md:max-w-[170px]">
          <div className="text-right">
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
              Taklif
            </p>
            <p
              className={cn(
                "font-extrabold tabular-nums text-[#241c14] mt-1 leading-tight",
                isTop3 ? "text-base md:text-xl" : "text-sm md:text-base"
              )}
            >
              {formatSom(profile.totalBid)}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 md:h-9 text-[11px] md:text-xs font-bold rounded-lg border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] hover:border-[#f0d5b8] whitespace-nowrap",
              isTop3 && "bg-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTakeSpot(profile.position);
            }}
            aria-label={`${profile.position}-o'rinni olish — ${formatSom(takePrice)}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Bu o'rinni ol
            <span className="hidden md:inline text-[#d97b29]">{formatSom(takePrice)}</span>
          </Button>
        </div>
      </div>

      {/* Hover ko'rsatkichi */}
      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <ChevronRight className="w-4 h-4 text-[#c4b5a1]" />
      </div>
    </motion.article>
  );
}
