"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/** Dark/Light mode almashtirgich */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#574634] hover:bg-[#f6efe6] dark:text-[#c4b5a1] dark:hover:bg-[#2b2219] cursor-pointer transition-colors"
      aria-label={isDark ? "Yorug' rejim" : "Tungi rejim"}
      title={isDark ? "Yorug' rejim" : "Tungi rejim"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
