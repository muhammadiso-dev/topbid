"use client";

import { MapPin, Eye, MousePointerClick, Globe, TrendingUp, Star, ExternalLink, MessageCircle, Flame } from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";
import { StarRating } from "./star-rating";
import { VerifyBadge } from "./verify-badge";
import { Button } from "@/components/ui/button";
import { contactInfo, formatCompactNumber, formatSom, timeAgo } from "@/lib/ustar/constants";
import type { ProfileDTO } from "@/lib/ustar/types";
import { useI18n } from "@/lib/ustar/i18n";
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
  /** CTA narx matni */
  priceLabel: string;
  /** Aksiya faolmi (-50% belgisi uchun) */
  promoActive: boolean;
  highlighted?: boolean;
  onOpenDetail: (id: string) => void;
  onTakeSpot: (globalPosition: number) => void;
}

/** Reyting kartochkasi — bosilganda to'g'ridan-to'g'ri profil saytga o'tadi */
export function ProfileCard({
  profile,
  displayPosition,
  globalPosition,
  filtersActive,
  priceLabel,
  promoActive,
  highlighted,
  onOpenDetail,
  onTakeSpot,
}: ProfileCardProps) {
  const { t, lang } = useI18n();
  const isTop3 = displayPosition <= 3;
  const isTop1 = displayPosition === 1;
  const showGlobalChip = filtersActive;
  const contact = contactInfo(profile.contactUrl);

  /** Karta bosilganda — to'g'ridan-to'g'ri tashqi sayt + klik hisoblash */
  const visit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(contact.href, "_blank", "noopener,noreferrer");
    fetch(`/api/profiles/${profile.id}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click" }),
    }).catch(() => null);
  };

  const badge = (
    <VerifyBadge status={profile.verifyStatus} size={14} withLabel={false} className="!p-0 !bg-transparent" />
  );

  const reviewsBtn = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpenDetail(profile.id);
      }}
      className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-[#d97b29] hover:underline cursor-pointer"
      aria-label={`${profile.name} — ${t("reviews.title")} (${profile.reviewsCount})`}
      title={t("reviews.leave")}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {profile.reviewsCount > 0 ? `${profile.reviewsCount} ${t("card.reviews")}` : t("reviews.leave")}
    </button>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative bg-white dark:bg-[#201a14] rounded-2xl border transition-all cursor-pointer hover:-translate-y-1",
        isTop1 &&
          "top-glow border-transparent bg-gradient-to-br from-[#fff8ef] via-white to-[#fffdf8] hover:shadow-[0_16px_40px_-12px_rgba(217,123,41,0.45)]",
        isTop3 &&
          !isTop1 &&
          "border-2 border-[#e9b98a] top-soft bg-gradient-to-b from-[#fffcf7] to-white hover:shadow-[0_12px_32px_-10px_rgba(217,123,41,0.4)]",
        !isTop3 && "border-border hover:border-[#e0cdb4] hover:shadow-[0_8px_24px_-10px_rgba(36,28,20,0.25)]",
        highlighted && "ring-2 ring-[#d97b29] ring-offset-2 ring-offset-[#fffdfa]"
      )}
      onClick={visit}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(contact.href, "_blank", "noopener,noreferrer");
        }
      }}
      aria-label={`${displayPosition}-o'rin: ${profile.name} — ${t("card.visit")}`}
    >
      {/* TOP badge — yuqori o'ng burchak ichkarida */}
      {isTop3 && (
        <div
          className={cn(
            "absolute top-3 right-3 md:top-4 md:right-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-extrabold tracking-wide uppercase shadow-sm",
            isTop1
              ? "bg-gradient-to-r from-[#d97b29] to-[#e8944a] text-white"
              : "bg-[#fdeedd] dark:bg-[#3a2c1c] text-[#b25e14] border border-[#f0d5b8]"
          )}
        >
          {isTop1 && <Flame className="w-3 h-3" />}
          TOP {displayPosition}
        </div>
      )}

      <div className={cn("px-4 pb-4 md:px-5 md:pb-5", isTop3 ? "pt-5 md:pt-6" : "pt-4 md:pt-5")}>
        {/* ==================== DESKTOP (md+) ==================== */}
        <div className="hidden md:flex gap-4 items-start">
          {/* Rank — katta, chiroyli */}
          <div className="flex flex-col items-center justify-start shrink-0 w-14 select-none">
            <span
              className={cn(
                "font-extrabold tabular-nums leading-none",
                isTop1 ? "text-[44px] text-[#d97b29] drop-shadow-sm" : isTop3 ? "text-[40px] text-[#d97b29]" : "text-[34px] text-[#c4b5a1]"
              )}
            >
              {displayPosition}
            </span>
            <span
              className={cn(
                "text-[9px] font-extrabold uppercase tracking-widest mt-1.5",
                isTop3 ? "text-[#d97b29]/70" : "text-[#c4b5a1]"
              )}
            >
              {t("card.rank")}
            </span>
            {showGlobalChip && (
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-[#94836f] dark:text-[#8a7a68] bg-[#f6efe6] dark:bg-[#2b241b] px-2 py-0.5 rounded-full">
                <Globe className="w-2.5 h-2.5" />
                {t("card.global")} {globalPosition}
              </span>
            )}
          </div>

          <ProfileAvatar
            name={profile.name}
            imageUrl={profile.imageUrl}
            size={64}
            className="rounded-2xl mt-1 ring-1 ring-black/5"
          />

          {/* Ma'lumot */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap pr-20">
              <h3
                className={cn(
                  "font-extrabold text-[#241c14] dark:text-[#f2ebe2] leading-tight",
                  isTop3 ? "text-xl" : "text-base"
                )}
              >
                {profile.name}
              </h3>
              {badge}
              <ExternalLink className="w-3.5 h-3.5 text-[#d5c8b8] group-hover:text-[#d97b29] transition-colors shrink-0" />
            </div>

            <p
              className={cn(
                "text-[#6b5d4d] dark:text-[#a3937f] mt-1.5 leading-relaxed",
                isTop3 ? "text-[15px] line-clamp-2" : "text-sm line-clamp-2"
              )}
            >
              {profile.description}
            </p>

            {/* Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span className="text-[11px] font-bold text-[#b25e14] bg-[#fdeedd] dark:bg-[#3a2c1c] px-2.5 py-1 rounded-full">
                {profile.categoryGroup ? `${profile.categoryGroup} · ${profile.categoryName}` : profile.categoryName}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#574634] dark:text-[#c9bba7] bg-[#f6efe6] dark:bg-[#2b241b] px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {profile.city}
              </span>
            </div>

            {/* Statistika — ikonkali mini-qator */}
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-3 text-[12px] text-[#94836f] dark:text-[#8a7a68] font-semibold">
              {profile.reviewsCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <StarRating value={profile.avgRating} size={12} />
                  <span className="font-extrabold text-[#574634] dark:text-[#c9bba7]">{profile.avgRating}</span>
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
              <span className="text-[#c4b5a1]">·</span>
              <span>{timeAgo(profile.createdAt, lang)}</span>
            </div>
          </div>

          {/* Narx + CTA — o'ng blok */}
          <div className="flex flex-col items-end justify-between gap-3 shrink-0 min-w-[170px] max-w-[210px]">
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#c4b5a1] leading-none">
                {t("card.bidAmount")}
              </p>
              <p
                className={cn(
                  "font-extrabold tabular-nums text-[#241c14] dark:text-[#f2ebe2] mt-1.5 leading-tight",
                  isTop3 ? "text-2xl" : "text-xl"
                )}
              >
                {formatSom(profile.totalBid, lang)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {reviewsBtn}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 text-xs font-extrabold rounded-xl border-2 transition-all whitespace-nowrap",
                  isTop3
                    ? "border-[#d97b29] bg-[#d97b29] text-white hover:bg-[#c2691f] hover:border-[#c2691f] shadow-md shadow-[#d97b29]/25"
                    : "border-[#e8ddd0] text-[#574634] dark:text-[#c9bba7] bg-white hover:bg-[#fdeedd] dark:bg-[#3a2c1c] hover:text-[#b25e14] hover:border-[#f0d5b8]"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTakeSpot(globalPosition);
                }}
                aria-label={`${t("card.takeSpot")} ${globalPosition} — ${priceLabel}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {t("card.takeSpot")}
                <span className={isTop3 ? "text-[#ffe3c2]" : "text-[#d97b29]"}>{priceLabel}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ==================== MOBIL (<md) ==================== */}
        <div className="md:hidden">
          {/* 1-qator: avatar + nom + rank */}
          <div className="flex items-start gap-3">
            <ProfileAvatar name={profile.name} imageUrl={profile.imageUrl} size={46} className="rounded-2xl ring-1 ring-black/5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    "font-extrabold text-[#241c14] dark:text-[#f2ebe2] leading-tight min-w-0",
                    isTop3 ? "text-base" : "text-[15px]"
                  )}
                >
                  {profile.name}
                </h3>
                <div className="flex items-center gap-1 shrink-0 -mt-0.5">
                  {badge}
                  <span
                    className={cn(
                      "font-extrabold tabular-nums leading-none",
                      isTop3 ? "text-[26px] text-[#d97b29]" : "text-[22px] text-[#c4b5a1]"
                    )}
                  >
                    {displayPosition}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                {showGlobalChip && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#94836f] dark:text-[#8a7a68] bg-[#f6efe6] dark:bg-[#2b241b] px-1.5 py-0.5 rounded-full">
                    <Globe className="w-2.5 h-2.5" />
                    {t("card.global")} {globalPosition}
                  </span>
                )}
                <ExternalLink className="w-3 h-3 text-[#d5c8b8]" />
              </div>
            </div>
          </div>

          {/* 2-qator: tavsif */}
          <p className="text-[13px] text-[#6b5d4d] dark:text-[#a3937f] mt-2.5 leading-relaxed line-clamp-2">
            {profile.description}
          </p>

          {/* 3-qator: chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            <span className="text-[10px] font-bold text-[#b25e14] bg-[#fdeedd] dark:bg-[#3a2c1c] px-2 py-0.5 rounded-full max-w-[60%] truncate">
              {profile.categoryName}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#574634] dark:text-[#c9bba7] bg-[#f6efe6] dark:bg-[#2b241b] px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5" />
              {profile.city}
            </span>
          </div>

          {/* 4-qator: statistika + narx */}
          <div className="flex items-center justify-between gap-2 mt-3 pb-2.5 border-b border-dashed border-[#f0e6da]">
            <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-[11px] text-[#94836f] dark:text-[#8a7a68] font-semibold">
              {profile.reviewsCount > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-[#d97b29] text-[#d97b29]" />
                  <span className="font-extrabold text-[#574634] dark:text-[#c9bba7]">{profile.avgRating}</span>
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
            </div>
            <span className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] tabular-nums text-[15px] shrink-0">
              {formatSom(profile.totalBid, lang)}
            </span>
          </div>

          {/* 5-qator: CTA + sharh */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTakeSpot(globalPosition);
              }}
              aria-label={`${t("card.takeSpot")} ${globalPosition} — ${priceLabel}`}
              className={cn(
                "flex-1 min-w-0 h-12 rounded-xl font-extrabold px-3 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-[0.98]",
                isTop3
                  ? "bg-[#d97b29] hover:bg-[#c2691f] text-white shadow-md shadow-[#d97b29]/25"
                  : "border-2 border-[#e8ddd0] text-[#574634] dark:text-[#c9bba7] bg-white hover:bg-[#fdeedd] dark:bg-[#3a2c1c] hover:text-[#b25e14] hover:border-[#f0d5b8]"
              )}
            >
              <span className="flex items-center gap-1.5 text-[12px] leading-none">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                {t("card.takeSpot")}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-none tabular-nums whitespace-nowrap",
                  isTop3 ? "text-[#ffe3c2]" : "text-[#d97b29]"
                )}
              >
                {priceLabel}
                {promoActive && " · -50%"}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(profile.id);
              }}
              className="h-11 px-3 rounded-xl border-2 border-[#e8ddd0] bg-white text-[#d97b29] hover:bg-[#fdeedd] dark:bg-[#3a2c1c] font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label={t("reviews.leave")}
              title={t("reviews.leave")}
            >
              <MessageCircle className="w-4 h-4" />
              {profile.reviewsCount > 0 ? profile.reviewsCount : "+"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
