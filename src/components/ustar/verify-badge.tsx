"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/ustar/i18n";
import { Clock3 } from "lucide-react";

interface VerifyBadgeProps {
  status: "none" | "awaiting" | "pending" | "verified";
  size?: number;
  withLabel?: boolean;
  className?: string;
}

/** OLTIN "Tekshirilgan" belgisi — brend rasmi (sariq muhr) bilan */
export function VerifyBadge({ status, size = 16, withLabel = true, className }: VerifyBadgeProps) {
  const { t } = useI18n();

  // ✅ Tekshirilgan — OLTIN muhr (brend rasmi)
  if (status === "verified") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-bold text-[#b45f14] dark:text-[#f0b078] bg-[#fff3df] dark:bg-[#3a2c1c] rounded-full",
          withLabel ? "px-1.5 py-0.5" : "p-0.5",
          className
        )}
        style={withLabel ? { fontSize: Math.max(10, size * 0.65) } : undefined}
        title={t("card.verified")}
      >
        { }
        <img
          src="/verify-badge-48.png"
          alt={t("card.verified")}
          width={size}
          height={size}
          className="shrink-0"
        />
        {withLabel && t("card.verified")}
      </span>
    );
  }

  // ⏳ To'lov kutilmoqda (verifikatsiya uchun)
  if (status === "awaiting") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[#8a6a3a] bg-[#fff8ec] rounded-full",
          withLabel ? "px-1.5 py-0.5" : "p-0.5",
          className
        )}
        style={withLabel ? { fontSize: Math.max(10, size * 0.65) } : undefined}
        title={t("card.awaiting")}
      >
        <Clock3 className="w-3 h-3 shrink-0" style={{ width: size, height: size }} />
        {withLabel && t("card.awaiting")}
      </span>
    );
  }

  // 📄 Hujjat kutilmoqda
  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[#a86a00] bg-[#fff4d6] rounded-full",
          withLabel ? "px-1.5 py-0.5" : "p-0.5",
          className
        )}
        style={withLabel ? { fontSize: Math.max(10, size * 0.65) } : undefined}
        title={t("card.pending")}
      >
        <Clock3 className="shrink-0" style={{ width: size, height: size }} />
        {withLabel && t("card.pending")}
      </span>
    );
  }

  return null;
}
