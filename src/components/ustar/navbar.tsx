"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap, Briefcase, Info, ScrollText, Plus, Menu, X, Trophy, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n, LANGS } from "@/lib/ustar/i18n";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { view, setView, setPool, pool, setEduSubFilter } = useUstarStore();
  const { t, lang, setLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Tugatish (click outside)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goHomeTab = (p: "education" | "it") => {
    setPool(p);
    setEduSubFilter("all");
    setView({ name: "home" });
  };

  const links = [
    { label: t("nav.home"), icon: Trophy, active: view.name === "home", onClick: () => goHomeTab(pool) },
    { label: t("nav.about"), icon: Info, active: view.name === "about", onClick: () => setView({ name: "about" }) },
    { label: t("nav.rules"), icon: ScrollText, active: view.name === "rules", onClick: () => setView({ name: "rules" }) },
  ];

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];

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
            { }
            <img
              src="/logo-96.png"
              alt="TopBid"
              className="h-9 w-9 md:h-10 md:w-10 object-contain group-hover:scale-105 transition-transform"
            />
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

          <div className="flex items-center gap-1.5">
            {/* Til almashtirgich */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 h-11 px-2 rounded-lg text-[#574634] hover:bg-[#f6efe6] font-extrabold text-xs cursor-pointer transition-colors"
                aria-label={t("nav.language")}
                aria-expanded={langOpen}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang.short}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#e8ddd0] rounded-xl shadow-lg py-1 min-w-[140px] z-50">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] font-bold cursor-pointer transition-colors",
                        l.code === lang
                          ? "text-[#b25e14] bg-[#fdeedd]"
                          : "text-[#574634] hover:bg-[#f6efe6]"
                      )}
                    >
                      {l.label}
                      {l.code === lang && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setView({ name: "add-profile" })}
              className="bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg shadow-sm shadow-[#d97b29]/25 h-11 md:h-10 px-3 md:px-4 text-sm active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span className="hidden lg:inline">{t("nav.addProfile")}</span>
              <span className="lg:hidden">{t("nav.addProfile")}</span>
            </Button>

            {/* Mobil menyu tugmasi */}
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-[#6b5d4d] hover:bg-[#f6efe6] cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? t("nav.menuClose") : t("nav.menuOpen")}
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
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> {t("home.tabEdu")}
              </button>
              <button
                onClick={() => {
                  goHomeTab("it");
                  setMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold bg-[#f6efe6] text-[#574634] cursor-pointer"
              >
                <Briefcase className="w-4 h-4" /> {t("home.tabIt")}
              </button>
            </div>
            {/* Mobil tillar */}
            <div className="flex gap-1 pt-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "flex-1 px-2 py-2 rounded-lg text-[11px] font-extrabold cursor-pointer",
                    l.code === lang ? "bg-[#d97b29] text-white" : "bg-[#f6efe6] text-[#574634]"
                  )}
                >
                  {l.short}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
