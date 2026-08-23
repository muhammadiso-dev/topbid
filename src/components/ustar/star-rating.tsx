"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
  interactive?: boolean;
}

/** Yulduzcha baholash: ko'rsatish yoki kiritish rejimi */
export function StarRating({
  value,
  onChange,
  size = 16,
  className,
  interactive = false,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "Baho (1-5)" : `O'rtacha baho: ${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        const StarEl = (
          <Star
            width={size}
            height={size}
            className={cn(
              "transition-colors",
              filled ? "fill-[#d97b29] text-[#d97b29]" : "fill-transparent text-[#e0d3c2]"
            )}
          />
        );
        if (!interactive) return <span key={i}>{StarEl}</span>;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} yulduz`}
            className="hover:scale-110 transition-transform cursor-pointer"
            onClick={() => onChange?.(i)}
          >
            {StarEl}
          </button>
        );
      })}
    </div>
  );
}
