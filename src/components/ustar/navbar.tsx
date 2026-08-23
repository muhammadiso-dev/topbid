"use client";

import { useState } from "react";
import { GraduationCap, Briefcase, Info, ScrollText, Plus, Menu, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { view, setView, setPool, pool, setEduSubFilter } = useUstarStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goHomeTab = (p: "education" | "it") => {
    setPool(p);
    setEduSubFilter("all");
    setView({ name: "home" });
  };

  const links = [
    {
      label: "Reyting",
      icon: Trophy,
      active: view.name === "home",
      onClick: () => goHomeTab(pool),
    },
    {
      label: "Haqida",
      icon: Info,
      active: view.name === "about",
      onClick: () => setView({ name: "about" }),
    },
    {
      label: "Qoidalar",
      icon: ScrollText,
      active: view.name === "rules",
      onClick: () => setView({ name: "rules" }),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fffdfa]/90 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button
            onClick={() => goHomeTab("education")}
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="TopBid bosh sahifa"
          >
            <div className="w-8 h-8 rounded-lg bg-[#d97b29] flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-[#d97b29]/30 group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#241c14]">
              TopBid
              <span className="text-[#d97b29]">.uz</span>
            </span>
          </button>

          {/* Desktop navigatsiya */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Asosiy navigatsiya">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer",
                  l.active
                    ? "text-[#b25e14] bg-[#fdeedd]"
                    : "text-[#6b5d4d] hover:text-[#241c14] hover:bg-[#f6efe6]"
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView({ name: "add-profile" })}
              className="bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg shadow-sm shadow-[#d97b29]/25 h-11 md:h-10 px-3 md:px-4 text-sm active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span className="hidden sm:inline">O'rin olish</span>
              <span className="sm:hidden">O'rin olish</span>
            </Button>

            {/* Mobil menyu tugmasi */}
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-[#6b5d4d] hover:bg-[#f6efe6] cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Menyuni yopish" : "Menyuni ochish"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 flex flex-col gap-1" aria-label="Mobil navigatsiya">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => {
                  l.onClick();
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer",
                  l.active ? "text-[#b25e14] bg-[#fdeedd]" : "text-[#6b5d4d] hover:bg-[#f6efe6]"
                )}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </button>
            ))}
            <div className="flex gap-1 pt-1">
              <button
                onClick={() => {
                  goHomeTab("education");
                  setMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> O'rganish
              </button>
              <button
                onClick={() => {
                  goHomeTab("it");
                  setMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <Briefcase className="w-4 h-4" /> Yollash
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
