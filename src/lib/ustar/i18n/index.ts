"use client";

import { create } from "zustand";
import { uz } from "./uz";
import { ru } from "./ru";
import { en } from "./en";
import { kk } from "./kk";
import type { Lang } from "./constants-lang";

export type { Lang };

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "uz", label: "O'zbekcha", short: "UZ" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "en", label: "English", short: "EN" },
  { code: "kk", label: "Қазақша", short: "KK" },
];

const DICTS: Record<Lang, Record<string, string>> = { uz, ru, en, kk };

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: "uz",
  setLang: (lang) => {
    set({ lang });
    if (typeof window !== "undefined") {
      localStorage.setItem("topbid_lang", lang);
      document.documentElement.lang = lang;
    }
  },
}));

/** Tarjima funksiyasi: t("card.takeSpot") */
export function makeT(lang: Lang) {
  const dict = DICTS[lang] ?? uz;
  return (key: string): string => dict[key] ?? uz[key] ?? key;
}

/** Hook: til va tarjima funksiyasi */
export function useI18n() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const t = makeT(lang);
  return { lang, setLang, t };
}
