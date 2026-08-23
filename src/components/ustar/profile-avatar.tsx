"use client";

import { cn } from "@/lib/utils";
import { avatarColor, initials } from "@/lib/ustar/constants";

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}

/** Profil logotipi: rasm bo'lmasa — ismdan initsiallar bilan rangli avatar */
export function ProfileAvatar({ name, imageUrl, size = 48, className }: ProfileAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name} logotipi`}
        width={size}
        height={size}
        className={cn("rounded-xl object-cover shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl shrink-0 flex items-center justify-center text-white font-bold select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: Math.max(12, size * 0.36),
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
