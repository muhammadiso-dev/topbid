"use client";

import { create } from "zustand";
import type { Pool } from "./constants";

export type View =
  | { name: "home" }
  | { name: "add-profile" }
  | { name: "profile-detail"; profileId: string }
  | { name: "about" }
  | { name: "rules" }
  | { name: "admin" };

interface UstarState {
  view: View;
  pool: Pool;
  /** education: "all" | "center" | "individual" */
  eduSubFilter: string;
  categoryFilter: string; // "all" yoki categoryId
  cityFilter: string; // "all" yoki shahar nomi
  /** Fokuslanishi kerak bo'lgan profil (yangi qo'shilganda) */
  highlightId: string | null;
  setView: (view: View) => void;
  goHome: () => void;
  setPool: (pool: Pool) => void;
  setEduSubFilter: (v: string) => void;
  setCategoryFilter: (v: string) => void;
  setCityFilter: (v: string) => void;
  setHighlight: (id: string | null) => void;
}

export const useUstarStore = create<UstarState>((set) => ({
  view: { name: "home" },
  pool: "education",
  eduSubFilter: "all",
  categoryFilter: "all",
  cityFilter: "all",
  highlightId: null,
  setView: (view) => set({ view }),
  goHome: () => set({ view: { name: "home" }, highlightId: null }),
  setPool: (pool) =>
    set({ pool, categoryFilter: "all", eduSubFilter: pool === "education" ? "all" : "all" }),
  setEduSubFilter: (eduSubFilter) => set({ eduSubFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setCityFilter: (cityFilter) => set({ cityFilter }),
  setHighlight: (highlightId) => set({ highlightId }),
}));

/** Brauzer sessiya IDsi (anonim foydalanuvchi identifikatori) */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("ustar_session_id");
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("ustar_session_id", sid);
  }
  return sid;
}
