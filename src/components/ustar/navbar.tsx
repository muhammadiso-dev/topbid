"use client";

import { useState } from "react";
import { GraduationCap, Code2, Info, ScrollText, Plus, Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { view, setView, setPool } = useUstarStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {
      label: "Reyting",
      icon: Trophy,
      active: view.name === "home",
      onClick: () => {
        setView({ name: "home" });
        setPool("education");
      },
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
    <header className="sticky top-0 z-40 bg-[#fffdfa]/85 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button
            onClick={() => setView({ name: "home" })}
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="Ustar bosh sahifa"
          >
            <div className="w-8 h-8 rounded-lg bg-[#d97b29] flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              u
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#241c14]">
              ustar
              <span className="text-[#d97b29]">.</span>
            </span>
          </button>

          {/* Desktop navigatsiya */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Asosiy navigatsiya">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
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
              className="bg-[#d97b29] hover:bg-[#c2691f] text-white font-bold rounded-lg shadow-sm h-9 md:h-10 px-3 md:px-4 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Profil qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </Button>

            {/* Mobil menyu tugmasi */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#6b5d4d] hover:bg-[#f6efe6] cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Menyuni yopish" : "Menyuni ochish"}
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
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
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
                  setPool("education");
                  setView({ name: "home" });
                  setMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> Ta'lim
              </button>
              <button
                onClick={() => {
                  setPool("it");
                  setView({ name: "home" });
                  setMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <Code2 className="w-4 h-4" /> IT mutaxassislar
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
