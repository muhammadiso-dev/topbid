"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/ustar/i18n";

interface VerifyBadgeProps {
  status: "none" | "pending" | "verified";
  size?: number;
  withLabel?: boolean;
  className?: string;
}

/** "Tekshirilgan" belgisi — brend rasmi bilan */
export function VerifyBadge({ status, size = 16, withLabel = true, className }: VerifyBadgeProps) {
  const { t } = useI18n();

  if (status === "verified") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-bold text-[#1d7ed8] bg-[#e8f2fc] rounded-full",
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

  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[#a86a00] bg-[#fff4d6] rounded-full",
          withLabel ? "px-1.5 py-0.5" : "p-0.5",
          className
        )}
        style={withLabel ? { fontSize: Math.max(10, size * 0.65) } : undefined}
        title={t("card.verifiedPending")}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {withLabel && t("card.verifiedPending")}
      </span>
    );
  }

  return null;
}
